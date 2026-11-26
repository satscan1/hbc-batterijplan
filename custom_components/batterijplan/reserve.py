"""Reserve that learns (2.0.0, no Home Assistant or HBC imports).

The plan keeps a reserve in the battery that it never plans to use (the 'margin'). A fixed small reserve is fine when the
forecasts of house use and solar are good; while they are still unknown or poor a larger reserve prevents buying at an expensive
moment because the plan counted on charge that was not there. So the reserve starts ample and goes down as both forecasts prove
reliable:

    share  = START_SHARE - (START_SHARE - MIN_SHARE) x reliability        (reliability 0..1, the weaker of the two)
    reserve = share x usable capacity, at least your own margin, at most the usable capacity

An unknown reliability counts as 0 (start ample). Plain types only, so Batterijplan Pro can take it over.
"""
from __future__ import annotations

START_SHARE = 0.20  # 20 % of the usable capacity while nothing is known
MIN_SHARE = 0.03  # 3 % with perfect forecasts


def learned(usable_kwh: float, own_margin_kwh: float, use_pct: float | None, solar_pct: float | None) -> dict:
    """{"kwh": reserve to plan with, "eigen": your own margin, "geleerd": learned value before the minimum, "betrouwbaar": % used}."""
    usable = max(float(usable_kwh), 0.0)
    own = max(float(own_margin_kwh), 0.0)
    known = [float(p) for p in (use_pct, solar_pct)] if use_pct is not None and solar_pct is not None else []
    rel = min(max(min(known) / 100.0, 0.0), 1.0) if known else 0.0
    share = START_SHARE - (START_SHARE - MIN_SHARE) * rel
    geleerd = share * usable
    kwh = min(max(geleerd, own), usable)
    return {"kwh": round(kwh, 2), "eigen": round(own, 2), "geleerd": round(geleerd, 2),
            "betrouwbaar": round(rel * 100) if known else None}
