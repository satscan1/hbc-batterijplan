"""Offline tests: Flemish capacity tariff (peak.py) and the v1 -> 2.0.0-dev1 settings migration.

Run: python3 test_peak.py   (or pytest). Imports the source in /config/custom_components/batterijplan."""
import os
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
# repo layout (custom_components next to tests) or the /config layout (three folders up)
SRC = next(d for d in (os.path.normpath(os.path.join(HERE, "..", "custom_components", "batterijplan")), os.path.normpath(os.path.join(HERE, "..", "..", "..", "custom_components", "batterijplan")))
           if os.path.exists(os.path.join(d, "vastsim.py")))
sys.path.insert(0, SRC)
import daluren  # noqa: E402
import vastsim  # noqa: E402
import peak  # noqa: E402

AMS = ZoneInfo("Europe/Amsterdam")


def ts(y, mo, d, h, mi=0, s=0):
    return datetime(y, mo, d, h, mi, s, tzinfo=AMS).timestamp()


def feed(acc, t0, t1, w, step=10):
    """Readings every ``step`` seconds from t0 to t1 (like the 10 s timer); returns the quarters that ended."""
    done, t = [], t0
    while t <= t1:
        done += acc.observe(t, w)
        t += step
    return done


def approx(a, b, tol=0.01):
    assert abs(a - b) <= tol, (a, b)


# ---- formula --------------------------------------------------------------------------------
def test_allowed_example():
    # target 2500 W, 300 s at 1000 W: used 0.0833 kWh, budget 0.625 kWh, 1/6 h left -> 3250 W
    acc = peak.QuarterAcc()
    t0 = ts(2026, 11, 16, 10, 0)
    feed(acc, t0, t0 + 300, 1000)
    cur = acc.current(t0 + 300)
    approx(cur["used_kwh"], 1000 * 300 / 3.6e6, 1e-6)
    approx(cur["used_kwh"], 0.0833, 1e-4)
    approx(peak.allowed_w(2500, cur["used_kwh"], cur["elapsed"]), 3250.0, 0.5)


def test_allowed_budget_exhausted_and_clamps():
    assert peak.allowed_w(2500, 0.7, 600) == peak.MIN_ALLOWED_W  # budget used up -> 500 W
    assert peak.allowed_w(2500, 0.0, 0) == 2500.0  # start of quarter: the target itself
    # last seconds: remaining time clamped to 30 s, result clamped to the helper maximum
    assert peak.allowed_w(2500, 0.0, 899) == peak.MAX_ALLOWED_W
    assert peak.allowed_w(2500, 0.62, 899) == peak.MIN_ALLOWED_W or peak.allowed_w(2500, 0.62, 899) >= 500


def test_target_limit():
    assert peak.target_limit(1800, None) == 2500
    assert peak.target_limit(3200, 0) == 3200
    assert peak.target_limit(3200, 4000) == 4000
    assert peak.target_limit(0, 3000) == 3000
    assert peak.target_limit(2000, 3000) == 3000  # own limit (trial mode 3000 W)


def test_should_write():
    assert peak.should_write(None, 2500, 100, None)
    assert not peak.should_write(2500, 2550, 100, None)  # difference <= 100 W
    assert peak.should_write(2500, 2700, 100, None)
    assert not peak.should_write(2500, 2700, 130, 100)  # not within a minute
    assert peak.should_write(2500, 2700, 161, 100)
    assert peak.should_write(2500, 2550, 130, 100, force=True)  # quarter change: always when different
    assert not peak.should_write(2500, 2500, 130, 100, force=True)


# ---- quarter accumulator ---------------------------------------------------------------------
def test_boundary_exact_even_when_late():
    acc = peak.QuarterAcc()
    t0 = ts(2026, 11, 16, 10, 0)
    feed(acc, t0, t0 + 890, 2000)
    done = acc.observe(t0 + 905, 4000)  # reading 5 s after the boundary
    assert len(done) == 1 and done[0]["start"] == int(t0)
    approx(done[0]["ws"], 2000 * 900, 1)  # the 10 s to the boundary count at 2000, not at 4000
    approx(peak.quarter_average(done[0]), 2000, 0.01)
    assert acc.current(t0 + 905)["start"] == int(t0) + 900


def test_net_negative_nets_inside_quarter():
    acc = peak.QuarterAcc()
    t0 = ts(2026, 11, 16, 12, 0)
    feed(acc, t0, t0 + 440, 3000)
    feed(acc, t0 + 450, t0 + 890, -3000)
    done = acc.observe(t0 + 900, 0)
    approx(peak.quarter_average(done[0]), 0.0, 0.01)  # import and injection net out within the quarter


def test_gap_not_counted_and_coverage():
    acc = peak.QuarterAcc()
    t0 = ts(2026, 11, 16, 14, 0)
    feed(acc, t0, t0 + 60, 5000)
    acc.observe(t0 + 70, None)  # sensor gone
    done = acc.observe(t0 + 900, None)
    assert peak.quarter_average(done[0]) is None  # only 60 s measured: no peak from this quarter


def test_skipped_quarters():
    acc = peak.QuarterAcc()
    t0 = ts(2026, 11, 16, 9, 0)
    feed(acc, t0, t0 + 880, 1000)
    done = acc.observe(t0 + 3 * 900 + 10, 1000)  # no readings for 2+ quarters (e.g. HA was down)
    assert [d["start"] for d in done] == [int(t0), int(t0) + 900, int(t0) + 1800]
    assert peak.quarter_average(done[0]) is not None
    assert peak.quarter_average(done[1]) is None  # nothing measured in between: not a peak


# ---- monthly peaks, with and without battery -------------------------------------------------
def test_book_day_and_month_attribution():
    b = peak.PeakBook()
    b.record(ts(2026, 10, 31, 23, 45), 4100, AMS, 5000)  # belongs to October (start of the quarter)
    b.record(ts(2026, 11, 1, 0, 0), 900, AMS, 900)
    b.record(ts(2026, 11, 1, 8, 0), 3000, AMS, 4200)
    b.record(ts(2026, 11, 1, 9, 0), 2000, AMS, 2000)
    assert b.months["2026-10"] == {"piek": 4100, "zonder": 5000}
    assert b.days == {"2026-11-01": 3000.0} and b.days_nb == {"2026-11-01": 4200.0}
    approx(b.peak_now(), 3000)
    approx(b.peak_now_nb(), 4200)


def test_table_saving_trend_order_and_averages():
    b = peak.PeakBook()
    for mo, w, z in [(8, 2000, 2400), (9, 3000, 4500), (10, 2800, 3800)]:
        b.record(ts(2026, mo, 5, 12, 0), w, AMS, z)
    b.record(ts(2026, 11, 5, 12, 0), 3500, AMS, 5500)
    rows = b.table("2026-11", 55)
    assert [r["maand"] for r in rows] == ["2026-11", "2026-10", "2026-09", "2026-08"]  # new to old
    assert [r["trend"] for r in rows] == ["up", "down", "up", None]
    assert rows[0]["lopend"]
    # November: (5.5 - 3.5) kW x 55 / 12 = 9.17 EUR; August: both under 2.5 kW -> 0
    approx(rows[0]["besparing_kw"], 2.0, 1e-6)
    approx(rows[0]["besparing_eur"], 2.0 * 55 / 12, 0.01)
    assert rows[3]["besparing_kw"] == 0.0 and rows[3]["besparing_eur"] == 0.0
    av = b.averages("2026-11")
    assert av["n"] == 4 and av["n_zonder"] == 4
    approx(av["met"], (3500 + 2800 + 3000 + 2500) / 4)  # 2000 counts as 2500 (Fluvius minimum)
    approx(av["zonder"], (5500 + 3800 + 4500 + 2500) / 4)  # 2400 counts as 2500


def test_without_battery_missing_for_some_months():
    b = peak.PeakBook()
    b.record(ts(2026, 9, 5, 12, 0), 3000, AMS)  # no battery sensor then: no 'without' figure
    b.record(ts(2026, 10, 5, 12, 0), 3000, AMS, 4000)
    rows = b.table("2026-10", 55)
    assert rows[1]["zonder"] is None and rows[1]["besparing_eur"] is None
    av = b.averages("2026-10")
    assert av["n"] == 2 and av["n_zonder"] == 1
    approx(av["zonder"], 4000)
    approx(av["met_zelfde"], 3000)  # the saving compares the same months only


def test_table_rolls_over_new_month_and_keeps_13():
    b = peak.PeakBook()
    for i in range(15):
        y, m = divmod(i + 9, 12)
        b.record(ts(2025 + y, m + 1, 3, 12, 0), 2600 + i, AMS, 3000 + i)
    b.roll("2027-01")
    assert len(b.months) <= peak.KEEP_MONTHS
    rows = b.table("2027-01")
    assert len(rows) <= 12 and rows[0]["maand"] > rows[-1]["maand"]
    assert not any(r["lopend"] for r in rows)  # new month without data yet


def test_storage_roundtrip_and_old_format():
    b = peak.PeakBook()
    b.record(ts(2026, 10, 2, 12, 0), 3100, AMS, 4100)
    b.record(ts(2026, 11, 2, 12, 0), 2700, AMS, 3300)
    c = peak.PeakBook.from_dict(b.to_dict())
    assert c.to_dict() == b.to_dict()
    assert peak.PeakBook.from_dict(None).to_dict()["days"] == {}
    old = {"month": "2026-11", "days": {"2026-11-16": 3000}, "prevented": 2, "months": {"2026-10": {"piek": 2800, "voorkomen": 1}}}
    o = peak.PeakBook.from_dict(old)  # book of the first dev1 build: still loads, 'zonder' unknown
    assert o.months["2026-10"] == {"piek": 2800.0, "zonder": None} and o.days == {"2026-11-16": 3000.0}


# ---- QuarterSet: grid without battery, discharge / charge ------------------------------------
def test_quarter_set_channels():
    qs = peak.QuarterSet(("net", "nb", "dis", "chg", "imp"))
    t0 = ts(2026, 11, 16, 3, 0)
    done = []
    t = t0
    while t <= t0 + 905:
        # battery charges 2000 W from the grid: grid import 2500 W (house 500 W); without battery the grid would show 500 W
        net, bat = 2500.0, -2000.0
        done += qs.observe(t, {"net": net, "nb": net + bat, "dis": max(bat, 0), "chg": max(-bat, 0), "imp": max(net, 0)})
        t += 5
    assert len(done) == 1
    q = done[0]
    approx(peak.channel_avg(q, "net"), 2500, 0.5)
    approx(peak.channel_avg(q, "nb"), 500, 0.5)
    approx(peak.channel_kwh(q, "chg"), 0.5, 0.01)  # 2000 W x 0.25 h
    approx(peak.channel_kwh(q, "dis"), 0.0, 1e-6)


def test_energy_value_and_night_window():
    # discharge 0.5 kWh at 0.30; charged 0.5 kWh, all from the grid: value 0 (a cycle at one price earns nothing)
    approx(peak.energy_value(0.5, 0.5, 0.8, 0.30), 0.0)
    # charge from solar (no import): valued at 0 -> the discharge is pure gain
    approx(peak.energy_value(0.5, 0.5, 0.0, 0.30), 0.15)
    # day/night: charge at night price, discharge at day price
    approx(peak.energy_value(0.0, 0.5, 0.6, 0.25), -0.125)
    approx(peak.energy_value(0.5, 0.0, 0.0, 0.35), 0.175)
    assert peak.in_night(23, 22, 7) and peak.in_night(3, 22, 7) and not peak.in_night(7, 22, 7) and not peak.in_night(12, 22, 7)
    assert peak.in_night(1, 0, 6) and not peak.in_night(6, 0, 6)
    assert not peak.in_night(5, 5, 5)  # from == to: no night
    assert peak.day_night_price(23, 22, 7, 0.35, 0.25) == 0.25 and peak.day_night_price(10, 22, 7, 0.35, 0.25) == 0.35


# ---- migration v1 -> 2.0.0-dev1 --------------------------------------------------------------
def test_v1_settings_survive_and_new_defaults_keep_v1_behaviour():
    sys.path.insert(0, SRC)
    import const  # noqa: E402  (no Home Assistant imports in const.py)

    v1_options = {"capaciteit": 9.0, "marge": 0.4, "opslag": 0.0123, "land": "NL", "sensor_net": "sensor.p1",
                  "sensor_batterij": "sensor.bat", "contract_start": "2025-03-01"}
    merged = {**const.DEFAULTS, **v1_options}  # what coordinator.load_settings does
    for k, v in v1_options.items():
        assert merged[k] == v  # nothing of v1 is overwritten
    assert merged[const.CONF_CONTRACT_TYPE] == const.CONTRACT_DYNAMIC  # v1 behaviour: Dynamic + plan
    assert merged[const.CONF_FLANDERS] is False and const.CONF_COUNTRY not in const.DEFAULTS  # Flanders switch off; the country comes from HA
    assert merged["land"] == "NL"  # a stored v1 value is not touched here; the migration at setup handles it
    assert merged[const.CONF_CAP_TARIFF] == 55
    assert merged[const.CONF_OWN_LIMIT] == 0
    assert merged[const.CONF_NIGHT_FROM] is None and merged[const.CONF_NIGHT_TO] is None and merged[const.CONF_WEEKEND] is None  # country default
    assert const.STORAGE_VERSION == 1  # the stored data of v1 is read as before (additive keys only)


def test_energy_value_with_feed_in_and_safe_used_estimate():
    # solar charge costs the feed-in price it no longer earns: 0.5 kWh discharged to the house at 0.30, 0.5 kWh solar charge at 0.12
    approx(peak.energy_value(0.5, 0.5, 0.0, 0.30, 0.0, 0.12), 0.5 * 0.30 - 0.5 * 0.12)
    # discharge that went to the grid earns the feed-in price instead of the import price
    approx(peak.energy_value(0.5, 0.0, 0.0, 0.30, 0.5, 0.12), 0.06)
    approx(peak.energy_value(0.5, 0.0, 0.0, 0.30, 0.2, 0.12), 0.3 * 0.30 + 0.2 * 0.12)
    # after a restart in the middle of a quarter the unmeasured part counts at the target, not as zero:
    # 840 s elapsed, only 40 s measured at 0 W -> allowed stays near the target instead of the 25 kW cap
    cur = {"elapsed": 840.0, "covered": 40.0, "used_kwh": 0.0}
    est = peak.used_estimate(cur, 2500)
    approx(est, 800 * 2500 / 3.6e6, 1e-6)
    approx(peak.allowed_w(2500, est, 840), 4166.7, 1.0)  # pro-rata for the last minute, far from the 25 kW cap
    assert peak.allowed_w(2500, 0.0, 840) == peak.MAX_ALLOWED_W  # the old behaviour that was wrong
    approx(peak.used_estimate({"elapsed": 600.0, "covered": 600.0, "used_kwh": 0.1}, 2500), 0.1, 1e-9)


def test_ha_country_and_options_migration():
    import const
    assert [const.ha_country(c) for c in ("NL", "be", "De", None, "", "FR", "US")] == ["nl", "be", "de", "nl", "nl", "nl", "nl"]
    # v1 / dev entry with land 'be': the Flanders switch goes on, land and trial mode are dropped, everything else stays
    old = {"capaciteit": 9.0, "land": "be", "proefmodus_be": True, "contract_soort": "dag_nacht", "prijs_dag": 0.25895}
    new = const.migrate_options({"sensor_net": "sensor.p1"}, old)
    assert new == {"capaciteit": 9.0, "vlaanderen": True, "contract_soort": "vast", "tarief": "dubbel", "prijs_dag": 0.25895}
    # Adrie: land nl, trial off -> stays off, contract becomes Fixed + dual rate, prices kept
    new = const.migrate_options({}, {"land": "nl", "proefmodus_be": False, "contract_soort": "dag_nacht", "prijs_dag": 0.25895, "prijs_nacht": 0.23172})
    assert new == {"contract_soort": "vast", "tarief": "dubbel", "prijs_dag": 0.25895, "prijs_nacht": 0.23172}
    assert "vlaanderen" not in new
    # land only in the entry data (v1): be -> Flanders on, once; a later explicit 'off' is not turned on again
    assert const.migrate_options({"land": "be"}, {})["vlaanderen"] is True
    assert const.migrate_options({"land": "be"}, {"vlaanderen": False}) is None
    assert const.migrate_options({"land": "nl"}, {"capaciteit": 9.0}) is None  # nothing to do: no change
    assert const.migrate_options({}, {"land": "BE"})["vlaanderen"] is True  # stored upper case


def test_contract_two_steps_and_migration():
    import const
    ic, mc = const.internal_contract, const.migrate_contract
    assert ic("dynamisch", "enkel") == "dynamisch" and ic("dynamisch", "dubbel") == "dynamisch"
    assert ic("vast", "enkel") == "vast" and ic("vast", "dubbel") == "dag_nacht" and ic("vast", None) == "vast"
    assert ic("dag_nacht", "enkel") == "dag_nacht"  # value of the first dev build, before it is migrated
    assert ic("", None) == "dynamisch" and ic(None, None) == "dynamisch"
    assert mc("dag_nacht") == {"contract_soort": "vast", "tarief": "dubbel"}  # Adrie ends up on Fixed + dual rate
    assert ic(mc("dag_nacht")["contract_soort"], mc("dag_nacht")["tarief"]) == "dag_nacht"  # same internal logic as before
    assert mc("vast") is None and mc("dynamisch") is None and mc(None) is None
    assert const.CONTRACTS == ["vast", "dynamisch"] and const.TARIFFS == ["enkel", "dubbel"]
    assert const.DEFAULTS[const.CONF_FEED_IN_PRICE] == 0.0 and const.DEFAULTS[const.CONF_TARIFF] == "enkel"


def test_real_dashboard_files_have_contract_and_flanders_windows():
    # text checks only (no YAML parser in this environment): the three ready-made dashboards carry the new settings and the cards
    base = os.path.join(SRC, "dashboard")
    for name in ("batterijplan_dashboard.yaml", "batterijplan_dashboard.nl.yaml", "batterijplan_dashboard.de.yaml"):
        t = open(os.path.join(base, name), encoding="utf-8").read()
        for ent in ("select.batterijplan_contract_soort", "select.batterijplan_tarief", "number.batterijplan_prijs_vast", "number.batterijplan_prijs_dag",
                    "number.batterijplan_prijs_nacht", "number.batterijplan_terugleverprijs", "number.batterijplan_nacht_van", "number.batterijplan_nacht_tot",
                    "switch.batterijplan_dal_weekend", "switch.batterijplan_vlaanderen", "number.batterijplan_capaciteitstarief", "number.batterijplan_eigen_grens"):
            assert ent in t, (name, ent)
        assert "toon: switch.batterijplan_vlaanderen" in t  # the peak window is only shown with Flanders on
        assert "type: custom:batterijplan-piek" in t and "type: custom:batterijplan-kwartier" in t
        assert t.count("reden:") >= 10 + 8 + 2  # dynamic-only rows (10) + contract tab (8) + Flanders tab (2): greyed with a reason
        for old in ("number.batterijplan_capaciteit", "select.batterijplan_hbc_prijzen", "switch.batterijplan_regel_laden", "text.batterijplan_sensor_net",
                    "custom:batterijplan-capaciteit", "custom:batterijplan-opbrengst", "number.batterijplan_marge"):
            assert old in t, (name, old)  # nothing that was already there is gone


# ---- expected battery level under a Fixed contract ----------------------------------------------
def _sim(level0=4.0, n=40, house=500.0, sun=0.0, gc=lambda ts: False, target=9.11, limit=None, cap=9.0, cq=1.25, dq=1.25, start=0):
    return vastsim.simulate(start_ts=start, n=n, level0=level0, cap=cap, charge_q=cq, discharge_q=dq, house_w=lambda ts: house,
                            pv_kw=lambda ts: sun, grid_charge=gc, target_kwh=target, limit_w=limit)


def test_sim_nom_discharges_house_until_empty():
    rows = _sim(level0=4.0, house=500.0)  # 0.125 kWh per quarter: empty after 32 quarters
    assert rows[0][2] == "O" and approx(rows[0][1], 3.875, 1e-6) is None
    assert rows[31][1] == 0.0 and rows[31][2] == "O" and rows[32][2] == "N" and rows[39][2] == "N"
    assert all(r[3] == 0 for r in rows)
    s = vastsim.summarize(rows, 4.0, 9.0)
    assert s["nu"] == "O" and s["leeg"] == rows[31][0] and s["vol"] is None and s["dal"] is None


def test_sim_solar_surplus_charges_within_limits():
    rows = _sim(level0=8.0, house=300.0, sun=3.0)  # 0.75 - 0.075 = 0.675 kWh per quarter surplus
    assert rows[0][2] == "Z" and approx(rows[0][1], 8.675, 1e-6) is None
    assert rows[1][1] == 9.0 and rows[1][2] == "Z" and rows[2][2] == "N"  # full: nothing more
    rows = _sim(level0=0.0, house=0.0, sun=20.0)  # charge power limits: 1.25 kWh per quarter
    assert rows[0][1] == 1.25
    assert vastsim.summarize(rows, 0.0, 9.0)["vol"] == rows[7][0]  # 9.0 reached in the 8th quarter


def test_sim_off_peak_charges_from_the_grid_to_the_hbc_target():
    rows = _sim(level0=2.0, house=500.0, gc=lambda ts: True, n=12)
    assert [r[2] for r in rows[:6]] == ["L"] * 6 and rows[5][1] == 9.0  # target 9.11 capped at the usable capacity 9.0
    assert rows[6][2] == "N" and all(r[3] == 1 for r in rows)
    rows = _sim(level0=2.0, gc=lambda ts: True, target=5.0, n=6)
    assert rows[0][1] == 3.25 and rows[1][1] == 4.5 and rows[2][1] == 5.0 and rows[3][2] == "N"  # stops at the lower HBC target


def test_sim_flanders_limit_caps_the_grid_charge():
    rows = _sim(level0=0.0, house=500.0, gc=lambda ts: True, limit=3000.0, n=2)
    assert approx(rows[0][1], 0.625, 1e-6) is None  # (3000 - 500) W x 0.25 h
    rows = _sim(level0=0.0, house=3500.0, gc=lambda ts: True, limit=3000.0, n=2)
    assert rows[0][2] == "N" and rows[0][1] == 0.0  # no room under the limit: no charging


def test_sim_summary_timeline_dal_block_and_day_part():
    # 22:00 start: evening NOM (house 400 W), 23:00-07:00 off-peak charge, then a sunny day
    from datetime import timedelta
    t0 = int(ts(2026, 11, 16, 22, 0))
    hour = lambda t: datetime.fromtimestamp(t, AMS).hour
    gc = lambda t: hour(t) >= 23 or hour(t) < 7
    pv = lambda t: 2.5 if 10 <= hour(t) < 15 else 0.0
    rows = vastsim.simulate(start_ts=t0, n=96, level0=3.0, cap=9.0, charge_q=1.25, discharge_q=1.25, house_w=lambda t: 400.0, pv_kw=pv, grid_charge=gc, target_kwh=9.11)
    s = vastsim.summarize(rows, 3.0, 9.0)
    assert s["nu"] == "O" and s["dal"]["van"] == t0 + 3600 and s["dal"]["tot"] == t0 + 9 * 3600 and not s["dal"]["lopend"]
    approx(s["dal"]["naar"], 9.0, 1e-6)  # full before the end of the night
    assert s["dag"]["dag_ts"] == t0 + 9 * 3600 and s["dag"]["zon"] is True  # the day after the night: NOM, sun tops up
    assert s["leeg"] is None  # 3.0 - 0.1 per quarter lasts four quarters before the night starts: not empty before charging


def test_night_charge_decision_pays_threshold_and_flanders():
    d = vastsim.night_charge_decision
    # Adrie: normal 0.24694, off-peak 0.21971 = 2.72 ct, HBC threshold 6 ct: does not pay, HBC stays on Self-consumption
    ok, why, diff = d(off_peak=True, flanders=False, normal=0.24694, dal=0.21971, threshold_ct=6.0)
    assert (ok, why) == (False, "loont_niet") and diff == 2.72
    # above the threshold: charges
    assert d(off_peak=True, flanders=False, normal=0.30, dal=0.20, threshold_ct=6.0)[:2] == (True, "loont")
    assert d(off_peak=True, flanders=False, normal=0.26, dal=0.20, threshold_ct=6.0)[:2] == (True, "loont")  # exactly 6 ct counts
    assert d(off_peak=True, flanders=False, normal=0.2599, dal=0.20, threshold_ct=6.0)[:2] == (False, "loont_niet")
    assert d(off_peak=True, flanders=False, normal=0.24694, dal=0.21971, threshold_ct=2.0)[:2] == (True, "loont")  # a lower HBC threshold follows
    # outside the off-peak hours never, however big the difference
    assert d(off_peak=False, flanders=False, normal=0.50, dal=0.10, threshold_ct=6.0)[:2] == (False, "geen_dal")
    # Flanders: charging in the off-peak hours may fill the reserve for peaks, whatever the price difference, only under the limit
    assert d(off_peak=True, flanders=True, normal=0.24694, dal=0.21971, threshold_ct=6.0)[:2] == (True, "vlaanderen")
    assert d(off_peak=True, flanders=True, normal=0.24694, dal=0.21971, threshold_ct=6.0, headroom_ok=False)[:2] == (False, "geen_ruimte")
    assert d(off_peak=False, flanders=True, normal=0.24694, dal=0.21971, threshold_ct=6.0)[:2] == (False, "geen_dal")
    # the simulation follows the same decision: no blue charging block when it does not pay
    hour = lambda t: datetime.fromtimestamp(t, AMS).hour
    t0 = int(ts(2026, 11, 16, 22, 0))
    off = lambda t: hour(t) >= 23 or hour(t) < 7
    def run(flanders, diff_pays):
        gc = lambda t: d(off_peak=off(t), flanders=flanders, normal=0.30 if diff_pays else 0.24694, dal=0.20 if diff_pays else 0.21971, threshold_ct=6.0)[0]
        return vastsim.simulate(start_ts=t0, n=40, level0=3.0, cap=9.0, charge_q=1.25, discharge_q=1.25, house_w=lambda t: 400.0, pv_kw=lambda t: 0.0, grid_charge=gc, target_kwh=9.11)
    assert not any(r[2] == "L" for r in run(False, False)) and not any(r[3] for r in run(False, False))
    assert any(r[2] == "L" for r in run(False, True)) and any(r[2] == "L" for r in run(True, False))
    assert vastsim.summarize(run(False, False), 3.0, 9.0)["dal"] is None and vastsim.summarize(run(False, True), 3.0, 9.0)["dal"]["laadt"]


def test_summary_day_part_is_relative_to_now_evening_night_morning():
    hour = lambda t: datetime.fromtimestamp(t, AMS).hour
    sun = lambda t: 2.0 if 10 <= hour(t) < 15 else 0.0

    def day(start):  # charging from the grid does not pay: no off-peak block, only NOM
        rows = vastsim.simulate(start_ts=int(start), n=120, level0=5.0, cap=9.0, charge_q=1.25, discharge_q=1.25, house_w=lambda t: 400.0, pv_kw=sun,
                                grid_charge=lambda t: False, target_kwh=9.11)
        return vastsim.summarize(rows, 5.0, 9.0, hour_of=hour)["dag"]
    # evening 20:00 on 16-11: the next daytime block is tomorrow 07:00 (not 'today')
    d = day(ts(2026, 11, 16, 20, 0))
    assert d["dag_ts"] == int(ts(2026, 11, 17, 7, 0)) and d["zon"] is True
    # night 01:00 on 17-11 (after midnight): the daytime block is this morning 07:00, i.e. on the current calendar day
    assert day(ts(2026, 11, 17, 1, 0))["dag_ts"] == int(ts(2026, 11, 17, 7, 0))
    # morning 09:00: the block is the one running now
    assert day(ts(2026, 11, 17, 9, 0))["dag_ts"] == int(ts(2026, 11, 17, 9, 0))
    # 19:00 sharp: daytime is over, tomorrow
    assert day(ts(2026, 11, 17, 19, 0))["dag_ts"] == int(ts(2026, 11, 18, 7, 0))
    # with a charging block (dual rate pays) the day part is the one after the block
    gc = lambda t: hour(t) >= 23 or hour(t) < 7
    rows = vastsim.simulate(start_ts=int(ts(2026, 11, 16, 20, 0)), n=120, level0=3.0, cap=9.0, charge_q=1.25, discharge_q=1.25, house_w=lambda t: 400.0, pv_kw=sun, grid_charge=gc, target_kwh=9.11)
    sm = vastsim.summarize(rows, 3.0, 9.0, hour_of=hour)
    assert sm["dal"]["tot"] == int(ts(2026, 11, 17, 7, 0)) and sm["dag"]["dag_ts"] == int(ts(2026, 11, 17, 7, 0))
    # a block 2+ days ahead is named by the card (weekday name); here: sun forecast missing -> no 'zon'
    rows = vastsim.simulate(start_ts=int(ts(2026, 11, 16, 20, 0)), n=120, level0=5.0, cap=9.0, charge_q=1.25, discharge_q=1.25, house_w=lambda t: 400.0, pv_kw=lambda t: 0.0, grid_charge=lambda t: False, target_kwh=9.11)
    assert vastsim.summarize(rows, 5.0, 9.0, hour_of=hour)["dag"]["zon"] is False


# ---- off-peak hours: night, weekend, public holidays -----------------------------------------
def test_easter_and_dutch_holidays():
    from datetime import date
    assert daluren.easter(2026) == date(2026, 4, 5) and daluren.easter(2027) == date(2027, 3, 28) and daluren.easter(2025) == date(2025, 4, 20)
    h = daluren.holidays("nl", 2026)
    assert h == {date(2026, 1, 1), date(2026, 4, 6), date(2026, 4, 27), date(2026, 5, 14), date(2026, 5, 25), date(2026, 12, 25), date(2026, 12, 26)}
    assert date(2026, 4, 26) not in h
    assert date(2025, 4, 26) in daluren.holidays("nl", 2025)  # 27 April 2025 is a Sunday -> King's Day on the 26th
    assert date(2027, 5, 6) in daluren.holidays("nl", 2027) and date(2027, 3, 29) in daluren.holidays("nl", 2027)
    assert date(2026, 11, 11) in daluren.holidays("be", 2026) and daluren.holidays("de", 2026) == set()


def test_is_dal_nl_working_day_weekend_holiday():
    def dal(y, mo, d, h, weekend=True, f=23, t=7, c="nl"):
        return daluren.is_dal(datetime(y, mo, d, h, 30, tzinfo=AMS), c, f, t, weekend)
    assert not dal(2026, 11, 16, 12) and not dal(2026, 11, 16, 22) and dal(2026, 11, 16, 23) and dal(2026, 11, 17, 6) and not dal(2026, 11, 17, 7)  # Monday / Tuesday
    assert dal(2026, 11, 21, 12) and dal(2026, 11, 22, 15)  # Saturday, Sunday all day
    assert dal(2026, 4, 6, 14) and dal(2026, 4, 27, 10) and dal(2026, 12, 25, 12)  # 2nd Easter day, King's Day (Monday), Christmas (Friday)
    assert not dal(2026, 11, 21, 12, weekend=False) and dal(2026, 11, 21, 2, weekend=False)  # weekend rule off: only the night
    assert dal(2026, 11, 16, 21, f=21, t=7)  # Enexis: night from 21:00
    assert not daluren.is_dal(datetime(2026, 11, 21, 12, tzinfo=AMS), "be", 22, 7, False)  # Belgium: no weekend rule by default
    assert daluren.default_night("nl") == (23, 7) and daluren.default_night("be") == (22, 7)
    assert daluren.default_weekend("nl") is True and daluren.default_weekend("be") is False


if __name__ == "__main__":
    n = 0
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            fn()
            n += 1
            print("ok", name)
    print(n, "tests passed")
