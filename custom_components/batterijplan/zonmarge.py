"""Solar forecast with a risk margin that grows with the lead time (2.0.0, no Home Assistant or HBC imports).

Solcast gives per half hour a normal estimate (``pv_estimate``, P50) and a cautious one (``pv_estimate10``, P10). Up to 1.x
Batterijplan used P10 everywhere. A forecast for the next hours is far better than one for tomorrow afternoon, so the margin
now grows with the distance in time:

  * now (lead 0 h)        : halfway between P50 and P10 (``NEAR`` = 0.5 of the gap to P10),
  * up to ``FULL_AT_H``   : sliding to the full P10,
  * beyond ``FULL_AT_H``  : P10 minus ``EXTRA_PER_DAY`` per further day (never below ``FLOOR`` x P10); used for the days after
                            tomorrow (dark days, see donker.py).

Without P10 (only one estimate) the same weights are applied to that estimate with an assumed P10 of ``P10_FALLBACK`` x P50.
Plain types only, so Batterijplan Pro can take it over.
"""
from __future__ import annotations

NEAR = 0.5  # weight of the cautious estimate at lead 0 h (0 = P50, 1 = P10)
FULL_AT_H = 24.0  # from this lead time on the full P10 counts
EXTRA_PER_DAY = 0.10  # beyond FULL_AT_H: 10 % less per further day
FLOOR = 0.70  # never below 70 % of P10
P10_FALLBACK = 0.6  # assumed P10 / P50 when only one estimate is known


def weight(lead_h: float) -> float:
    """Weight of the cautious estimate (0 = P50, 1 = P10) at ``lead_h`` hours ahead."""
    if lead_h <= 0:
        return NEAR
    return NEAR + (1.0 - NEAR) * min(lead_h / FULL_AT_H, 1.0)


def far_factor(lead_h: float) -> float:
    """Extra factor on P10 beyond FULL_AT_H (1.0 up to there)."""
    if lead_h <= FULL_AT_H:
        return 1.0
    return max(1.0 - EXTRA_PER_DAY * (lead_h - FULL_AT_H) / 24.0, FLOOR)


def cautious(p50: float | None, p10: float | None, lead_h: float) -> float:
    """Solar (kW or kWh, same unit as the inputs) the plan counts on at ``lead_h`` hours ahead. Never negative, never above P50."""
    a = max(float(p50 or 0.0), 0.0)
    b = float(p10) if p10 is not None else a * P10_FALLBACK
    b = min(max(b, 0.0), a) if a > 0 else max(b, 0.0)
    v = a - weight(lead_h) * (a - b)
    return max(v * far_factor(lead_h), 0.0)


def series(p50: dict[int, float], p10: dict[int, float], now_ts: float) -> dict[int, float]:
    """Per half-hour start ts: the value the plan counts on (lead time measured from ``now_ts`` to the middle of the half hour)."""
    out: dict[int, float] = {}
    for ts in set(p50) | set(p10):
        lead = (ts + 900 - now_ts) / 3600.0
        out[ts] = round(cautious(p50.get(ts, p10.get(ts, 0.0)), p10.get(ts), lead), 4)
    return out


def day_totals(p50: dict[int, float], p10: dict[int, float], now_ts: float, day_of) -> dict[object, float]:
    """kWh per day (``day_of(ts)`` gives the day key) with the risk margin applied; half-hour values are kW, so x 0.5 h."""
    s = series(p50, p10, now_ts)
    out: dict[object, float] = {}
    for ts, kw in s.items():
        if ts + 1800 <= now_ts:
            continue
        d = day_of(ts)
        out[d] = out.get(d, 0.0) + kw * 0.5
    return {k: round(v, 3) for k, v in out.items()}
