"""Offline tests for plan.py (pytest or plain python)."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "custom_components", "batterijplan"))
import plan  # noqa: E402

T0 = 1793805300 - 90


def _marks(prices, marks=None):
    base = 1793805300 * 1000
    return [{"start": base + i * 900000, "price": p, "mark": (marks or {}).get(i)} for i, p in enumerate(prices)]


def _inp(**kw):
    d = dict(now_ts=T0, capacity=10, margin=0.3, battery_count=1, soc=[50], cutoff=[10],
             marks=_marks([20] * 4), profile=[400] * 24, time_zone="Europe/Amsterdam")
    d.update(kw)
    return plan.PlanInput(**d)


def test_points_carry_normal_and_cautious_solar():
    """Point = [t, price, kind, act HBC, charge HBC, act plan, charge plan, solar kW, cautious solar kW] (tooltip of the plan card)."""
    half = (T0 + 90) // 1800 * 1800
    r = plan.compute(_inp(pv={half: 2.0, half + 1800: 3.0}, pv10={half: 1.2, half + 1800: 2.5}))
    assert all(len(pt) == 9 for pt in r["punten"])
    first = r["punten"][0]
    assert first[7] == 2.0 and first[8] == 1.2
    assert plan.compute(_inp())["punten"][0][7:] == [0, 0]


def test_unknown_soc_not_ok():
    assert plan.compute(_inp(soc=[-1]))["ok"] is False


def test_flat_prices_no_gain():
    r = plan.compute(_inp())
    assert r["ok"] and abs(r["opbrengst"]) < 0.05
    assert len(r["punten"]) == 4


def test_expensive_quarter_discharges():
    r = plan.compute(_inp(marks=_marks([10, 10, 40, 40], {2: "high", 3: "high"}), rule_feed_in=False))
    assert r["punten"][2][3] == "O" and r["punten"][2][5] == "O"


def test_cheap_quarter_charges_hbc():
    r = plan.compute(_inp(marks=_marks([5, 30, 30, 30], {0: "low"})))
    assert r["punten"][0][3] == "L"


ALLOWED = {"low": set("LZH"), "high": set("OHV"), None: set("ZOH")}


def _rand_input(rnd, n=None):
    n = n or rnd.randint(8, 144)
    price, prices, marks = rnd.uniform(10, 35), [], {}
    for i in range(n):
        price = min(max(price + rnd.uniform(-4, 4), -5), 60)
        prices.append(round(price, 1))
        r = rnd.random()
        if r < 0.18:
            marks[i] = "low"
        elif r > 0.82:
            marks[i] = "high"
    base = 1793805300
    pv = {(base + i * 900) // 1800 * 1800: max(0.0, rnd.uniform(-1, 5)) for i in range(n)} if rnd.random() < 0.7 else {}
    cap = rnd.choice([2.5, 5, 9, 15, 20])
    return _inp(capacity=cap, soc=[rnd.uniform(10, 100)], charge_w=[rnd.choice([800, 2500, 5000])],
                discharge_w=[rnd.choice([800, 2500, 5000])], marks=_marks(prices, marks),
                profile=[rnd.uniform(150, 900) for _ in range(24)], pv10=pv, pv=pv, delta=rnd.choice([3, 6, 9]),
                rule_charge=rnd.random() < 0.8, rule_discharge=rnd.random() < 0.8,
                rule_hold=rnd.random() < 0.8, rule_feed_in=rnd.random() < 0.8)


def _dp_vs_heuristic(inp):
    P = plan._prepare(inp)
    bl = plan._heuristic(P, inp, hbc_only=True)[0]
    eh = plan.evaluate_actions(inp, [x[0] for x in bl], P)
    r = plan.plan_dp(inp)
    ed = plan.evaluate_actions(inp, [p[5] for p in r["punten"]], P)
    return eh, ed, r


def test_dp_not_dearer_than_heuristic_random():
    import random

    rnd = random.Random(20261104)
    worst = 0.0
    keep = plan.MIN_CHARGE_QUARTERS
    plan.MIN_CHARGE_QUARTERS = 1  # engine quality: compare without the minimum charge block (the heuristic has none)
    for _ in range(300):
        eh, ed, _r = _dp_vs_heuristic(_rand_input(rnd))
        worst = max(worst, ed["objective"] - eh["objective"])
        assert ed["objective"] <= eh["objective"] + 0.02, (ed, eh)
    plan.MIN_CHARGE_QUARTERS = keep
    return worst


def test_dp_min_charge_block():
    """Grid charging comes in blocks of at least MIN_CHARGE_QUARTERS cheap quarters (05-11-2026)."""
    import random

    rnd = random.Random(11)
    for _ in range(100):
        inp = _rand_input(rnd)
        r = plan.plan_dp(inp)
        Q = plan._prepare(inp)["Q"]
        acts = [pt[5] for pt in r["punten"]]
        for i, a in enumerate(acts):
            if a == "L" and (i == 0 or acts[i - 1] != "L") and i + 1 < len(acts) and Q[i + 1]["m"] == "low":
                assert acts[i + 1] == "L", (i, acts)


def test_dp_only_hbc_executable_actions():
    import random

    rnd = random.Random(7)
    for _ in range(100):
        inp = _rand_input(rnd)
        r = plan.plan_dp(inp)
        for pt, x in zip(r["punten"], plan._prepare(inp)["Q"]):
            assert pt[5] in plan.allowed_actions(x["m"], inp), (pt, x["m"])
            assert pt[5] in ALLOWED[x["m"] if x["m"] in ("low", "high") else None]
            assert (pt[5] == "L") <= (x["m"] == "low") and (pt[5] == "V") <= (x["m"] == "high")
            assert pt[2] == (1 if x["m"] == "high" else (-1 if x["m"] == "low" else pt[2]))  # steering class = HBC mark


def test_rule_switches_restrict_actions():
    base = dict(marks=_marks([20, 20, 20, 20]))
    for m, off, gone in (("normal", "rule_discharge", "O"), (None, "rule_hold", "H"), ("high", "rule_feed_in", "V"), ("high", "rule_hold", "H")):
        acts = plan.allowed_actions(m, _inp(**{off: False, **base}))
        assert gone not in acts and acts, (m, off, acts)
    assert plan.allowed_actions("low", _inp(rule_charge=False)) == ["L"]
    assert plan.allowed_actions("high", _inp(rule_discharge=False, rule_hold=False, rule_feed_in=False)) == ["O"]
    assert plan.allowed_actions(None, _inp(rule_discharge=False, rule_hold=False)) == ["Z"]


def test_dp_charges_at_night_for_morning_peak():
    prices = [30, 30, 20, 20, 20, 20, 21, 21, 40, 41, 42, 41]
    marks = {2: "low", 3: "low", 4: "low", 5: "low"}
    r = plan.plan_dp(_inp(marks=_marks(prices, marks), soc=[10], profile=[1500] * 24, charge_w=[2000], discharge_w=[2000],
                           capacity=5, rule_feed_in=False))
    assert any(p[5] == "L" for p in r["punten"][2:6]) and any(p[5] == "O" for p in r["punten"][8:])


def test_dp_actions_map_to_hbc_modes():
    import steering

    ok = {("goedkoop", "L"): "Charge", ("goedkoop", "Z"): "Charge PV", ("goedkoop", "H"): "Standby / peak shave",
          ("gewoon", "Z"): "Charge PV", ("gewoon", "O"): "Self-consumption", ("gewoon", "H"): "Standby / peak shave",
          ("duur", "O"): "Self-consumption", ("duur", "V"): "Sell", ("duur", "H"): "Standby / peak shave"}
    for (cls, a), mode in ok.items():
        assert steering.hbc_mode(cls, a) == mode
    assert steering.price_class(-1) == "goedkoop" and steering.price_class(1) == "duur"


def test_dp_edge_cases():
    assert plan.plan_dp(_inp(marks=[]))["punten"] == []
    r = plan.plan_dp(_inp(capacity=0.5, soc=[50]))  # capacity <= 1: unknown stored energy, no crash
    assert r["ok"] is False
    assert plan.compute(_inp()) ["engine"] == "dp" and plan.compute(_inp(engine="heuristiek"))["engine"] == "heuristiek"


def test_dp_speed():
    import random
    import time

    rnd = random.Random(3)
    inp = _rand_input(rnd, 144)
    inp.capacity, inp.soc = 20, [40]
    t = time.time()
    r = plan.plan_dp(inp)
    dt = time.time() - t
    assert len(r["punten"]) == 144 and dt < 1.0, dt
    return dt


if __name__ == "__main__":
    for k, v in list(globals().items()):
        if k.startswith("test_"):
            v()
            print("ok", k)


def test_hbc_alone_step_matches_simulation():
    """The counter's separate HBC-alone battery uses the same rules as the HBC-alone simulation (05-11-2026)."""
    import random

    rnd = random.Random(5)
    for _ in range(100):
        inp = _rand_input(rnd)
        P = plan._prepare(inp)
        if not P["Q"]:
            continue
        hl, hk, hk0, hs = plan._hbc_alone(P)
        c, s2 = plan.hbc_alone_step(P["Q"][0], P["E"], P["top"], P["laadq"])
        assert abs(c - hk0) < 1e-9
        assert abs(round(s2 + P["marge"], 2) - hl[0][1]) < 0.011


# ---- country (09-11-2026): NL unchanged, DE fixed feed-in tariff, BE capacity limit ----------------
def test_country_defaults_are_nl():
    inp = _inp()
    assert inp.country == "NL" and inp.feed_in_fixed == 0.077 and inp.limit_w is None
    assert all(x["lim"] is None and x["lq"] == plan._prepare(inp)["laadq"] for x in plan._prepare(inp)["Q"])


def test_nl_plan_unchanged_fixed_day():
    """Same plan as before the country change (golden file made with the pre-change plan.py)."""
    import json
    import random

    with open(os.path.join(os.path.dirname(__file__), "fixtures", "plan_nl_20261109.json")) as f:
        golden = json.load(f)
    assert golden
    for g in golden:
        inp = _rand_input(random.Random(g["seed"]), g["n"])
        inp.engine = g["engine"]
        r = plan.compute(inp)
        assert r["punten"] == g["punten"], (g["seed"], g["engine"])
        assert r["kosten_plan"] == g["kosten_plan"] and r["kosten_hbc"] == g["kosten_hbc"]


def test_de_fixed_tariff_and_no_feed_in_action():
    prices = [10, 10, 60, 60, 10, 60, 60, 10]
    marks = {2: "high", 3: "high", 5: "high", 6: "high"}
    kw = dict(marks=_marks(prices, marks), soc=[100], pv={}, pv10={}, discharge_w=[5000])
    de = _inp(country="DE", feed_in_fixed=0.077, **kw)
    P = plan._prepare(de)
    assert all(x["e"] == 0.077 for x in P["Q"])  # fixed, not the market price, no daytime bonus
    assert plan.allowed_actions("high", de) == ["O", "H"]
    for eng in ("dp", "heuristiek"):
        r = plan.compute(_inp(country="DE", engine=eng, **kw))
        assert all(pt[5] != "V" for pt in r["punten"]), eng
    # the same day in NL does sell from the battery (the test would prove nothing otherwise)
    assert any(pt[5] == "V" for pt in plan.compute(_inp(country="NL", **kw))["punten"])
    # solar surplus is paid at the fixed tariff
    pv = {(T0 + 90) // 1800 * 1800: 4.0}
    q = plan._prepare(_inp(country="DE", feed_in_fixed=0.05, marks=_marks([30] * 2), pv=pv, pv10=pv))["Q"][0]
    assert q["e"] == 0.05 and q["need"] < 0


def test_be_limit_caps_charge_power_per_quarter():
    base = dict(charge_w=[5000], discharge_w=[2500], marks=_marks([5] * 4, {0: "low", 1: "low", 2: "low", 3: "low"}))
    nl = plan._prepare(_inp(**base))
    assert nl["laadq"] == 1.25
    be = plan._prepare(_inp(country="BE", limit_w=2500, **base))
    assert all(abs(x["lq"] - (2500 - 400) / 1000 * 0.25) < 1e-9 for x in be["Q"])  # limit minus house use (400 W)
    assert all(abs(x["lim"] - 0.625) < 1e-9 for x in be["Q"])
    assert be["laadq"] == 1.25  # HBC-alone keeps its own charge power
    hi = plan._prepare(_inp(country="BE", limit_w=2500, profile=[3000] * 24, **base))
    assert all(x["lq"] == 0.0 for x in hi["Q"])  # house use above the limit: no grid charging
    off = plan._prepare(_inp(country="BE", limit_w=None, **base))  # peak shaving off
    assert all(x["lq"] == 1.25 and x["lim"] is None for x in off["Q"])
    assert all(x["lq"] == 1.25 and x["lim"] is None for x in plan._prepare(_inp(country="NL", limit_w=2500, **base))["Q"])  # limit only counts for BE


def test_be_penalty_above_limit_and_plan_stays_under_it():
    x = {"lim": 0.625}
    assert plan._cap_pen(x, 0.625) == 0.0 and plan._cap_pen(x, 0.3) == 0.0
    assert abs(plan._cap_pen(x, 0.9) - (0.9 - 0.625) * 4 * 4.45) < 1e-9  # 1.1 kW over the limit x 4.45 EUR/kW
    assert plan._cap_pen({"lim": None}, 5.0) == 0.0
    base = dict(charge_w=[5000], discharge_w=[2500], soc=[10], marks=_marks([5] * 4 + [40] * 4, {i: ("low" if i < 4 else "high") for i in range(8)}))
    nl_acts = [p[5] for p in plan.compute(_inp(**base))["punten"]]
    be_inp = _inp(country="BE", limit_w=2500, **base)
    be_acts = [p[5] for p in plan.compute(be_inp)["punten"]]
    assert plan.evaluate_actions(be_inp, nl_acts)["cap"] > 0  # the NL plan would exceed the limit
    assert plan.evaluate_actions(be_inp, be_acts)["cap"] < 1e-9  # the BE plan does not (float rest only)


def test_be_penalty_makes_dp_discharge_to_flatten_peak():
    base = dict(marks=_marks([20] * 4), soc=[100], profile=[6000] * 24, charge_w=[2500], discharge_w=[2500])
    nl = plan.compute(_inp(**base))
    be = plan.compute(_inp(country="BE", limit_w=2500, **base))
    assert all(p[5] != "O" for p in nl["punten"])  # flat prices: discharging only costs wear
    assert all(p[5] == "O" for p in be["punten"])  # the capacity penalty is worth more than the wear
    assert be["kosten_hbc"] == nl["kosten_hbc"]  # HBC-alone simulation untouched
