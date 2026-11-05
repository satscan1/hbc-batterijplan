"""Pure calculation rules of HBC Batterijplan (no Home Assistant imports).

1-to-1 port of the template sensor ``batterijplan_proef`` (version 04-11-2026 16:10).
Two simulations over all known price quarters:
  1. HBC alone  : cheap -> charge from grid, expensive -> discharge, else solar only.
  2. Batterijplan: HBC's expensive marks plus any quarter at least ``delta`` ct above the
     cheapest quarter before it; hold charge for later expensive quarters; charge from the
     grid when a shortfall would otherwise occur; optional feed-in (sell) of surplus.

Two engines for simulation 2 (``PlanInput.engine``):
  * ``dp``         : dynamic programming over the whole horizon, only actions HBC can really execute
                     (low: L/Z/H, normal: Z/O/H, high: O/H/V). Wear (threshold delta) per discharged kWh is part
                     of the optimisation; ``kosten_plan`` stays the pure grid cost (like ``kosten_hbc``).
  * ``heuristiek`` : the earlier rules (kept; also the reference in the tests).

Actions: L charge from grid, O discharge, H hold, Z solar only, V feed in.
Point format: [t, price_ct, kind, action_hbc, charge_hbc, action_plan, charge_plan, solar_kw]
kind: 1 HBC expensive, 2 extra expensive, -1 cheap, 0 normal.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Any

QUARTER = 900
MIN_CHARGE_QUARTERS = 2  # grid charging in blocks of at least 30 minutes (one quarter was too short for HBC; Adrie 05-11-2026)
MAX_HORIZON = 129600  # 36 hours


@dataclass
class PlanInput:
    """Everything the calculation needs; the caller reads it from Home Assistant."""

    now_ts: float
    capacity: float  # kWh, total
    margin: float = 0.3  # kWh kept in reserve
    storage_fee: float = 0.0  # EUR/kWh excl. VAT (supplier mark-up)
    vat: float = 0.21  # VAT rate on purchase (0.21 = 21 %)
    feed_in_fee: float = 0.02  # EUR/kWh added to the exchange price when feeding in (no net metering)
    feed_in_bonus: float = 10.0  # % extra on a positive feed-in price in daytime (0 = none)
    bonus_from: int = 8  # first hour of the daytime bonus (also any quarter with solar > 0)
    bonus_to: int = 17  # hour the daytime bonus ends (exclusive)
    all_in: bool = False  # HBC prices already include everything
    delta: float = 6.0  # ct/kWh, HBC dynamic threshold delta
    battery_count: int = 0
    soc: list[float] = field(default_factory=list)  # % per battery (-1 = unknown)
    cutoff: list[float] = field(default_factory=list)  # % discharge cut-off per battery
    charge_w: list[float] = field(default_factory=list)  # max charge power W per battery
    discharge_w: list[float] = field(default_factory=list)  # max discharge power W per battery
    marks: list[dict[str, Any]] = field(default_factory=list)  # [{start(ms), price(ct), mark}]
    datapoints_per_hour: float = 4
    profile: list[float] = field(default_factory=list)  # 24 values, W per hour
    fallback_w: float = 400.0
    pv10: dict[int, float] = field(default_factory=dict)  # half-hour start ts -> kW (pessimistic, used for calculation)
    pv: dict[int, float] = field(default_factory=dict)  # half-hour start ts -> kW (shown in chart)
    time_zone: str = "UTC"  # Home Assistant time zone; hour of day (profile, daytime) is local
    rule_charge: bool = True
    rule_discharge: bool = True
    rule_hold: bool = True
    rule_feed_in: bool = True
    prev_l_run: int = 0  # quarters in a row just before now that charged from the grid
    engine: str = "dp"  # "dp" (default) or "heuristiek"


def _mark_start_ms(start: Any) -> float:
    """Return mark start as milliseconds since epoch."""
    if isinstance(start, (int, float)):
        return float(start)
    if isinstance(start, str):
        try:
            return float(start)
        except ValueError:
            return datetime.fromisoformat(start).timestamp() * 1000
    return start.timestamp() * 1000  # datetime


def _prepare(inp: PlanInput) -> dict[str, Any]:
    """Shared part: stored energy, power limits, the list of price quarters (``Q``)."""
    T = int((inp.now_ts + 90) // QUARTER * QUARTER)
    cap = inp.capacity
    marge = inp.margin
    opslag = inp.storage_fee
    fa = 0.01 if inp.all_in else (1 + inp.vat) / 100
    fb = 0.0 if inp.all_in else opslag * (1 + inp.vat)
    bonus = 1 + inp.feed_in_bonus / 100
    delta = max(inp.delta, 0.1)
    nbat = inp.battery_count

    # --- stored energy above HBC cut-off, averaged over all batteries ---
    s_sum = 0.0
    ok = 0
    for i in range(nbat):
        soc = inp.soc[i] if i < len(inp.soc) else -1
        cut = inp.cutoff[i] if i < len(inp.cutoff) else 10
        if soc >= 0:
            s_sum += max(soc - cut, 0) / max(100 - cut, 1)
            ok += 1
    Eruw = (s_sum / ok * cap) if (nbat > 0 and ok == nbat and cap > 1) else -1.0
    E = max(Eruw - marge, 0)
    top = max(cap - marge, 0)
    lw = sum(inp.charge_w[:nbat])
    laadq = (lw / 1000 * 0.25) if lw > 0 else cap / 8
    ow = sum(inp.discharge_w[:nbat])
    ontlq = (ow / 1000 * 0.25) if ow > 0 else laadq

    # --- quarter list ---
    dph = inp.datapoints_per_hour
    nsub = max(int(round(4 / max(dph, 0.01))), 1)
    fallback = inp.fallback_w
    prof = inp.profile
    have_prof = len(prof) == 24
    tz = ZoneInfo(inp.time_zone)
    Qraw: list[dict[str, Any]] = []
    mn = 999.0
    for m in inp.marks:
        st = _mark_start_ms(m["start"])
        mark = m.get("mark")
        p = float(m.get("price") or 0)
        for j in range(nsub):
            t = int(st / 1000) + j * QUARTER
            if T <= t < T + MAX_HORIZON:
                h = datetime.fromtimestamp(t, tz).hour  # local hour of day
                w = prof[h] if (have_prof and isinstance(prof[h], (int, float))) else fallback
                half = (t // 1800) * 1800
                pv = inp.pv10.get(half, 0)
                d = mark == "high" or (p - mn) >= delta
                dag = pv > 0 or (inp.bonus_from <= h < inp.bonus_to)
                ex = p * 0.01 + inp.feed_in_fee
                ex = ex * bonus if (dag and ex > 0) else ex
                Qraw.append(
                    dict(
                        t=t, p=p, m=mark, d=d, b=(p * fa + fb), e=ex,
                        z=inp.pv.get(half, 0),
                        need=round((w / 1000 - pv) * 0.25, 3),
                    )
                )
                if p < mn:
                    mn = p
    Q = sorted(Qraw, key=lambda x: x["t"])
    n = len(Q)
    return {
        "T": T, "top": top, "marge": marge, "delta": delta, "fa": fa, "E": E, "Eruw": Eruw,
        "laadq": laadq, "ontlq": ontlq, "Q": Q, "n": n,
        "pmin_b": min(x["b"] for x in Q) if n else 0,
        "wear": delta * fa,  # EUR per discharged kWh
    }


def _hbc_alone(P: dict[str, Any]) -> tuple[list[list[Any]], float, float, float]:
    """Simulation 1, HBC alone: (list of [action, charge], total cost, first-quarter cost, end level)."""
    top, laadq, marge = P["top"], P["laadq"], P["marge"]
    hs = P["E"]
    hk = 0.0
    hk0 = 0.0
    hl: list[list[Any]] = []
    for x in P["Q"]:
        zon = max(-x["need"], 0)
        if x["m"] == "low":
            s2 = min(top, hs + laadq + zon)
            a = "L"
        elif x["m"] == "high" and x["need"] > 0:
            s2 = max(hs - x["need"], 0)
            a = "O"
        else:
            s2 = min(top, hs + zon)
            a = "Z"
        net = x["need"] + s2 - hs
        c = net * x["b"] if net > 0 else net * x["e"]
        if not hl:
            hk0 = c
        hk += c
        hl.append([a, round(s2 + marge, 2)])
        hs = s2
    return hl, hk, hk0, hs


def _assemble(inp: PlanInput, P: dict[str, Any], engine: str, hl, hk, hk0, hs, bl, bk, bk0, bs, wear: float) -> dict[str, Any]:
    Q, n, pmin_b = P["Q"], P["n"], P["pmin_b"]
    rest = (bs - hs) * pmin_b
    opbrengst = hk - bk + rest
    punten = []
    for i in range(n):
        x = Q[i]
        # kind decides which HBC mode class steering sets: HBC's own marks first, then 'extra expensive'
        kind = 1 if x["m"] == "high" else (-1 if x["m"] == "low" else (2 if x["d"] else 0))
        punten.append([x["t"], round(x["p"], 1), kind, hl[i][0], hl[i][1], bl[i][0], bl[i][1], round(x["z"], 2)])
    return {
        "ok": P["Eruw"] >= 0 and n > 0,
        "opbrengst": round(opbrengst, 2),
        "kosten_hbc": round(hk, 2),
        "kosten_plan": round(bk, 2),
        "start": P["T"],
        "lading": round(P["Eruw"], 2) if P["Eruw"] >= 0 else None,
        "punten": punten,
        # first quarter, for the value counter (counter.py): costs and charge at its end
        "k_hbc0": round(hk0, 4),
        "k_plan0": round(bk0, 4),
        "s_hbc0": hl[0][1] if hl else None,
        "s_plan0": bl[0][1] if bl else None,
        "pmin_b": round(pmin_b, 5),
        "engine": engine,
        "slijtage_plan": round(wear, 2),  # wear cost the plan accepted (not in kosten_plan)
    }


def _heuristic(P: dict[str, Any], inp: PlanInput, hbc_only: bool = False):
    """Simulation 2, the earlier rules. ``hbc_only`` maps every action onto what HBC can execute
    (L only in cheap, V only in expensive quarters, no O in cheap ones); used as reference in tests."""
    Q, n, top, laadq, ontlq, marge = P["Q"], P["n"], P["top"], P["laadq"], P["ontlq"], P["marge"]
    delta, pmin_b = P["delta"], P["pmin_b"]
    bs = P["E"]
    bk = 0.0
    bl: list[list[Any]] = []
    bk0 = 0.0
    for i in range(n):
        x = Q[i]
        zon = max(-x["need"], 0)
        if x["d"] and x["need"] > 0:
            fs = max(bs - x["need"], 0)
            laag = 0.0
            stop = False
            for y in Q[i + 1:]:
                if not stop and (x["p"] - y["p"]) >= delta:
                    stop = True
                if not stop:
                    if y["d"] and y["need"] > 0 and (y["p"] - x["p"]) >= delta:
                        fs = fs - y["need"]
                    elif y["need"] < 0:
                        fs = min(top, fs - y["need"])
                    if fs < laag:
                        laag = fs
            if laag < -0.01:
                s2 = bs
                a = "H"
            else:
                s2 = max(bs - x["need"], 0)
                a = "O"
        elif not x["d"]:
            fs = min(top, bs + zon)
            laag = 0.0
            stop = False
            for y in Q[i + 1:]:
                if not stop and y["p"] < x["p"]:
                    stop = True
                if not stop:
                    if y["d"] and y["need"] > 0 and (y["p"] - x["p"]) >= delta:
                        fs = fs - y["need"]
                    elif y["need"] < 0:
                        fs = min(top, fs - y["need"])
                    if fs < laag:
                        laag = fs
            if (-laag) > 0.05:
                s2 = min(top, bs + zon + min(laadq, -laag))
                a = "L"
            else:
                s2 = min(top, bs + zon)
                a = "Z"
        else:
            s2 = min(top, bs + zon)
            a = "Z"
        # rule switches off: do what HBC does at that point
        if not inp.rule_charge and a == "L" and x["m"] != "low":
            s2 = min(top, bs + zon)
            a = "Z"
        if not inp.rule_charge and x["m"] == "low" and a != "L":
            s2 = min(top, bs + laadq + zon)
            a = "L"
        if not inp.rule_discharge and a == "O" and x["m"] != "high":
            s2 = min(top, bs + zon)
            a = "Z"
        if not inp.rule_hold and a == "H":
            if x["m"] == "high":
                s2 = max(bs - x["need"], 0)
                a = "O"
            else:
                s2 = min(top, bs + zon)
                a = "Z"
        if hbc_only:
            if a == "L" and x["m"] != "low":
                s2 = min(top, bs + zon)
                a = "Z"
            elif a == "O" and x["m"] == "low":
                s2 = min(top, bs + zon)
                a = "Z"
            elif a == "Z" and x["m"] == "high":
                a = "O"  # same movement (solar surplus charges); the HBC mode for an expensive quarter
        # feed in: keep reserve for own use, only what is certainly surplus
        if inp.rule_feed_in and a in ("O", "Z", "H") and s2 > 0.05 and x["e"] > 0 and (not hbc_only or x["m"] == "high"):
            rs = s2
            rlaag = s2
            stop = False
            for y in Q[i + 1:]:
                if not stop and (not y["d"]) and y["b"] < x["e"]:
                    stop = True
                if not stop:
                    if y["need"] > 0 and y["b"] > x["e"]:
                        rs = rs - y["need"]
                    elif y["need"] < 0:
                        rs = min(top, rs - y["need"])
                    if rs < rlaag:
                        rlaag = rs
            over = min(rlaag, ontlq - max(x["need"], 0), s2)
            if over > 0.05 and (x["e"] - pmin_b) * 100 >= delta:
                s2 = s2 - over
                a = "V"
        net = x["need"] + s2 - bs
        c = net * x["b"] if net > 0 else net * x["e"]
        if not bl:
            bk0 = c
        bk += c
        bl.append([a, round(s2 + marge, 2)])
        bs = s2
    return bl, bk, bk0, bs


# ---------------------------------------------------------------------------------------------
# Dynamic programming
# ---------------------------------------------------------------------------------------------
def allowed_actions(mark: Any, inp: PlanInput) -> list[str]:
    """Actions HBC can really execute in a quarter of this class, in order of preference (ties).

    cheap (low)    : L charge from the grid (up to charge power + solar), Z charge PV, H standby
    normal         : Z charge PV, O self-consumption (discharge up to consumption), H standby
    expensive      : O self-consumption, V sell (discharge up to discharge power), H standby
    Rule switches off limit this to what HBC does by itself."""
    if mark == "low":
        acts = ["L"] if not inp.rule_charge else ["L", "Z", "H"]
    elif mark == "high":
        acts = ["O", "V", "H"]
    else:
        acts = ["Z", "O", "H"]
        if not inp.rule_discharge:
            acts.remove("O")
    if not inp.rule_hold and "H" in acts:
        acts.remove("H")
    if not inp.rule_feed_in and "V" in acts:
        acts.remove("V")
    return acts


def _move(a: str, s: float, need: float, top: float, laadq: float, ontlq: float) -> float:
    """Level after one quarter for HBC action ``a`` from level ``s`` (kWh above the reserve)."""
    if a == "Z":
        return min(top, s - need) if need < 0 else s
    if a == "O":
        if need > 0:
            return s - min(need, ontlq, s)
        return min(top, s - need)
    if a == "H":
        return s
    if a == "L":
        return min(top, s + laadq + (-need if need < 0 else 0.0))
    # V: discharge up to the discharge power, the rest goes back to the grid
    return max(s - ontlq, 0.0)


def _cost(x: dict[str, Any], s: float, s2: float, wear: float) -> tuple[float, float]:
    """(grid cost, wear cost) of one quarter."""
    net = x["need"] + s2 - s
    c = net * x["b"] if net > 0 else net * x["e"]
    return c, (s - s2) * wear if s2 < s else 0.0


def evaluate_actions(inp: PlanInput, actions: list[str], P: dict[str, Any] | None = None) -> dict[str, float]:
    """Score an action list (one letter per quarter) with the dp model: grid cost, wear,
    and the objective = cost + wear - end level x cheapest purchase price. Used by the tests."""
    P = P or _prepare(inp)
    s = P["E"]
    cost = wear = 0.0
    for x, a in zip(P["Q"], actions):
        s2 = _move(a, s, x["need"], P["top"], P["laadq"], P["ontlq"])
        c, w = _cost(x, s, s2, P["wear"])
        cost += c
        wear += w
        s = s2
    return {"cost": cost, "wear": wear, "end": s, "objective": cost + wear - s * P["pmin_b"]}


def _dp(P: dict[str, Any], inp: PlanInput):
    Q, n, top, laadq, ontlq = P["Q"], P["n"], P["top"], P["laadq"], P["ontlq"]
    marge, wear, pmin_b = P["marge"], P["wear"], P["pmin_b"]
    ns = 0 if top <= 0.001 else min(max(int(-(-top // 0.05)), 1), 800)  # grid 0.05 kWh (coarser for huge batteries)
    step = top / ns if ns else 1.0
    grid = [i * step for i in range(ns + 1)]
    inv = 1.0 / step

    def interp(v: list[float], s: float) -> float:
        if ns == 0 or s <= 0:
            return v[0]
        pos = s * inv
        i = int(pos)
        if i >= ns:
            return v[ns]
        return v[i] + (v[i + 1] - v[i]) * (pos - i)

    acts_q = [allowed_actions(x["m"], inp) for x in Q]
    assert all(acts_q), "a quarter without an allowed action"
    M = max(int(MIN_CHARGE_QUARTERS), 1)

    def acts_for(t: int, k: int) -> list[str]:
        """k = quarters already charged in the running grid-charge block (0 = no block running)."""
        acts = acts_q[t]
        if 0 < k < M and "L" in acts:
            return ["L"]  # finish the started charge block (at least M quarters)
        return acts

    def k_next(a: str, k: int) -> int:
        return min(k + 1, M) if a == "L" else 0

    # V[t][k][i]: best future cost from quarter t, block state k, level grid[i]
    V = [[[0.0] * (ns + 1) for _ in range(M + 1)] for _ in range(n + 1)]
    for k in range(M + 1):
        V[n][k] = [-pmin_b * s for s in grid]
    for t in range(n - 1, -1, -1):
        x = Q[t]
        need, b, e = x["need"], x["b"], x["e"]
        for k in range(M + 1):
            acts = acts_for(t, k)
            vt = V[t][k]
            for i in range(ns + 1):
                s = grid[i]
                best = 1e18
                for a in acts:
                    s2 = _move(a, s, need, top, laadq, ontlq)
                    net = need + s2 - s
                    v = (net * b if net > 0 else net * e) + ((s - s2) * wear if s2 < s else 0.0) + interp(V[t + 1][k_next(a, k)], s2)
                    if v < best:
                        best = v
                vt[i] = best
    # forward pass on exact (continuous) levels
    s = P["E"]
    k = min(max(int(inp.prev_l_run), 0), M)
    bl: list[list[Any]] = []
    bk = bk0 = bw = 0.0
    for t in range(n):
        x = Q[t]
        best, ba, bs2, bc, bwr = 1e18, "", s, 0.0, 0.0
        for a in acts_for(t, k):
            s2 = _move(a, s, x["need"], top, laadq, ontlq)
            c, w = _cost(x, s, s2, wear)
            v = c + w + interp(V[t + 1][k_next(a, k)], s2)
            if v < best - 1e-9:
                best, ba, bs2, bc, bwr = v, a, s2, c, w
        if t == 0:
            bk0 = bc
        bk += bc
        bw += bwr
        bl.append([ba, round(bs2 + marge, 2)])
        k = k_next(ba, k)
        s = bs2
    return bl, bk, bk0, s, bw


def plan_heuristiek(inp: PlanInput) -> dict[str, Any]:
    """Earlier rules (rule-of-thumb), kept next to the dp engine."""
    P = _prepare(inp)
    hl, hk, hk0, hs = _hbc_alone(P)
    bl, bk, bk0, bs = _heuristic(P, inp)
    return _assemble(inp, P, "heuristiek", hl, hk, hk0, hs, bl, bk, bk0, bs, 0.0)


def plan_dp(inp: PlanInput) -> dict[str, Any]:
    """Dynamic programming over the whole horizon with HBC-executable actions only."""
    P = _prepare(inp)
    hl, hk, hk0, hs = _hbc_alone(P)
    bl, bk, bk0, bs, bw = _dp(P, inp)
    return _assemble(inp, P, "dp", hl, hk, hk0, hs, bl, bk, bk0, bs, bw)


def compute(inp: PlanInput) -> dict[str, Any]:
    """Return dict(ok, opbrengst, kosten_hbc, kosten_plan, start, lading, punten, ...)."""
    return plan_dp(inp) if inp.engine == "dp" else plan_heuristiek(inp)
