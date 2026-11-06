"""Advice for the HBC settings 'cheapest hours' and 'expensive hours' (no Home Assistant imports).

History: per quarter of the last days the bare HBC price, the measured house use and the measured solar.
Replay: the last 7 complete days are planned again with the Batterijplan planner (plan.plan_cost, Live on,
current rules) for a coarse grid of (cheapest_hrs, expensive_hrs) pairs. HBC's marking is replicated
exactly (hbcmarks.py). Cost of a day = grid cost of the plan minus the energy left in the battery valued at
the day's cheapest purchase price (same convention as the 'earnings' of the plan); every day starts empty.
The pair with the lowest total cost wins; a difference below ``EPS`` euro over the 7 days is a tie and the
pair closest to the current setting wins.
"""
from __future__ import annotations

import math
import time
from dataclasses import replace
from datetime import date, datetime
from typing import Any
from zoneinfo import ZoneInfo

try:
    from . import hbcmarks, plan
except ImportError:  # plain import in the offline tests
    import hbcmarks  # type: ignore[no-redef]
    import plan  # type: ignore[no-redef]

QUARTER = 900
DAYS = 7  # days that are replayed (and needed before the first advice)
KEEP_DAYS = 10  # days kept in the history
EPS = 0.01  # euro over the replayed days: smaller differences are ties
COVER = 0.9  # share of the quarters of a day that must have been measured
MAX_HOURS = 12  # coarse grid goes up to this many hours
GRID_STEP_KWH = 0.25  # level grid of the planner during the replay (the live plan uses 0.05); same picks as 0.1, 2.4x faster


# ---- history ---------------------------------------------------------------------------------
def day_of(ts: int, tz: ZoneInfo) -> date:
    return datetime.fromtimestamp(ts, tz).date()


def day_quarters(day: date, tz: ZoneInfo) -> list[int]:
    """Start timestamps of all quarters of one local calendar day (92 / 96 / 100 on a time change day)."""
    start = int(datetime(day.year, day.month, day.day, tzinfo=tz).timestamp())
    out = []
    t = start
    while day_of(t, tz) == day:
        out.append(t)
        t += QUARTER
    return out


def prune(hist: dict[str, list], today: date, tz: ZoneInfo, keep: int = KEEP_DAYS) -> None:
    """Drop quarters of days older than ``keep`` days before today (in place)."""
    first = today.toordinal() - keep
    for k in [k for k in hist if day_of(int(k), tz).toordinal() < first]:
        del hist[k]


def complete_days(hist: dict[str, list], today: date, tz: ZoneInfo) -> list[date]:
    """Past days with every price known and (almost) every house and solar measurement, oldest first."""
    by_day: dict[date, list[list]] = {}
    for k, row in hist.items():
        d = day_of(int(k), tz)
        if d < today:
            by_day.setdefault(d, []).append(row)
    ok = []
    for d, rows in by_day.items():
        n = len(day_quarters(d, tz))
        prices = sum(1 for r in rows if r[0] is not None)
        house = sum(1 for r in rows if r[1] is not None)
        solar = sum(1 for r in rows if r[2] is not None)
        if prices >= n and house >= COVER * n and solar >= COVER * n:
            ok.append(d)
    return sorted(ok)


def build_days(hist: dict[str, list], days: list[date], tz: ZoneInfo) -> list[dict[str, Any]]:
    """Per day: timestamps, prices, house use W and solar kW per quarter (gaps filled)."""
    out = []
    for d in days:
        ts = day_quarters(d, tz)
        rows = [hist.get(str(t)) or [None, None, None] for t in ts]
        house = [r[1] for r in rows if r[1] is not None]
        mean_house = sum(house) / len(house) if house else 0.0
        out.append({
            "day": d, "ts": ts, "prices": [float(r[0]) for r in rows],
            "use": [float(r[1]) if r[1] is not None else mean_house for r in rows],
            "solar": [float(r[2]) / 1000 if r[2] is not None else 0.0 for r in rows],
        })
    return out


# ---- replay ----------------------------------------------------------------------------------
def candidates(current: float, lo: float, hi: float, step: float, top: float = MAX_HOURS) -> list[float]:
    """Whole-hour grid inside the helper's min / max / step (and up to ``top`` hours), plus the current value."""
    step = max(float(step or 1.0), 0.01)
    unit = math.ceil(1.0 / step - 1e-9) * step  # about an hour, and a multiple of the helper step
    vals = []
    v = lo
    while v <= min(hi, top) + 1e-9:
        vals.append(round(v, 4))
        v += unit
    if lo - 1e-9 <= current <= hi + 1e-9:
        vals.append(round(current, 4))
    return sorted(set(vals))


def _day_input(base: plan.PlanInput, day: dict[str, Any], marks: list[str | None]) -> plan.PlanInput:
    ts = day["ts"]
    nbat = max(base.battery_count, 1)
    cutoff = (base.cutoff + [10.0] * nbat)[:nbat]
    return replace(
        base,
        now_ts=float(ts[0]),
        battery_count=nbat,
        soc=list(cutoff),  # empty at the HBC cut-off: stored energy 0
        cutoff=list(cutoff),
        marks=[{"start": t * 1000, "price": p, "mark": m} for t, p, m in zip(ts, day["prices"], marks)],
        datapoints_per_hour=4,
        use_q=dict(zip(ts, day["use"])),
        solar_q=dict(zip(ts, day["solar"])),
        pv10={}, pv={},
        horizon=len(ts) * QUARTER,
        grid_step=GRID_STEP_KWH,
        prev_l_run=0,
        engine="dp",
    )


class Replay:
    """Scores (cheapest_hrs, expensive_hrs) pairs over the replayed days; every distinct set of marks is planned once."""

    def __init__(self, base: plan.PlanInput, days: list[dict[str, Any]], min_delta: Any, pause: float = 0.0) -> None:
        self.base, self.days, self.min_delta, self.pause = base, days, min_delta, pause
        self._day_cache: dict[tuple, float | None] = {}
        self._pair_cache: dict[tuple, float | None] = {}
        self.plans = 0  # planner runs (the expensive part)
        self.pairs = 0  # distinct sets of marks scored

    def marks(self, i: int, cheapest: float, expensive: float) -> list[str | None]:
        d = self.days[i]
        return hbcmarks.mark_quarters(d["prices"], [0] * len(d["prices"]), self.min_delta, cheapest, expensive, 4)

    def score(self, cheapest: float, expensive: float) -> float | None:
        """Total cost in euro over the days (lower is better); None when the planner cannot run."""
        marks = [self.marks(i, cheapest, expensive) for i in range(len(self.days))]
        sig = tuple(tuple(m) for m in marks)
        if sig in self._pair_cache:
            return self._pair_cache[sig]
        total = 0.0
        for i, (d, m) in enumerate(zip(self.days, marks)):
            key = (i, tuple(m))
            if key not in self._day_cache:
                inp = _day_input(self.base, d, m)
                r = plan.plan_cost(inp)
                self.plans += 1
                self._day_cache[key] = None if r is None else r["cost"] - r["end"] * r["pmin_b"]
                if self.pause:
                    time.sleep(self.pause)
            c = self._day_cache[key]
            if c is None:
                self._pair_cache[sig] = None
                return None
            total += c
        self.pairs += 1
        self._pair_cache[sig] = total
        return total


def _far(v: float) -> float:
    """0 hours means 'no cap' in HBC: for 'closest to the current value' it is the largest value, not the smallest."""
    return v if v > 0 else 24.0


def _pick(scored: list[tuple[float, float]], current: float) -> float:
    """Value with the lowest cost; costs within EPS of the best are ties, then the one closest to ``current``."""
    best = min(s for s, _ in scored)
    ties = [v for s, v in scored if s <= best + EPS]
    return min(ties, key=lambda v: (abs(_far(v) - _far(current)), v))


def search(
    replay: Replay,
    cheapest_now: float, expensive_now: float,
    cheapest_grid: list[float], expensive_grid: list[float],
) -> dict[str, Any] | None:
    """Coordinate search over the coarse grid: cheapest hours with expensive fixed, then expensive with the new
    cheapest, and once more (at most two rounds). Far fewer planner runs than the full grid."""
    base_score = replay.score(cheapest_now, expensive_now)
    if base_score is None:
        return None
    c, e = cheapest_now, expensive_now
    for _ in range(2):
        sc = [(replay.score(v, e), v) for v in cheapest_grid]
        c2 = _pick([(s, v) for s, v in sc if s is not None], cheapest_now)
        se = [(replay.score(c2, v), v) for v in expensive_grid]
        e2 = _pick([(s, v) for s, v in se if s is not None], expensive_now)
        done = (c2, e2) == (c, e)
        c, e = c2, e2
        if done:
            break
    # never worse than now, beyond the tie margin
    best = replay.score(c, e)
    if best is None or best > base_score + EPS:
        c, e, best = cheapest_now, expensive_now, base_score
    elif best >= base_score - EPS:  # a tie with the current setting: keep the current setting
        c, e, best = cheapest_now, expensive_now, base_score
    return {"cheapest": c, "expensive": e, "kosten_nu": base_score, "kosten_advies": best,
            "besparing": base_score - best}


def advise(
    base: plan.PlanInput, hist: dict[str, list], today: date, tz_name: str, min_delta: Any,
    cheapest_now: float, expensive_now: float,
    cheapest_spec: tuple[float, float, float], expensive_spec: tuple[float, float, float],
    pause: float = 0.0,
) -> dict[str, Any]:
    """Run the whole daily calculation. ``*_spec`` = (min, max, step) of the HBC helper."""
    t0 = time.perf_counter()
    tz = ZoneInfo(tz_name)
    have = complete_days(hist, today, tz)
    out: dict[str, Any] = {"dagen": min(len(have), DAYS)}
    if len(have) < DAYS:
        out["status"] = "meten"
        return out
    days = build_days(hist, have[-DAYS:], tz)
    replay = Replay(base, days, min_delta, pause)
    res = search(replay, cheapest_now, expensive_now,
                 candidates(cheapest_now, *cheapest_spec), candidates(expensive_now, *expensive_spec))
    if res is None:
        out["status"] = "niet_beschikbaar"
        return out
    out.update({"status": "berekend", **{k: round(v, 4) for k, v in res.items()},
                "dagen_van": days[0]["day"].isoformat(), "dagen_tot": days[-1]["day"].isoformat(),
                "planner_runs": replay.plans, "paren": replay.pairs})
    out["duur_s"] = round(time.perf_counter() - t0, 2)
    return out


def solar_advice(adv_days: dict[str, list], today: date) -> float | None:
    """Advice for 'Solar reserved for house': mean of the last 7 completed days of the daily advice value,
    rounded to 0.5 kWh; None until 7 days are known."""
    vals = []
    for k in sorted(adv_days):
        s, n = adv_days[k]
        if date.fromisoformat(k) < today and n >= 8:
            vals.append(s / n)
    if len(vals) < DAYS:
        return None
    mean = sum(vals[-DAYS:]) / DAYS
    return round(mean * 2) / 2


# ---- applying the advice (pure, so it can be tested) ------------------------------------------
def snap(want: float, lo: float, hi: float, step: float) -> float:
    """Nearest value the helper accepts: on its step, inside min / max."""
    v = lo + round((want - lo) / step) * step if step > 0 else want
    return round(min(max(v, lo), hi), 4)


def changes(
    advice: dict[str, float | None], current: dict[str, float | None],
    specs: dict[str, tuple[float, float, float]], thresholds: dict[str, float],
) -> dict[str, float]:
    """New values for the settings whose advice differs from the current value by at least the threshold
    (1 h, 1 h, 0.5 kWh); the new value is snapped to the helper's step and min / max."""
    out: dict[str, float] = {}
    for key, thr in thresholds.items():
        want, cur = advice.get(key), current.get(key)
        if want is None or cur is None or abs(want - cur) < thr - 1e-9:
            continue
        new = snap(float(want), *specs[key])
        if abs(new - cur) >= 1e-9:
            out[key] = new
    return out


def restore(user: dict[str, float], current: dict[str, float | None]) -> dict[str, float]:
    """Own values to put back exactly: those that differ from what the helper has now."""
    return {k: v for k, v in user.items() if current.get(k) is not None and abs(current[k] - v) > 1e-9}


def user_edit(auto: bool, own: bool, state: str | None, user: dict[str, float], key: str) -> float | None:
    """New own value to remember when you change an HBC setting by hand while auto-adjust is on, else None.

    own = the change was written by Batterijplan itself (then it is never your own value)."""
    if not auto or own or state is None or state in ("unknown", "unavailable", "none", "None", "", "nan"):
        return None
    try:
        val = float(state)
    except ValueError:
        return None
    if key in user and abs(user[key] - val) < 1e-9:
        return None
    return val
