"""Offline tests for steering, profile and counter (pytest or plain python)."""
import os
import sys
from datetime import date, datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "custom_components", "batterijplan"))
import counter  # noqa: E402
import consumption as profile  # noqa: E402
import solcast  # noqa: E402
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


def _pt(t, act, charge):
    return [t, 10.0, -1, "Z", 0, act, charge, 0.0]


def test_charge_target_block():
    q = 900
    pts = [_pt(0, "Z", 1.0), _pt(q, "L", 2.5), _pt(2 * q, "L", 4.0), _pt(3 * q, "Z", 4.0), _pt(4 * q, "L", 6.0)]
    t = steering.charge_target(pts, 1.0)
    assert t == {"doel": 4.0, "start": q, "einde": 3 * q}  # first block only, not the later one
    assert steering.charge_target([_pt(0, "L", 3.0), _pt(2 * q, "L", 5.0)], 1.0)["doel"] == 3.0  # gap: not consecutive
    assert steering.charge_target([_pt(0, "Z", 1.0), _pt(q, "O", 0.5)], 1.2) == {"doel": 1.2, "start": None, "einde": None}
    assert steering.charge_target([], 1.0) is None and steering.charge_target(None, 1.0) is None
    assert steering.charge_target(pts, None) is None


def test_hbc_forecast_value():
    # HBC rule: surplus = max(F - R, 0); wanted = max(emax - surplus, 0)  ->  wanted == target
    def wanted(f, r, emax):
        return max(emax - max(f - r, 0), 0)
    for target in (0.0, 2.5, 6.0, 8.9):
        f = steering.hbc_forecast_value(target, 8.0, 9.0)
        assert abs(wanted(f, 8.0, 9.0) - target) < 0.01
    assert wanted(steering.hbc_forecast_value(9.0, 8.0, 9.0), 8.0, 9.0) == 9.0  # target = max: full charge
    assert wanted(steering.hbc_forecast_value(12.0, 8.0, 9.0), 8.0, 9.0) == 9.0  # above max: still full
    assert steering.hbc_forecast_value(5.0, 0.0, 3.0) == 0.0  # clamped at zero


PLAN = [_pt(900, "L", 2.5), _pt(1800, "L", 4.0), _pt(2700, "Z", 4.0)]
ON = dict(live=True, dynamic=True, rule_charge=True, points=PLAN, stored_now=1.0, reserved=8.0, hbc_max=9.0, source_value=17.3)


def test_solar_for_hbc_steering():
    r = steering.solar_for_hbc(**ON)
    assert r["modus"] == "laaddoel" and r["value"] == steering.hbc_forecast_value(4.0, 8.0, 9.0) == 13.0


def test_solar_for_hbc_passthrough_each_case():
    """Whenever one condition fails the real source value comes through 1:1 (never None, never the target)."""
    cases = {
        "live uit": dict(live=False),
        "HBC niet op Dynamic": dict(dynamic=False),
        "regel laden uit": dict(rule_charge=False),
        "geen plan": dict(points=[]),
        "geen plan ": dict(points=None),
        "geen plan  ": dict(stored_now=None),
        "reserve of maximum onbekend": dict(reserved=-1.0),
        "reserve of maximum onbekend ": dict(hbc_max=0.0),
    }
    for reden, change in cases.items():
        r = steering.solar_for_hbc(**{**ON, **change})
        assert r["modus"] == "doorgifte" and r["value"] == 17.3 and r["reden"] == reden.strip(), (reden, r)
    # the source itself has no number: nothing to pass on
    assert steering.solar_for_hbc(**{**ON, "live": False, "source_value": None})["value"] is None


def test_solcast_resolve():
    exists = lambda e: e in have  # noqa: E731
    have = {"sensor.solcast_pv_forecast_prognose_heute", "sensor.solcast_pv_forecast_voorspelling_morgen",
            "sensor.solcast_pv_forecast_prognose_verbleibende_leistung_heute"}
    # nothing by platform: known ids, English -> Dutch -> German, per sensor
    assert solcast.resolve({}, {}, exists) == {
        "vandaag": "sensor.solcast_pv_forecast_prognose_heute", "morgen": "sensor.solcast_pv_forecast_voorspelling_morgen",
        "rest": "sensor.solcast_pv_forecast_prognose_verbleibende_leistung_heute"}
    have.add("sensor.solcast_pv_forecast_forecast_today")  # English wins over German
    assert solcast.resolve({}, {}, exists)["vandaag"] == "sensor.solcast_pv_forecast_forecast_today"
    # platform (translation key / unique id, language-independent) beats the known ids
    plat = solcast.platform_ids([("sensor.zon_x", "total_kwh_forecast_today", "u1"), ("sensor.zon_y", None, "get_remaining_today"),
                                 ("sensor.piek", "peak_w_today", "peak_w_today")])
    assert plat == {"vandaag": "sensor.zon_x", "rest": "sensor.zon_y"}
    r = solcast.resolve({}, plat, exists)
    assert r["vandaag"] == "sensor.zon_x" and r["rest"] == "sensor.zon_y"
    # a filled-in field always wins, even over the platform
    assert solcast.resolve({"vandaag": " sensor.mijn_zon "}, plat, exists)["vandaag"] == "sensor.mijn_zon"
    # nothing found at all: None (the report then says 'not found' with the tip)
    assert solcast.resolve({}, {}, lambda e: False) == {"vandaag": None, "morgen": None, "rest": None}
    assert solcast.KNOWN["rest"][2].endswith("prognose_verbleibende_leistung_heute")


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
