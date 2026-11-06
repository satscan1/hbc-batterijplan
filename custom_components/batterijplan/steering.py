"""Steering rules: which HBC mode to set for the coming quarter (no Home Assistant imports).

HBC (Home Battery Control, Dynamic strategy) has one mode per price class. Batterijplan
sets the mode of the class the coming quarter belongs to, according to its plan.
"""
from __future__ import annotations

# select entity of HBC per price class (class as HBC itself marks the quarter)
HBC_SELECTS = {
    "duur": "input_select.house_battery_strategy_dynamic_expensive",
    "goedkoop": "input_select.house_battery_strategy_dynamic_cheapest",
    "gewoon": "input_select.house_battery_strategy_dynamic_default",
}
# your own modes, restored when Live goes off or HBC leaves Dynamic (the pre-Batterijplan defaults)
HBC_DEFAULT_MODES = {"duur": "Self-consumption", "gewoon": "Charge PV", "goedkoop": "Charge"}

ACTION_TEXT = {
    "L": "charge from the grid", "O": "discharge", "H": "hold", "V": "feed in", "Z": "solar only",
}


def price_class(kind: int | None) -> str:
    """Point kind (1 HBC expensive, 2 extra expensive, -1 cheap, 0 normal) -> HBC class.

    Only a quarter HBC itself marks expensive or cheap changes HBC's mode for that class;
    an 'extra expensive' quarter (kind 2) is a normal one for HBC."""
    if kind is None:
        return "geen"
    return "duur" if kind == 1 else ("goedkoop" if kind == -1 else "gewoon")


def hbc_mode(cls: str, action: str) -> str:
    """HBC mode for price class ``cls`` and plan action (L, O, H, V, Z)."""
    if cls == "duur":
        return {"H": "Standby / peak shave", "V": "Sell"}.get(action, "Self-consumption")
    if cls == "goedkoop":
        return {"L": "Charge", "H": "Standby / peak shave"}.get(action, "Charge PV")
    # normal: HBC has no Charge in this class
    return {"O": "Self-consumption", "V": "Self-consumption", "H": "Standby / peak shave"}.get(action, "Charge PV")


def steer(first_point: list | None) -> tuple[str, str, str] | None:
    """(class, select entity id, mode) for the first plan point, or None without a plan."""
    if not first_point:
        return None
    cls = price_class(first_point[2])
    return cls, HBC_SELECTS[cls], hbc_mode(cls, first_point[5])


QUARTER = 900


def charge_target(points: list | None, stored_now: float | None) -> dict | None:
    """Grid-charge target for HBC: kWh above the discharge cut-off planned at the end of the coming
    consecutive 'L' block. Without an 'L' in the plan nothing more is to be charged: the target is
    the energy stored now. None without a plan or without a known level."""
    if not points or stored_now is None:
        return None
    first = next((i for i, p in enumerate(points) if p[5] == "L"), None)
    if first is None:
        return {"doel": max(stored_now, 0.0), "start": None, "einde": None}
    last = first
    while last + 1 < len(points) and points[last + 1][5] == "L" and points[last + 1][0] - points[last][0] == QUARTER:
        last += 1
    return {"doel": max(float(points[last][6]), 0.0), "start": points[first][0], "einde": points[last][0] + QUARTER}


def hbc_forecast_value(target: float, reserved: float, hbc_max: float) -> float:
    """Value for HBC's 'solar forecast' so that HBC's own rule reaches ``target``.

    HBC: surplus = max(forecast - reserved, 0); wanted = max(max_energy - surplus, 0); done when
    available >= wanted. With forecast = reserved + max_energy - target: wanted = target (a target at or
    above max_energy gives surplus 0, so a full charge)."""
    return round(max(reserved + hbc_max - max(target, 0.0), 0.0), 2)


def solar_for_hbc(*, live: bool, dynamic: bool, rule_charge: bool, points: list | None, stored_now: float | None,
                  reserved: float | None, hbc_max: float | None, source_value: float | None) -> dict:
    """What the sensor 'solar forecast for HBC' reports.

    Steering (charge target) only when Live is on, HBC is on Dynamic, the rule 'charge' is on, there is
    a plan and reserve and maximum are known. In every other case it is a PASS-THROUGH: the value of the
    real forecast source 1:1, so HBC behaves exactly as without Batterijplan. ``value`` is None only when
    the real source itself has no number."""
    if not live:
        reason = "live uit"
    elif not dynamic:
        reason = "HBC niet op Dynamic"
    elif not rule_charge:
        reason = "regel laden uit"
    elif not points or stored_now is None:
        reason = "geen plan"
    elif reserved is None or reserved < 0 or hbc_max is None or hbc_max <= 1:
        reason = "reserve of maximum onbekend"
    else:
        reason = ""
    tgt = None if reason else charge_target(points, stored_now)
    if tgt is None:
        return {"value": source_value, "modus": "doorgifte", "reden": reason or "geen plan"}
    return {"value": hbc_forecast_value(tgt["doel"], reserved, hbc_max), "modus": "laaddoel", "reden": "", "tgt": tgt}
