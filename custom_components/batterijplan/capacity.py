"""Capacity check (experiment): how much usable battery would the expensive quarters of a day have needed?

Per calendar day, once the day is complete: the net house use (use minus solar) in the quarters HBC marks "high"
is the energy the battery would have had to deliver. Next to it the day keeps a small table: what the plan earns
over HBC alone at 3..20 kWh (the plan against itself, not against the measured savings).
Neutral: no verdict, only counts. Nothing in here steers anything.
"""

from __future__ import annotations

import calendar
import math
from dataclasses import replace
from datetime import date
from typing import Any
from zoneinfo import ZoneInfo

from . import advisor, hbcmarks, plan

MIN_DAYS = 7  # below this there is no advice
GOOD_DAYS = 28  # from here the advice is called solid (the last 28 days are used)
OVER_SHARE = 0.15  # unused share of the usable capacity that counts as over-capacity
CAPS = tuple(range(3, 21))  # kWh usable: the points of the earnings table
QUARTER_H = 0.25
REC_VERSION = 2  # 2 = need with the solar in W (fix 12-11-2026) and the net-cost table; older records are completed once


def need_kwh(day: dict[str, Any], marks: list[Any]) -> float:
    """Net house use (W use minus solar, never below 0) over the quarters marked 'high', in kWh.

    build_days gives the house use in W and the solar in kW, so the solar is converted to W here (fix 12-11-2026:
    the solar was subtracted in kW, which left it out in practice).
    """
    total = 0.0
    for mk, use, sun in zip(marks, day["use"], day["solar"]):
        if mk == "high":
            total += max((use or 0) - (sun or 0) * 1000, 0) * QUARTER_H / 1000
    return total


def day_record(base: plan.PlanInput, day: dict[str, Any], day_date: date, avail: float, cheapest: float,
               expensive: float, min_delta: float, late: bool) -> dict[str, Any]:
    prices = day["prices"]
    marks = hbcmarks.mark_quarters(prices, [0] * len(prices), min_delta, cheapest, expensive, 4)
    need = need_kwh(day, marks)

    def earn(cap: float) -> float | None:
        return _run(base, day, marks, cap)[0]

    return {
        "day": day_date.isoformat(), "need": round(need, 2), "avail": round(avail, 2),
        "unused": round(max(avail - need, 0.0), 2),
        "cheapest": cheapest, "expensive": expensive, "delta": min_delta, "late": late,
        "eur": {str(c): earn(c) for c in CAPS}, "eur_now": earn(avail),
        **net_table(base, day, marks, avail), "v": REC_VERSION,
    }


def _run(base: plan.PlanInput, day: dict[str, Any], marks: list[Any], cap: float) -> tuple[float | None, float | None]:
    """One replay of a day at one capacity: (earnings plan vs HBC alone, net cost of the plan).

    Net cost = cost of the plan minus the charge left at 24:00 valued at the lowest purchase price. This is the
    plan against itself at another capacity, so it measures what capacity is worth (12-11-2026, akkoord Adrie).
    The earnings against HBC alone are kept for the record but are not a capacity value: HBC alone uses a large
    battery poorly, so that difference grows with capacity for reasons that have nothing to do with the user.
    """
    r = plan.compute(advisor._day_input(replace(base, capacity=float(cap)), day, marks))
    if not (r and r.get("ok")):
        return None, None
    pts = r.get("punten") or []
    end = float(pts[-1][6]) if pts else 0.0
    net = float(r.get("kosten_plan") or 0.0) - end * float(r.get("pmin_b") or 0.0)
    return round(float(r.get("opbrengst") or 0.0), 3), round(net, 3)


def net_table(base: plan.PlanInput, day: dict[str, Any], marks: list[Any], avail: float) -> dict[str, Any]:
    return {"net": {str(c): _run(base, day, marks, c)[1] for c in CAPS}, "net_now": _run(base, day, marks, avail)[1]}


def net_records(base: plan.PlanInput, hist: dict[str, list], recs: dict[str, dict[str, Any]],
                tz: ZoneInfo) -> dict[str, dict[str, Any]]:
    """Add the net-cost table to days recorded before it existed, with each day's own stored HBC settings.

    Only the new fields are added; the stored earnings of those days are not recalculated.
    """
    keys = sorted(recs)
    days = advisor.build_days(hist, [date.fromisoformat(k) for k in keys], tz)
    out: dict[str, dict[str, Any]] = {}
    for k, day in zip(keys, days):
        rec = recs[k]
        marks = hbcmarks.mark_quarters(day["prices"], [0] * len(day["prices"]), rec["delta"], rec["cheapest"],
                                       rec["expensive"], 4)
        need = need_kwh(day, marks)  # also corrects the need of days recorded before the solar fix (12-11-2026)
        out[k] = {**net_table(base, day, marks, rec["avail"]), "need": round(need, 2),
                  "unused": round(max(rec["avail"] - need, 0.0), 2), "v": REC_VERSION}
    return out


def build_records(base: plan.PlanInput, hist: dict[str, list], todo: list[date], tz: ZoneInfo, avail: float,
                  cheapest: float, expensive: float, min_delta: float, today: date) -> dict[str, dict[str, Any]]:
    days = advisor.build_days(hist, todo, tz)
    out: dict[str, dict[str, Any]] = {}
    for d, day in zip(todo, days):
        out[d.isoformat()] = day_record(base, day, d, avail, cheapest, expensive, min_delta, (today - d).days > 1)
    return out


def advise(days: dict[str, dict[str, Any]]) -> dict[str, Any]:
    keys = sorted(days)[-GOOD_DAYS:]
    n = len(keys)
    res: dict[str, Any] = {"status": "te_weinig_dagen", "dagen": n, "min_dagen": MIN_DAYS, "goed_dagen": GOOD_DAYS}
    res["perioden"] = periods(days)
    recs = [days[k] for k in keys]
    if n < MIN_DAYS:
        res["reeks"] = [[r["day"], r["need"], r["avail"], None, None] for r in recs]
        return res
    needs = sorted(r["need"] for r in recs)
    # ideal = average need over the days (same as the green line on the card), rounded up to whole kWh
    opt = max(math.ceil(sum(needs) / n - 1e-9), 1)
    key_opt = str(min(max(opt, CAPS[0]), CAPS[-1]))
    now = sum(r["eur_now"] or 0.0 for r in recs)
    best = sum((r["eur"].get(key_opt) or 0.0) for r in recs)
    res.update({
        "status": "degelijk" if n >= GOOD_DAYS else "experiment",
        "optimaal": opt, "optimaal_buiten_bereik": opt > CAPS[-1],
        "beschikbaar": recs[-1]["avail"],
        "dagen_te_weinig": sum(1 for r in recs if r["need"] > r["avail"] + 1e-9),
        "dagen_over": sum(1 for r in recs if r["unused"] > OVER_SHARE * r["avail"]),
        "nodig_gem": round(sum(needs) / n, 2), "nodig_max": needs[-1],
        "eur_nu": round(now, 2), "eur_optimaal": round(best, 2), "eur_verschil": round(best - now, 2),
        "reeks": [[r["day"], r["need"], r["avail"], r["eur_now"], r["eur"].get(key_opt)] for r in recs],
    })
    return res


KEEP_DAYS = 5 * 366  # day records older than about 5 years are dropped (decision Adrie 14-11-2026)
PERIOD_ROWS = {"week": 8, "maand": 12, "kwartaal": 12, "jaar": 5}  # quarters: 3 years for the report grid  # newest first, how many periods per kind


def prune(days: dict[str, dict[str, Any]], today: date) -> int:
    """Drop day records older than KEEP_DAYS (about 5 years). Returns how many were removed."""
    old = [k for k in days if (today - date.fromisoformat(k)).days > KEEP_DAYS]
    for k in old:
        del days[k]
    return len(old)


def _period_key(d: date, kind: str) -> str:
    if kind == "week":
        y, w, _ = d.isocalendar()
        return f"{y}-W{w:02d}"
    if kind == "maand":
        return f"{d.year}-{d.month:02d}"
    if kind == "kwartaal":
        return f"{d.year}-Q{(d.month - 1) // 3 + 1}"
    return str(d.year)


def _period_days(d: date, kind: str) -> int:
    """Number of calendar days in the period that contains d."""
    if kind == "week":
        return 7
    if kind == "jaar":
        return 366 if calendar.isleap(d.year) else 365
    if kind == "maand":
        return calendar.monthrange(d.year, d.month)[1]
    q0 = (d.month - 1) // 3 * 3 + 1
    return sum(calendar.monthrange(d.year, m)[1] for m in range(q0, q0 + 3))


def periods(days: dict[str, dict[str, Any]]) -> dict[str, list[list[Any]]]:
    """Per week, month, quarter and year (newest first): only real day amounts added up, nothing extrapolated.

    Row: [period, days measured, days in period, optimal kWh (average need, as in advise), EUR now, EUR at optimal,
    EUR difference]. The optimal is computed per period, so a winter quarter and a summer quarter can differ.
    """
    out: dict[str, list[list[Any]]] = {}
    keys = sorted(days)
    for kind, rows in PERIOD_ROWS.items():
        groups: dict[str, list[dict[str, Any]]] = {}
        first: dict[str, date] = {}
        for k in keys:
            d = date.fromisoformat(k)
            pk = _period_key(d, kind)
            groups.setdefault(pk, []).append(days[k])
            first.setdefault(pk, d)
        res: list[list[Any]] = []
        keep = sorted(groups)
        if kind == "maand" and keep:
            keep = [pk for pk in keep if pk[:4] == keep[-1][:4]]  # months of the running calendar year only (report)
        for pk in keep[-rows:][::-1]:
            recs = groups[pk]
            n = len(recs)
            opt = max(math.ceil(sum(r["need"] for r in recs) / n - 1e-9), 1)
            key_opt = str(min(max(opt, CAPS[0]), CAPS[-1]))
            now = sum(r.get("eur_now") or 0.0 for r in recs)
            best = sum(((r.get("eur") or {}).get(key_opt) or 0.0) for r in recs)
            av = [r.get("avail") or 0.0 for r in recs]
            res.append([pk, n, _period_days(first[pk], kind), opt, round(now, 2), round(best, 2), round(best - now, 2), [round(min(av), 1), round(max(av), 1)]])
        out[kind] = res
    return out
