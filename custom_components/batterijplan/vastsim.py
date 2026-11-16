"""Expected battery level under a Fixed contract, simulated per quarter (no Home Assistant imports).

HBC works like this under a Fixed contract (Batterijplan keeps it on these two strategies):
  * outside the off-peak hours: Self-consumption (NOM, 'zero on the meter'): the battery covers the house use, charges with a
    solar surplus, within 0 and the usable capacity and within the charge / discharge power;
  * in the off-peak hours of a dual rate: Charge: the battery charges from the grid up to the HBC charge target, then holds.
The level is the usable energy above the HBC cut-off (the same figure as sensor.batterijplan_lading). Losses are not modelled.

Action per quarter:  L charge from the grid (off-peak)   O discharge for the house (NOM)
                     Z charge with solar                  N nothing (battery empty or full / target reached)
"""
from __future__ import annotations

from collections.abc import Callable
from typing import Any

QH = 0.25  # hours per quarter
EPS = 0.001  # kWh below which a quarter counts as 'nothing'


def simulate(*, start_ts: int, n: int, level0: float, cap: float, charge_q: float, discharge_q: float,
             house_w: Callable[[int], float], pv_kw: Callable[[int], float], grid_charge: Callable[[int], bool],
             target_kwh: float, limit_w: float | None = None) -> list[list[Any]]:
    """Rows ``[ts, level at the end of the quarter (kWh), action, grid_charge_allowed 0/1]`` for ``n`` quarters from ``start_ts``.

    ``charge_q`` / ``discharge_q``: most the batteries can move in a quarter (kWh). ``grid_charge(ts)``: HBC is on Charge in that
    quarter (dual rate, off-peak, and in Flanders room under the limit). ``limit_w``: Flanders target limit: the house use plus the
    grid charge may not pass it."""
    level = max(0.0, min(level0, cap))
    out: list[list[Any]] = []
    for i in range(n):
        ts = start_ts + i * 900
        house = max(house_w(ts), 0.0) / 1000 * QH
        sun = max(pv_kw(ts), 0.0) * QH
        gc = bool(grid_charge(ts))
        act = "N"
        if gc:
            tgt = min(max(target_kwh, 0.0), cap)
            cq = charge_q
            if limit_w is not None:
                cq = max(0.0, min(cq, (limit_w - house_w(ts)) / 1000 * QH))
            add = min(cq, tgt - level) if level < tgt else 0.0
            if add > EPS:
                level += add
                act = "L"
        else:
            net = sun - house
            if net > 0:
                add = min(net, charge_q, cap - level)
                if add > EPS:
                    level += add
                    act = "Z"
            else:
                use = min(-net, discharge_q, level)
                if use > EPS:
                    level -= use
                    act = "O"
        out.append([ts, round(level, 3), act, 1 if gc else 0])
    return out


def summarize(rows: list[list[Any]], level_now: float, cap: float, hour_of: Callable[[int], int] | None = None,
              day_from: int = 7, day_to: int = 19) -> dict[str, Any]:
    """The short timeline for the briefing, from the simulated rows (first row = the running quarter).

    nu: action of the running quarter · leeg / vol: first time the battery is expected to be empty / full · dal: first off-peak
    charging block (van, tot, naar = level at its end) · dag: the next DAYTIME block (``day_from``-``day_to`` local hours, after the
    charging block or from now) when ``hour_of`` is given: ``dag_ts`` is its start (so tonight it is tomorrow morning, after midnight it
    is this morning), ``zon`` when solar charges the battery in it, ``vol`` first time full. Without ``hour_of``: the 14 h after the block."""
    if not rows:
        return {}
    eps = 0.05
    empty = next((r[0] for r in rows if r[1] <= eps), None) if level_now > eps else None
    full = next((r[0] for r in rows if r[1] >= cap - eps), None) if level_now < cap - eps else None
    dal = None
    i = next((k for k, r in enumerate(rows) if r[3]), None)
    if i is not None:
        j = i
        while j + 1 < len(rows) and rows[j + 1][3]:
            j += 1
        dal = {"van": rows[i][0], "tot": rows[j][0] + 900, "naar": rows[j][1], "laadt": any(r[2] == "L" for r in rows[i:j + 1]),
               "lopend": i == 0}
        after = rows[j + 1:]
    else:
        after = rows
    if hour_of is None:
        day = [r for r in after][:56]  # the 14 hours after the block
    else:
        k = next((n for n, r in enumerate(after) if day_from <= hour_of(r[0]) < day_to), None)
        day = []
        if k is not None:
            for r in after[k:k + 48]:
                if not (day_from <= hour_of(r[0]) < day_to):
                    break
                day.append(r)
    dag = {"dag_ts": day[0][0] if day else None, "zon": any(r[2] == "Z" for r in day),
           "vol": next((r[0] for r in day if r[1] >= cap - eps), None), "nom": any(r[2] == "O" for r in day)}
    return {"nu": rows[0][2], "leeg": empty, "vol": full, "dal": dal, "dag": dag}


def night_charge_decision(*, off_peak: bool, flanders: bool, normal: float, dal: float, threshold_ct: float,
                          headroom_ok: bool = True) -> tuple[bool, str, float]:
    """May HBC charge from the grid in this quarter under a Fixed + dual rate contract? -> (allowed, reason, price difference in ct).

    Outside the off-peak hours never. Charging from the grid only pays when the rate difference (normal - off-peak, in ct/kWh)
    is at least the threshold HBC itself uses (Dynamic threshold delta, the same helper as for a Dynamic contract); otherwise
    the stored kWh costs more than buying it later at the normal rate (losses) and HBC stays on Self-consumption.
    Exception Flanders: charging in the off-peak hours may fill the reserve for peaks, whatever the price difference, but only
    while there is room under the target limit (``headroom_ok``).
    reason: geen_dal | loont | loont_niet | vlaanderen | geen_ruimte."""
    diff = round((float(normal) - float(dal)) * 100, 2)
    if not off_peak:
        return False, "geen_dal", diff
    if flanders:
        return (True, "vlaanderen", diff) if headroom_ok else (False, "geen_ruimte", diff)
    if diff >= float(threshold_ct) - 1e-9:
        return True, "loont", diff
    return False, "loont_niet", diff
