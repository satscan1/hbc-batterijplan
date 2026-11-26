"""Consumption profile per weekday, as a self-test (2.0.0, no Home Assistant or HBC imports).

Batterijplan's normal profile (consumption.py) is one average per hour of the day over the last 7 days. Many households use
more on some days (home office, washing day, weekend). This module learns a second profile: per weekday x hour (7 x 24), each
cell sliding over the last ``MAX_N`` quarters of that weekday-hour (4 quarters per hour, so 4 weeks).

It is a SELF-TEST first. Every quarter, BEFORE the measured value is learned, both profiles give their forecast for that quarter;
afterwards the error of both is written down (out of sample: the measurement was not part of either forecast). The weekday
profile is only used when over the last ``WINDOW`` scored quarters its mean error is at least ``BETTER`` lower than that of the
normal profile, with at least ``MIN_SCORED`` scored quarters; otherwise the normal profile stays. A cell with fewer than
``MIN_N`` measurements falls back to the normal profile.

Kept in Batterijplan's own storage file, never in the recorder. Plain types only, so Batterijplan Pro can take it over.
"""
from __future__ import annotations

from typing import Any

MAX_N = 16  # measurements per weekday-hour cell (4 quarters x 4 weeks), then sliding
MIN_N = 8  # at least 2 weeks of that weekday-hour before the cell forecasts
WINDOW = 14 * 96  # scored quarters kept (14 days)
MIN_SCORED = 7 * 96  # at least 7 days of scores before the weekday profile can win
BETTER = 0.90  # weekday profile must have at most 90 % of the error of the normal profile


def empty() -> dict[str, Any]:
    return {"w": [[None] * 24 for _ in range(7)], "n": [[0] * 24 for _ in range(7)], "ew": [], "eu": []}


def load(d: Any) -> dict[str, Any]:
    """From stored data; anything malformed starts empty."""
    st = empty()
    if not isinstance(d, dict):
        return st
    w, n = d.get("w"), d.get("n")
    if isinstance(w, list) and len(w) == 7 and all(isinstance(r, list) and len(r) == 24 for r in w):
        st["w"] = [[float(x) if isinstance(x, (int, float)) else None for x in r] for r in w]
    if isinstance(n, list) and len(n) == 7 and all(isinstance(r, list) and len(r) == 24 for r in n):
        st["n"] = [[int(x) if isinstance(x, (int, float)) else 0 for x in r] for r in n]
    for k in ("ew", "eu"):
        v = d.get(k)
        if isinstance(v, list):
            st[k] = [float(x) for x in v if isinstance(x, (int, float))][-WINDOW:]
    if len(st["ew"]) != len(st["eu"]):
        st["ew"], st["eu"] = [], []
    return st


def cell(st: dict[str, Any], weekday: int, hour: int) -> float | None:
    """Forecast W of the weekday profile, None while the cell has fewer than MIN_N measurements."""
    if st["n"][weekday][hour] < MIN_N:
        return None
    return st["w"][weekday][hour]


def learn(st: dict[str, Any], weekday: int, hour: int, measured_w: float | None, normal_w: float | None) -> None:
    """One quarter: first score both forecasts (when both exist), then learn the measurement."""
    if measured_w is None or measured_w < 0:
        return
    wp = cell(st, weekday, hour)
    if wp is not None and isinstance(normal_w, (int, float)):
        st["ew"].append(round(abs(wp - measured_w), 1))
        st["eu"].append(round(abs(float(normal_w) - measured_w), 1))
        del st["ew"][:-WINDOW]
        del st["eu"][:-WINDOW]
    n = st["n"][weekday][hour]
    old = st["w"][weekday][hour]
    if old is None or n == 0:
        st["w"][weekday][hour] = float(measured_w)
    else:
        k = min(n + 1, MAX_N)
        st["w"][weekday][hour] = old + (measured_w - old) / k
    st["n"][weekday][hour] = min(n + 1, MAX_N)


def verdict(st: dict[str, Any]) -> dict[str, Any]:
    """{"actief": use the weekday profile, "fout_week": mean error W, "fout_7d": mean error W of the normal profile, "kwartieren": scored}."""
    k = len(st["ew"])
    if k == 0:
        return {"actief": False, "fout_week": None, "fout_7d": None, "kwartieren": 0, "reden": "nog aan het leren"}
    fw = sum(st["ew"]) / k
    fu = sum(st["eu"]) / k
    if k < MIN_SCORED:
        reden, on = "nog te weinig vergelijkingen", False
    elif fu > 0 and fw <= BETTER * fu:
        reden, on = "weekdagprofiel voorspelt beter", True
    else:
        reden, on = "gewone profiel voorspelt even goed of beter", False
    return {"actief": on, "fout_week": round(fw), "fout_7d": round(fu), "kwartieren": k, "reden": reden}


def table(st: dict[str, Any], normal: list[float | None]) -> list[list[float | None]]:
    """7 x 24 profile to plan with when active: the weekday cell, or the normal hour value where the cell is not ready."""
    return [[cell(st, d, h) if cell(st, d, h) is not None else (normal[h] if len(normal) == 24 else None) for h in range(24)]
            for d in range(7)]
