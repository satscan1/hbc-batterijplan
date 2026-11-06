"""Offline tests for advisor.py: history, replay choice, remember / restore of the HBC settings (pytest or plain python)."""
import math
import os
import random
import sys
import time
from datetime import date
from zoneinfo import ZoneInfo

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "custom_components", "batterijplan"))
import advisor  # noqa: E402
import plan  # noqa: E402

TZ = ZoneInfo("Europe/Amsterdam")
TODAY = date(2026, 11, 6)


def _day(k):
    return date.fromordinal(TODAY.toordinal() - k)


def _hist(days=7, seed=1, flat=False, cheap_h=4, spread=30.0):
    """Quarter history: cheap night block, expensive evening block, small noise; house use 400-700 W, no solar."""
    rnd = random.Random(seed)
    hist = {}
    for k in range(1, days + 1):
        for i, t in enumerate(advisor.day_quarters(_day(k), TZ)):
            h = i / 4
            p = 20.0
            if not flat:
                p += (-8 if h < cheap_h else 0) + (spread if 17 <= h < 21 else 0) + rnd.uniform(-0.4, 0.4)
            hist[str(t)] = [p, 400 + (300 if 17 <= h < 22 else 0), 0.0]
    return hist


def _base(**kw):
    d = dict(now_ts=0, capacity=6.0, margin=0.3, battery_count=1, soc=[10], cutoff=[10], charge_w=[2000], discharge_w=[2000],
             time_zone="Europe/Amsterdam", delta=6.0)
    d.update(kw)
    return plan.PlanInput(**d)


SPEC_C, SPEC_E = (0, 8, 0.25), (0, 23, 0.25)


def test_history_complete_days_and_prune():
    hist = _hist(7)
    assert len(advisor.complete_days(hist, TODAY, TZ)) == 7
    # a missing price quarter makes a day incomplete; 10 % missing house use is still fine, 20 % is not
    ts = advisor.day_quarters(_day(3), TZ)
    del hist[str(ts[10])]
    assert _day(3) not in advisor.complete_days(hist, TODAY, TZ)
    ts4 = advisor.day_quarters(_day(4), TZ)
    for t in ts4[:9]:
        hist[str(t)][1] = None
    assert _day(4) in advisor.complete_days(hist, TODAY, TZ)
    for t in ts4[:25]:
        hist[str(t)][1] = None
    assert _day(4) not in advisor.complete_days(hist, TODAY, TZ)
    # today itself never counts; old days are pruned
    hist[str(advisor.day_quarters(TODAY, TZ)[0])] = [1.0, 1, 1]
    old = str(advisor.day_quarters(_day(30), TZ)[0])
    hist[old] = [1.0, 1, 1]
    advisor.prune(hist, TODAY, TZ)
    assert old not in hist and str(advisor.day_quarters(TODAY, TZ)[0]) in hist


def test_time_change_days_have_92_and_100_quarters():
    assert len(advisor.day_quarters(date(2026, 3, 29), TZ)) == 92
    assert len(advisor.day_quarters(date(2026, 10, 25), TZ)) == 100
    assert len(advisor.day_quarters(date(2026, 11, 5), TZ)) == 96


def test_measuring_until_seven_days():
    r = advisor.advise(_base(), _hist(6), TODAY, "Europe/Amsterdam", 6, 8, 8, SPEC_C, SPEC_E)
    assert r["status"] == "meten" and r["dagen"] == 6 and "cheapest" not in r


def test_candidates_respect_helper_limits():
    c = advisor.candidates(8, 0, 8, 0.25)
    assert c == [0, 1, 2, 3, 4, 5, 6, 7, 8]  # max 8 of the cheapest helper
    e = advisor.candidates(6.25, 0, 23, 0.25)
    assert e[0] == 0 and e[-1] == 12 and 6.25 in e and 13 not in e  # coarse grid 0..12 plus the current value
    assert advisor.candidates(4, 2, 10, 2) == [2, 4, 6, 8, 10]  # step 2: multiples of the step


def test_flat_prices_keep_current_values():
    """No spread = no marks at all: every pair ties, the advice is the current setting."""
    r = advisor.advise(_base(), _hist(7, flat=True), TODAY, "Europe/Amsterdam", 6, 8, 8, SPEC_C, SPEC_E)
    assert r["status"] == "berekend" and (r["cheapest"], r["expensive"]) == (8, 8) and r["besparing"] == 0


def test_replay_picks_the_cheapest_pair_and_matches_exhaustive_search():
    hist = _hist(7, cheap_h=4)
    days = advisor.build_days(hist, advisor.complete_days(hist, TODAY, TZ), TZ)
    rep = advisor.Replay(_base(), days, 6)
    cg, eg = [0, 1, 2, 3, 4, 6, 8], [0, 1, 2, 3, 4, 6, 8]
    now = (1, 1)  # far too few cheap and expensive hours
    res = advisor.search(rep, now[0], now[1], cg, eg)
    assert res["kosten_advies"] < res["kosten_nu"] - 0.5 and res["besparing"] > 0.5
    assert (res["cheapest"], res["expensive"]) != now
    full = {(c, e): rep.score(c, e) for c in cg for e in eg}
    best = min(full.values())
    assert full[(res["cheapest"], res["expensive"])] <= best + advisor.EPS  # coordinate search finds the optimum (within a tie)
    # the advice is also the closest to the current value among ties
    ties = [k for k, v in full.items() if v <= best + advisor.EPS]
    assert (res["cheapest"], res["expensive"]) in ties


def test_ties_go_to_the_value_closest_to_current():
    assert advisor._pick([(10.0, 2), (10.0, 5), (10.005, 9), (11.0, 1)], 6) == 5
    assert advisor._pick([(10.0, 2), (9.0, 7)], 2) == 7  # a clear win is not a tie


def test_zero_hours_means_no_cap_for_the_tie_break():
    """0 = no cap in HBC: it is not 'next to 1'. Tie between 0 and 2 with current 1 -> 2 (and 0 is only close to a large current)."""
    assert advisor._pick([(10.0, 0), (10.0, 2)], 1) == 2
    assert advisor._pick([(10.0, 0), (10.0, 12)], 11) == 12
    assert advisor._pick([(10.0, 0), (10.0, 8)], 0) == 0  # current 0 = no cap stays
    assert advisor._pick([(10.0, 0), (10.0, 4)], 20) == 0  # 0 (no cap) is closer to a current of 20 than 4 is


def test_pair_cache_avoids_replanning():
    hist = _hist(7)
    days = advisor.build_days(hist, advisor.complete_days(hist, TODAY, TZ), TZ)
    rep = advisor.Replay(_base(), days, 6)
    a = rep.score(8, 8)
    runs = rep.plans
    assert rep.score(8, 8) == a and rep.plans == runs  # same marks -> no new planner run
    assert rep.score(8, 12) == a or rep.plans > runs  # bigger cap, same marks -> cached


def test_replay_runtime_is_light():
    """Whole daily calculation with a realistic battery (10 kWh) and the usual helper ranges."""
    import json
    prices = json.load(open(os.path.join(os.path.dirname(__file__), "fixtures", "hbc_marks_20261106.json")))["prices"]
    rnd = random.Random(3)
    hist = {}
    for k in range(1, 8):  # real price curve of 06-11-2026, scaled / shifted / noisy per day; evening house peak, midday solar
        sc, sh = rnd.uniform(0.8, 1.3), rnd.uniform(-4, 4)
        for i, ts in enumerate(advisor.day_quarters(_day(k), TZ)):
            h = i / 4
            house = 350 + 300 * math.exp(-(((h - 19) / 2.5) ** 2)) + 150 * math.exp(-(((h - 7.5) / 1.5) ** 2))
            sun = max(0.0, 3500 * math.sin(math.pi * (h - 8) / 9)) * rnd.uniform(0.3, 1) if 8 < h < 17 else 0.0
            hist[str(ts)] = [prices[i] * sc + sh + rnd.uniform(-1, 1), house, sun]
    t = time.process_time()
    r = advisor.advise(_base(capacity=10.2, battery_count=2, soc=[10, 10], cutoff=[10, 10], charge_w=[2500, 2500],
                             discharge_w=[2500, 2500]), hist, TODAY, "Europe/Amsterdam", 6, 8, 8, SPEC_C, SPEC_E)
    dt = time.process_time() - t
    assert r["status"] == "berekend" and dt < 30, dt
    print(f"   daily calculation: {dt:.1f} s cpu, {r['planner_runs']} planner runs, {r['paren']} mark sets "
          f"(cheapest {r['cheapest']}, expensive {r['expensive']}, saving {r['besparing']:.2f} EUR over 7 days)")


def test_normal_plan_unchanged_by_replay_options():
    """The extra PlanInput options default to the old behaviour."""
    marks = [{"start": 1793805300000 + i * 900000, "price": 20 + (i % 5), "mark": None} for i in range(8)]
    inp = plan.PlanInput(now_ts=1793805300 - 90, capacity=10, battery_count=1, soc=[50], cutoff=[10], marks=marks,
                         profile=[400] * 24, time_zone="Europe/Amsterdam")
    a = plan.compute(inp)
    b = plan.compute(plan.PlanInput(**{**inp.__dict__, "grid_step": 0.05, "horizon": 0, "use_q": None, "solar_q": None}))
    assert a == b


# ---- apply, remember, restore ----------------------------------------------------------------
SPECS = {"cheapest": (0.0, 8.0, 0.25), "expensive": (0.0, 23.0, 0.25), "solar": (0.0, 500.0, 1.0)}
THR = {"cheapest": 1.0, "expensive": 1.0, "solar": 0.5}


def test_changes_only_when_difference_is_big_enough():
    cur = {"cheapest": 8.0, "expensive": 8.0, "solar": 8.0}
    assert advisor.changes({"cheapest": 8.75, "expensive": 7.5, "solar": 8.0}, cur, SPECS, THR) == {}  # < 1 h, < 1 h, equal
    assert advisor.changes({"cheapest": 7.0, "expensive": 10.0, "solar": 8.5}, cur, SPECS, THR) == {"cheapest": 7.0, "expensive": 10.0}
    # solar: 0.5 kWh counts, but the helper step is 1 -> snapped value must differ from the current one
    assert advisor.changes({"solar": 9.0}, cur, SPECS, THR) == {"solar": 9.0}
    assert advisor.changes({"solar": 8.5}, cur, SPECS, THR) in ({}, {"solar": 8.0}, {"solar": 9.0})  # 8.5 snaps to 8 or 9, never 8.5
    assert all(float(v).is_integer() for v in advisor.changes({"solar": 8.5}, {"solar": 6.0}, SPECS, THR).values())
    assert advisor.changes({"cheapest": 12.0}, cur, SPECS, THR) == {}  # clamped to the helper maximum 8 = current
    assert advisor.changes({"cheapest": None, "expensive": None, "solar": None}, cur, SPECS, THR) == {}
    assert advisor.changes({"cheapest": 3}, {"cheapest": None}, SPECS, THR) == {}  # unknown helper: nothing


def test_remember_and_restore_exact_values():
    """Switch on: own values remembered first; advice applied; switch off: own values back, exactly."""
    helpers = {"cheapest": 6.25, "expensive": 7.5, "solar": 8.0}  # your own values (also fractional)
    user = dict(helpers)  # remember_hbc()
    for k, v in advisor.changes({"cheapest": 3.0, "expensive": 11.0, "solar": 12.0}, helpers, SPECS, THR).items():
        helpers[k] = v  # apply
    assert helpers == {"cheapest": 3.0, "expensive": 11.0, "solar": 12.0}
    # a second advice moves them again: the remembered values stay the first ones
    for k, v in advisor.changes({"cheapest": 5.0}, helpers, SPECS, THR).items():
        helpers[k] = v
    back = advisor.restore(user, helpers)
    assert back == user  # all three differ
    helpers.update(back)
    assert helpers == {"cheapest": 6.25, "expensive": 7.5, "solar": 8.0}
    assert advisor.restore(user, helpers) == {}  # nothing left to restore
    assert advisor.restore({"cheapest": 6.25}, {"cheapest": None}) == {}


def test_user_edit_becomes_own_value():
    user = {"cheapest": 6.0, "expensive": 7.0, "solar": 8.0}
    assert advisor.user_edit(True, False, "5.5", user, "cheapest") == 5.5  # you change it: new own value
    assert advisor.user_edit(True, True, "3.0", user, "cheapest") is None  # Batterijplan's own write
    assert advisor.user_edit(False, False, "5.5", user, "cheapest") is None  # auto-adjust off: nothing to remember
    for bad in (None, "unknown", "unavailable", "", "abc"):
        assert advisor.user_edit(True, False, bad, user, "cheapest") is None
    assert advisor.user_edit(True, False, "6.0", user, "cheapest") is None  # unchanged own value
    assert advisor.user_edit(True, False, "9", {}, "solar") == 9.0  # nothing remembered yet
    # flow: auto on, advice applied, you change cheapest, switch off -> your new value comes back
    helpers = dict(user)
    for k, v in advisor.changes({"cheapest": 3.0}, helpers, SPECS, THR).items():
        helpers[k] = v
    helpers["cheapest"] = 5.5
    user["cheapest"] = advisor.user_edit(True, False, "5.5", user, "cheapest")
    helpers["cheapest"] = 4.0  # next advice overwrites
    back = advisor.restore(user, helpers)
    assert back == {"cheapest": 5.5}


def test_solar_advice_needs_seven_days():
    days = {_day(k).isoformat(): [10.0 * 96, 96] for k in range(1, 7)}
    assert advisor.solar_advice(days, TODAY) is None
    days[_day(7).isoformat()] = [12.0 * 96, 96]
    assert advisor.solar_advice(days, TODAY) == 10.5  # mean 10.286 -> 10.5
    days[TODAY.isoformat()] = [999.0 * 5, 5]  # today is not counted
    assert advisor.solar_advice(days, TODAY) == 10.5


if __name__ == "__main__":
    for k, v in list(globals().items()):
        if k.startswith("test_"):
            v()
            print("ok", k)
