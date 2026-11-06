"""Offline tests: exact replica of HBC's marking (hbcmarks.py) against the live marks of 06-11-2026."""
import json
import math
import os
import sys
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

HERE = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(HERE, "..", "custom_components", "batterijplan"))
import hbcmarks  # noqa: E402

FIX = json.load(open(os.path.join(HERE, "fixtures", "hbc_marks_20261106.json")))
AMS = ZoneInfo("Europe/Amsterdam")


def _days(tz):
    return [datetime.fromtimestamp(m[0] / 1000, tz).date() for m in FIX["marks"]]


def _marks(tz=AMS, **kw):
    s = dict(FIX["settings"])
    s.update(kw)
    return hbcmarks.mark_quarters(FIX["prices"], _days(tz), s["min_delta"], s["cheapest_hrs"], s["expensive_hrs"], FIX["datapoints_per_hour"])


def test_replica_matches_todays_real_marks():
    """HBC v4.15.1, settings 8 h / 8 h / 6 ct: every one of the 96 quarters gets exactly the mark sensor.hbc_energy_prices_data has."""
    real = [m[1] for m in FIX["marks"]]
    got = _marks()
    assert len(got) == len(real) == 96
    assert got == real
    assert got.count("low") == 32 and got.count("high") == 32  # 8 h = 32 quarters each


def test_days_are_local_calendar_days():
    """HBC buckets by the local calendar day (JS getFullYear/getMonth/getDate). UTC days would split today in two and give other marks."""
    real = [m[1] for m in FIX["marks"]]
    assert _marks(timezone.utc) != real


def test_caps_and_threshold():
    n = lambda marks, w: sum(1 for m in marks if m == w)  # noqa: E731
    m = _marks(cheapest_hrs=2, expensive_hrs=3)
    assert n(m, "low") == 8 and n(m, "high") == 12  # round(2 * 4), round(3 * 4)
    m = _marks(cheapest_hrs=0, expensive_hrs=0)  # 0 hours = no cap: every viable pair
    assert n(m, "low") == n(m, "high") > 32
    assert n(_marks(min_delta=100), "low") == 0  # spread never reaches the threshold
    assert hbcmarks.min_delta_cents("6.9") == 6 and hbcmarks.min_delta_cents("x") == 0
    assert hbcmarks.js_round(2.5) == 3 and hbcmarks.js_round(0.375 * 4) == 2  # half up, not banker's rounding


def test_pairs_inward_stable_ties_and_asymmetric_caps():
    # one day, 6 quarters; sorted ascending: idx 1 (1), 3 (1, tie keeps time order), 0 (5), 2 (9), 5 (12), 4 (30)
    prices = [5, 1, 9, 1, 30, 12]
    day = [0] * 6
    got = hbcmarks.mark_quarters(prices, day, 6, 0, 0, 1)
    # pairs: (1,4) 29>=6, (3,5) 11>=6, (0,2) 4<6 stop
    assert got == [None, "low", None, "low", "high", "high"]
    # high capped at 1 quarter, low at 2: 2 lows + 1 high (asymmetric), no break after the high cap
    got = hbcmarks.mark_quarters(prices, day, 6, 2, 1, 1)
    assert got == [None, "low", None, "low", "high", None]
    # two days are paired separately
    got = hbcmarks.mark_quarters([1, 20, 1, 20], ["a", "a", "b", "b"], 6, 0, 0, 1)
    assert got == ["low", "high", "low", "high"]


if __name__ == "__main__":
    for k, v in list(globals().items()):
        if k.startswith("test_"):
            v()
            print("ok", k)
