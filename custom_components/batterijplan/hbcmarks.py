"""Exact replica of HBC's price marking (no Home Assistant imports).

Port of the Node-RED function node "Determine dynamic strategy" of Home Battery Control (HBC v4.15.1),
section "Mark intervals: pair extremes inward, independently per calendar day":

  * quarters are grouped per LOCAL calendar day (key = year-month-day in the local time zone of the
    Node-RED host; here the Home Assistant time zone),
  * per day the quarters are sorted by price ascending (stable, so equal prices keep their time order),
  * ``lo`` walks up from the cheapest, ``hi`` walks down from the most expensive quarter,
  * while ``lo < hi`` and price[hi] - price[lo] >= min_delta (whole cents, ``parseInt``):
      mark low  when (lows marked today)  < round(cheapest_hrs  * quarters per hour)   (0 hours = no cap)
      mark high when (highs marked today) < round(expensive_hrs * quarters per hour)   (0 hours = no cap)
      neither possible: stop; otherwise mark and move both pointers inward,
  * a spread below min_delta ends the day.

``round`` is JavaScript's Math.round (half up). Verified against the live marks of
``sensor.hbc_energy_prices_data`` in tests/test_hbcmarks.py.
"""
from __future__ import annotations

import math
from collections.abc import Hashable, Sequence
from typing import Any


def js_round(x: float) -> int:
    """JavaScript Math.round: .5 rounds up (Python's round() rounds half to even)."""
    return int(math.floor(x + 0.5))


def min_delta_cents(value: Any) -> int:
    """``parseInt(value) || 0``: whole cents, cut off (6.9 -> 6), unusable -> 0."""
    try:
        return int(float(value))
    except (TypeError, ValueError, OverflowError):
        return 0


def hours_cap(value: Any) -> float:
    """``parseFloat(value) || 0``: unusable or negative -> 0 (= no cap)."""
    try:
        v = float(value)
    except (TypeError, ValueError):
        return 0.0
    return v if v > 0 and math.isfinite(v) else 0.0


def cap_quarters(hours: float, per_hour: float) -> float:
    """Cap on the number of marks per day, in quarters (infinity = no cap)."""
    return js_round(hours * per_hour) if hours > 0 else math.inf


def mark_quarters(
    prices: Sequence[float],
    day_keys: Sequence[Hashable],
    min_delta: Any,
    cheapest_hrs: Any,
    expensive_hrs: Any,
    per_hour: float = 4,
) -> list[str | None]:
    """Marks ('low' / 'high' / None) per quarter, same order as ``prices``.

    ``day_keys[i]`` is the local calendar day of quarter i."""
    n = len(prices)
    md = min_delta_cents(min_delta)
    max_low = cap_quarters(hours_cap(cheapest_hrs), per_hour)
    max_high = cap_quarters(hours_cap(expensive_hrs), per_hour)
    buckets: dict[Hashable, list[int]] = {}
    for i in range(n):
        buckets.setdefault(day_keys[i], []).append(i)
    marks: list[str | None] = [None] * n
    for idx in buckets.values():
        order = sorted(idx, key=lambda i: prices[i])  # stable on ties, like JS Array.sort
        lo, hi = 0, len(order) - 1
        low_today = high_today = 0
        while lo < hi:
            lo_i, hi_i = order[lo], order[hi]
            if prices[hi_i] - prices[lo_i] >= md:
                mark_low = low_today < max_low
                mark_high = high_today < max_high
                if not mark_low and not mark_high:
                    break
                if mark_low:
                    marks[lo_i] = "low"
                    low_today += 1
                if mark_high:
                    marks[hi_i] = "high"
                    high_today += 1
                lo += 1
                hi -= 1
            else:
                break
    return marks
