"""Dark days: keep charge for several days with hardly any sun (2.0.0, no Home Assistant or HBC imports).

The plan only sees the quarters with a known price (at most ~36 h). Solcast also forecasts the days after that (day 3 to 7).
When at least ``MIN_DAYS`` days in a row right after the price horizon bring hardly any sun (solar below ``DARK_SHARE`` of the
expected house use, with the risk margin of zonmarge.py), the battery should not end the horizon empty: Batterijplan then gives
the plan a FLOOR for the charge at the end of the horizon, equal to the expected shortfall of those days (at most ``MAX_DAYS``,
never more than the usable capacity).

The floor is not a hard rule. In the plan (plan.py) each kWh below the floor is worth the AVERAGE purchase price of the horizon
instead of the cheapest one: buying it later costs about the average. So the plan only charges extra from the grid in quarters
that are cheaper than that, picks the cheapest ones itself, and in Flanders keeps under the peak limit (the capacity penalty
stays part of the same calculation). Plain types only, so Batterijplan Pro can take it over.
"""
from __future__ import annotations

from collections.abc import Hashable, Sequence

DARK_SHARE = 0.25  # a day is dark when the (cautious) solar is below 25 % of the expected house use
MIN_DAYS = 2  # at least two dark days in a row
MAX_DAYS = 3  # look at most three days past the price horizon


def is_dark(solar_kwh: float, use_kwh: float) -> bool:
    return use_kwh > 0 and solar_kwh < DARK_SHARE * use_kwh


def floor(days: Sequence[tuple[Hashable, float | None, float]], usable_kwh: float) -> dict:
    """Charge floor (kWh above the reserve) at the end of the price horizon.

    ``days``: (day key, cautious solar kWh or None when unknown, expected house use kWh) for the days right AFTER the price
    horizon, in order. Counting stops at the first day that is not dark or has no forecast.
    Returns {"vloer": kWh, "dagen": number of dark days counted, "tekort": shortfall kWh of those days, "reden": text}."""
    n = 0
    short = 0.0
    for _key, solar, use in list(days)[:MAX_DAYS]:
        if solar is None or not is_dark(float(solar), float(use)):
            break
        n += 1
        short += max(float(use) - float(solar), 0.0)
    if not days or days[0][1] is None:
        return {"vloer": 0.0, "dagen": 0, "tekort": 0.0, "reden": "geen zonvoorspelling na de prijzen"}
    if n < MIN_DAYS:
        return {"vloer": 0.0, "dagen": n, "tekort": round(short, 2), "reden": "geen donkere dagen"}
    return {"vloer": round(min(short, max(usable_kwh, 0.0)), 2), "dagen": n, "tekort": round(short, 2), "reden": "donkere dagen"}


def end_value(s: float, pmin: float, plater: float, vloer: float) -> float:
    """Value (EUR, as a negative cost) of ending the horizon with ``s`` kWh: each kWh at the cheapest price, the part below the
    floor at the later (average) price. With ``vloer`` = 0 this is exactly the earlier end value ``-pmin x s``."""
    extra = max(plater - pmin, 0.0)
    return -(pmin * s + extra * min(max(s, 0.0), max(vloer, 0.0)))
