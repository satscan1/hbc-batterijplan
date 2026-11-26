"""Sell reserve (2.0.0, wish from GitHub issue #9): what HBC's 'Keep energy in reserve' should be (no Home Assistant imports).

HBC's Sell strategy with 'Sell until: energy reserve' discharges to the grid at full power until the energy above the
cut-off is at or below its helper 'Keep energy in reserve', then switches to its 'Then use' strategy. Batterijplan only
says per quarter *that* HBC sells, not *how much*. With the rule 'Sell reserve automatic' Batterijplan fills that helper
with what the house still needs from the battery until the next cheap moment, so HBC never sells more than the plan means.

All energies here are kWh. ``need`` per quarter is house use minus solar (negative = solar surplus), as in plan.py.
"""
from __future__ import annotations

import math
from collections.abc import Sequence

MIN_DIFF = 0.5  # kWh: write the helper only when it differs at least this much (or one helper step, whichever is larger)
SELL_GOAL_RESERVE = "energy reserve"  # HBC 'Sell until' option this rule works with


def inactive_reason(*, rule_on: bool, contract_dynamic: bool, sell_goal: str | None, live: bool, strategy: str | None,
                    ours_charge: bool) -> str:
    """Why the rule does not steer now ("" = active). Active only with the rule on, a Dynamic contract, HBC 'Sell until' on
    'energy reserve', Live on and HBC on Dynamic. A Charge Batterijplan itself set for a charge block (rule 'charge in any cheap
    quarter', ``ours_charge``) counts as Dynamic, so the reserve does not go back and forth around such a block."""
    if not rule_on:
        return "regel uit"
    if not contract_dynamic:
        return "geen dynamisch contract"
    if sell_goal != SELL_GOAL_RESERVE:
        return "HBC 'Sell until' staat niet op 'energy reserve'"
    if not live:
        return "live uit"
    if strategy != "Dynamic" and not ours_charge:
        return "HBC niet op Dynamic"
    return ""


def need_until_cheap(needs: Sequence[float], cheap: Sequence[bool], start: int, top: float) -> float:
    """Energy the battery must still hold at quarter ``start`` to cover the house until the next cheap quarter.

    Walks forward from ``start`` and stops at the first cheap quarter AFTER it. The answer is the worst running
    deficit. Solar surplus refills, at most up to ``top``, so a sunny afternoon covers a later evening."""
    level = 0.0
    worst = 0.0
    for j in range(start, len(needs)):
        if j > start and cheap[j]:
            break
        level = min(top, level - float(needs[j]))
        worst = min(worst, level)
    return -worst


def per_quarter(needs: Sequence[float], cheap: Sequence[bool], top: float) -> list[float]:
    """need_until_cheap for every quarter (the floor the plan uses for a sell quarter)."""
    return [round(need_until_cheap(needs, cheap, i, top), 3) for i in range(len(needs))]


def helper_value(need: float, margin: float, step: float, lo: float, hi: float, usable: float) -> float:
    """Value for HBC's helper: need plus the own margin, rounded UP to the helper step, within the helper's min/max and
    the usable capacity (HBC's own Sell flow clamps the helper to the usable energy, so a higher value would come back)."""
    step = step if step and step > 0 else 0.1
    v = max(float(need), 0.0) + max(float(margin), 0.0)
    v = math.ceil(v / step - 1e-9) * step
    top = min(hi if hi and hi > 0 else v, usable if usable and usable > 0 else v)
    top = math.floor(top / step + 1e-9) * step
    v = min(v, top)
    v = max(v, lo or 0.0)
    return round(v, 3)


def should_write(current: float | None, wanted: float, step: float, quarter: int | None, last_quarter: int | None) -> bool:
    """Write only on a real difference (>= MIN_DIFF or one helper step) and at most once per plan quarter."""
    if quarter is not None and quarter == last_quarter:
        return False
    if current is None:
        return True
    return abs(float(current) - float(wanted)) >= max(MIN_DIFF, step or 0.0) - 1e-9


def then_action(then_use: str | None) -> str:
    """Plan action after HBC reached the reserve, from HBC's 'Then use': self-consumption / zero import still discharge
    to the house (O); Charge PV, Standby and Full stop keep the charge (H)."""
    return "O" if str(then_use or "") in ("Self-consumption", "Zero import") else "H"
