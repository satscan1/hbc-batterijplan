"""Offline tests for steering, profile and counter (pytest or plain python)."""
import os
import sys
from datetime import date, datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "custom_components", "batterijplan"))
import counter  # noqa: E402
import consumption as profile  # noqa: E402
import steering  # noqa: E402


def test_steering_table():
    assert steering.hbc_mode("duur", "H") == "Standby / peak shave"
    assert steering.hbc_mode("duur", "V") == "Sell"
    assert steering.hbc_mode("duur", "O") == "Self-consumption"
    assert steering.hbc_mode("goedkoop", "L") == "Charge"
    assert steering.hbc_mode("goedkoop", "H") == "Standby / peak shave"
    assert steering.hbc_mode("goedkoop", "Z") == "Charge PV"
    assert steering.hbc_mode("gewoon", "O") == "Self-consumption"
    assert steering.hbc_mode("gewoon", "V") == "Self-consumption"
    assert steering.hbc_mode("gewoon", "L") == "Charge PV"  # HBC has no Charge in normal quarters
    assert steering.price_class(2) == "gewoon" and steering.price_class(1) == "duur" and steering.price_class(-1) == "goedkoop"
    assert steering.steer([0, 30, 1, "O", 5, "H", 5, 0]) == ("duur", "input_select.house_battery_strategy_dynamic_expensive", "Standby / peak shave")
    assert steering.steer([]) is None


def test_profile_learning():
    p = profile.Profile()
    t = datetime(2026, 11, 4, 14, 13)
    p1 = profile.update(p, t, 800)
    assert p1.uur[14] == 800 and p1.n[14] == 1 and p1.uur[13] is None
    p2 = profile.update(p1, t, 1000)
    assert p2.uur[14] == 900 and p2.n[14] == 2
    assert profile.update(p2, t, -1).uur[14] == 900  # unknown: nothing learned
    assert p2.state == "aan het leren"


def test_block_reliability():
    p = profile.Profile(uur=[500] * 24, n=[28] * 24, bt_maat="blok3", bt_blok="20261104-4", bt_bw=3000, bt_bp=3000, bt_bk=12, bt_n=10, bt_gem=3000)
    p2 = profile.update(p, datetime(2026, 11, 4, 15, 13), 500)  # new block: previous block is settled
    assert p2.bt_n == 11 and p2.bt_bk == 1
    assert profile.reliability(p2) == 100
    assert profile.verdict(None) == "nog aan het meten" and profile.verdict(80) == "zeer goed"
    assert profile.colour(2, None) == "grijs1" and profile.colour(8, 90) == "groen4"


def test_step_average():
    a = profile.StepAverage(900)
    a.add(0, 100)
    a.add(450, 300)
    assert abs(a.average(900) - 200) < 1e-6


def test_counter():
    assert abs(counter.quarter_value(0.5, 0.3, 4.0, 5.0, 0.2) - 0.4) < 1e-9
    assert counter.contract_year_start(date(2026, 11, 4), date(2025, 3, 1)) == date(2026, 3, 1)
    assert counter.contract_year_start(date(2026, 2, 4), date(2025, 3, 1)) == date(2025, 3, 1)
    assert counter.contract_year_start(date(2026, 2, 4), None) == date(2026, 1, 1)


if __name__ == "__main__":
    for k, v in list(globals().items()):
        if k.startswith("test_"):
            v()
            print("ok", k)
