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
