"""Flemish capacity tariff: quarter-hour averages, monthly peaks, target limit (no Home Assistant imports).

Fluvius bills the capacity tariff on the average of the monthly peaks of the last 12 months. A monthly
peak is the highest quarter-hour average net grid import of the month, never counted below 2.5 kW.

Batterijplan keeps the quarter-hour average itself (from the grid power sensor), derives a target limit
and, inside a quarter, the power that is still allowed so that the quarter stays under the target:

  target  = max(monthly peak so far, 2500 W, own limit)
  budget  = target x 0.25 h                      (kWh)
  allowed = (budget - kWh already imported) / hours left, at least 500 W
"""
from __future__ import annotations

from datetime import datetime, tzinfo
from typing import Any

QUARTER = 900
FLOOR_W = 2500.0  # a monthly peak counts as at least 2.5 kW
MIN_ALLOWED_W = 500.0  # HBC helper minimum
MAX_ALLOWED_W = 25000.0  # HBC helper maximum
MIN_REMAINING_S = 30.0  # the last seconds would give absurd numbers
WRITE_DIFF_W = 100.0  # only write when the limit changes by more than this
WRITE_EVERY_S = 60.0  # at most one write per minute inside a quarter
HOLD_GAP_S = 120.0  # a value that is not refreshed counts for at most this long
MIN_COVERAGE = 0.8  # share of a quarter that must have been measured for the quarter to count
KEEP_MONTHS = 13  # 12 rows + one older month for the trend of the oldest row


# ---- quarter accumulator -----------------------------------------------------------------------
class QuarterAcc:
    """Time-weighted integral of the net grid power per quarter. Values are held until the next one.

    ``observe(ts, w)`` is called with every new reading (``w`` None = sensor unavailable). It returns
    the quarters that ended up to ``ts``, each ``{"start", "ws", "covered"}`` (ws = watt-seconds, covered =
    measured seconds). Quarter boundaries are exact (``ts // 900 * 900``), however late the call is."""

    def __init__(self) -> None:
        self.start: int | None = None
        self.ws = 0.0
        self.covered = 0.0
        self.last_ts: float | None = None
        self.last_update: float | None = None
        self.last_w: float | None = None

    def _integrate(self, a: float, b: float) -> None:
        if b <= a or self.last_w is None or self.last_update is None:
            return
        end = min(b, self.last_update + HOLD_GAP_S)
        if end > a:
            self.ws += self.last_w * (end - a)
            self.covered += end - a

    def observe(self, ts: float, w: float | None) -> list[dict[str, Any]]:
        done: list[dict[str, Any]] = []
        if self.last_ts is not None and ts - self.last_ts > 6 * 3600:  # long pause (country was not BE): start fresh
            self.__init__()
        if self.start is None:
            self.start = int(ts // QUARTER * QUARTER)
        if self.last_ts is not None and ts > self.last_ts:
            t = self.last_ts
            while int(t // QUARTER * QUARTER) < int(ts // QUARTER * QUARTER):
                edge = (int(t // QUARTER) + 1) * QUARTER
                self._integrate(t, edge)
                done.append({"start": self.start, "ws": self.ws, "covered": self.covered})
                self.start, self.ws, self.covered, t = edge, 0.0, 0.0, float(edge)
            self._integrate(t, ts)
        elif self.last_ts is not None and ts < self.last_ts:
            return done  # clock went back: ignore the reading
        self.start = int(ts // QUARTER * QUARTER)
        self.last_ts = ts
        self.last_w = w
        if w is not None:
            self.last_update = ts
        return done

    def current(self, ts: float) -> dict[str, float]:
        """State of the running quarter at ``ts`` (call ``observe`` first so the integral is up to date)."""
        start = self.start if self.start is not None else int(ts // QUARTER * QUARTER)
        elapsed = max(0.0, min(ts - start, float(QUARTER)))
        return {"start": start, "elapsed": elapsed, "used_kwh": self.ws / 3_600_000,
                "avg_w": (self.ws / self.covered) if self.covered > 0 else 0.0, "covered": self.covered}


def used_estimate(cur: dict[str, float], target_w: float) -> float:
    """kWh imported so far in the running quarter, safe after a restart: the part of the quarter that was not measured
    (HA was down or the sensor gone) counts as if it ran at the target limit, never as zero."""
    unmeasured = max(float(cur["elapsed"]) - float(cur["covered"]), 0.0)
    return float(cur["used_kwh"]) + unmeasured * float(target_w) / 3_600_000


def quarter_average(q: dict[str, Any]) -> float | None:
    """Net average W over a finished quarter, or None when too little of it was measured."""
    if float(q.get("covered") or 0) < QUARTER * MIN_COVERAGE:
        return None
    return float(q["ws"]) / float(q["covered"])


class QuarterSet:
    """Several quarter accumulators fed with the same timestamps (same boundaries), one per named channel.

    ``observe(ts, {name: w})`` returns the quarters that ended: ``{"start": s, name: {"ws", "covered"}, ...}``."""

    def __init__(self, names: tuple[str, ...]) -> None:
        self.names = names
        self.acc = {n: QuarterAcc() for n in names}

    def observe(self, ts: float, vals: dict[str, float | None]) -> list[dict[str, Any]]:
        res = {n: self.acc[n].observe(ts, vals.get(n)) for n in self.names}
        count = min(len(v) for v in res.values())
        return [{"start": res[self.names[0]][i]["start"], **{n: res[n][i] for n in self.names}} for i in range(count)]

    def current(self, name: str, ts: float) -> dict[str, float]:
        return self.acc[name].current(ts)


def channel_avg(q: dict[str, Any], name: str) -> float | None:
    """Average W of one channel over a finished quarter of a QuarterSet (None = too little measured)."""
    return quarter_average(q[name])


def channel_kwh(q: dict[str, Any], name: str) -> float | None:
    """kWh of one channel in a finished quarter (None = too little measured)."""
    return None if quarter_average(q[name]) is None else float(q[name]["ws"]) / 3_600_000


def in_night(hour: int, night_from: int, night_to: int) -> bool:
    """Is local ``hour`` inside the night window [from, to)? A window like 22 -> 7 wraps midnight; from == to = no night."""
    if night_from == night_to:
        return False
    return night_from <= hour < night_to if night_from < night_to else (hour >= night_from or hour < night_to)


def day_night_price(hour: int, night_from: int, night_to: int, price_day: float, price_night: float) -> float:
    return price_night if in_night(hour, night_from, night_to) else price_day


def energy_value(discharge_kwh: float, charge_kwh: float, import_kwh: float, price: float,
                 export_kwh: float = 0.0, feed_in: float = 0.0) -> float:
    """Value of one quarter of battery use at a fixed / dual-rate price (EUR).

    Discharged energy avoids buying at ``price``; the part of it that went to the grid (at most the energy exported in the
    quarter) earns the feed-in price ``feed_in`` instead. Charge that came from the grid (at most the energy imported in
    the quarter) costs ``price``. Charge that came from solar costs the feed-in price it no longer earns."""
    dis_exp = min(max(discharge_kwh, 0.0), max(export_kwh, 0.0))
    grid_charge = min(max(charge_kwh, 0.0), max(import_kwh, 0.0))
    solar_charge = max(charge_kwh, 0.0) - grid_charge
    return (discharge_kwh - dis_exp) * price + dis_exp * feed_in - grid_charge * price - solar_charge * feed_in


# ---- formulas ----------------------------------------------------------------------------------
def target_limit(month_peak_w: float, own_limit_w: float | None = None) -> float:
    """Target limit: highest of the monthly peak so far, 2500 W and the own limit."""
    return max(float(month_peak_w or 0.0), FLOOR_W, float(own_limit_w or 0.0))


def allowed_w(target_w: float, used_kwh: float, elapsed_s: float,
              min_w: float = MIN_ALLOWED_W, max_w: float = MAX_ALLOWED_W) -> float:
    """Power that may still be imported for the rest of the quarter so that its average stays at the target."""
    budget = target_w * 0.25 / 1000  # kWh in the quarter at the target
    remaining_h = max(QUARTER - elapsed_s, MIN_REMAINING_S) / 3600
    w = (budget - used_kwh) / remaining_h * 1000
    return min(max(w, min_w), max_w)


def should_write(current_w: float | None, wanted_w: float, now_ts: float, last_write_ts: float | None,
                 force: bool = False) -> bool:
    """Write the HBC limit? Inside a quarter: difference over 100 W and at most once a minute.
    At a quarter change (``force``): whenever it differs at all."""
    if current_w is None:
        return True
    if force:
        return round(current_w) != round(wanted_w)
    if abs(current_w - wanted_w) <= WRITE_DIFF_W:
        return False
    return last_write_ts is None or now_ts - last_write_ts >= WRITE_EVERY_S


# ---- monthly peaks -----------------------------------------------------------------------------
def month_key(ts: float, tz: tzinfo) -> str:
    return datetime.fromtimestamp(ts, tz).strftime("%Y-%m")


def day_key(ts: float, tz: tzinfo) -> str:
    return datetime.fromtimestamp(ts, tz).strftime("%Y-%m-%d")


class PeakBook:
    """Own storage of the peaks: highest quarter of each day this month, with the battery (measured grid import) and
    without it (grid + battery power), and one record per finished month.

    A quarter belongs to the day and month in which it STARTS (the 23:45 quarter of the last day stays in that month)."""

    def __init__(self) -> None:
        self.month: str = ""  # month the day figures belong to
        self.days: dict[str, float] = {}  # day -> highest quarter average W with battery (this month)
        self.days_nb: dict[str, float] = {}  # day -> same without battery (this month)
        self.months: dict[str, dict[str, float | None]] = {}  # finished months: {"piek": W, "zonder": W | None}

    # -- change of month
    def roll(self, mk: str) -> None:
        """Make ``mk`` the current month; a month that is over goes into the table."""
        if self.month and mk != self.month and self.days:
            self.months[self.month] = {"piek": round(max(self.days.values()), 1),
                                       "zonder": round(max(self.days_nb.values()), 1) if self.days_nb else None}
            for old in sorted(self.months)[:-KEEP_MONTHS]:
                del self.months[old]
        if mk != self.month:
            self.month, self.days, self.days_nb = mk, {}, {}

    def record(self, start_ts: float, avg_w: float, tz: tzinfo, avg_nb_w: float | None = None) -> None:
        mk = month_key(start_ts, tz)
        self.roll(mk)
        dk = day_key(start_ts, tz)
        w = round(max(avg_w, 0.0), 1)
        if dk not in self.days or w > self.days[dk]:
            self.days[dk] = w
        if avg_nb_w is not None:
            wz = round(max(avg_nb_w, 0.0), 1)
            if dk not in self.days_nb or wz > self.days_nb[dk]:
                self.days_nb[dk] = wz

    def peak_now(self) -> float:
        return max(self.days.values()) if self.days else 0.0

    def peak_now_nb(self) -> float | None:
        return max(self.days_nb.values()) if self.days_nb else None

    # -- views
    def table(self, today_month: str, tariff: float = 0.0) -> list[dict[str, Any]]:
        """Last 12 months, newest first (the running month on top).

        Per month: peak with battery (``piek``), without (``zonder``), saving in kW (both at least 2500 W, as Fluvius counts)
        and in EUR for that month (kW x tariff EUR/kW/year / 12). trend vs. the month before: 'up' / 'down' / 'same' / None."""
        self.roll(today_month)  # a month that is over goes into the table first
        rows: dict[str, dict[str, Any]] = {k: dict(v) for k, v in self.months.items() if k != today_month}
        if self.days:
            rows[today_month] = {"piek": round(self.peak_now(), 1), "zonder": self.peak_now_nb()}
        order = sorted(rows, reverse=True)
        out = []
        for i, mk in enumerate(order[:12]):
            older = rows[order[i + 1]]["piek"] if i + 1 < len(order) else None
            p, z = rows[mk]["piek"], rows[mk].get("zonder")
            trend = None if older is None else ("up" if p > older + 0.5 else ("down" if p < older - 0.5 else "same"))
            save_kw = None if z is None else round((max(float(z), FLOOR_W) - max(float(p), FLOOR_W)) / 1000, 3)
            out.append({"maand": mk, "piek": p, "zonder": z, "trend": trend, "lopend": mk == today_month,
                        "besparing_kw": save_kw, "besparing_eur": None if save_kw is None else round(save_kw * tariff / 12, 2)})
        return out

    def averages(self, today_month: str) -> dict[str, Any]:
        """Average of the monthly peaks of the last 12 months as Fluvius counts it (each month at least 2500 W):
        with the battery over all months, without over the months where that is known; over the same months for the saving."""
        rows = self.table(today_month)
        with_b = [max(float(r["piek"]), FLOOR_W) for r in rows]
        both = [(max(float(r["piek"]), FLOOR_W), max(float(r["zonder"]), FLOOR_W)) for r in rows if r["zonder"] is not None]
        return {
            "met": round(sum(with_b) / len(with_b), 1) if with_b else None, "n": len(with_b),
            "zonder": round(sum(z for _m, z in both) / len(both), 1) if both else None, "n_zonder": len(both),
            "met_zelfde": round(sum(m for m, _z in both) / len(both), 1) if both else None,
        }

    # -- storage
    def to_dict(self) -> dict[str, Any]:
        return {"month": self.month, "days": self.days, "days_nb": self.days_nb, "months": self.months}

    @classmethod
    def from_dict(cls, d: dict[str, Any] | None) -> "PeakBook":
        b = cls()
        d = d or {}
        b.month = str(d.get("month") or "")
        b.days = {str(k): float(v) for k, v in (d.get("days") or {}).items()}
        b.days_nb = {str(k): float(v) for k, v in (d.get("days_nb") or {}).items()}
        b.months = {str(k): {"piek": float(v.get("piek") or 0), "zonder": None if v.get("zonder") is None else float(v["zonder"])}
                    for k, v in (d.get("months") or {}).items()}
        return b
