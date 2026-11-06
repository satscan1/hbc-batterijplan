"""Coordinator: reads Home Assistant, runs plan.py, steers HBC, learns consumption, counts value."""
from __future__ import annotations

import logging
import time
from collections import deque
from functools import partial
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Context, Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_call_later, async_track_state_change_event, async_track_time_change
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util
from zoneinfo import ZoneInfo

from . import consumption as profile
from . import advisor, counter, hbcmarks, plan, solcast, steering
from .const import (
    CONF_BONUS_FROM, CONF_BONUS_TO, CONF_CAPACITY, CONF_CONTRACT_START, CONF_FEED_IN_BONUS, CONF_FEED_IN_FEE,
    CONF_MARGIN, CONF_PRICES, CONF_SENSOR_BATTERY, CONF_SENSOR_EV, CONF_SENSOR_NET, CONF_SENSOR_SOLAR,
    CONF_STORAGE_FEE, CONF_VAT, DEFAULTS, DOMAIN, HBC_COUNT, HBC_DELTA, HBC_FORECAST_POINTER, HBC_MAX_ENERGY, HBC_PRICES, HBC_RESERVED, HBC_SETTINGS, HBC_STRATEGY,
    CONF_SOLAR_TODAY, CONF_SOLAR_TOMORROW, OWN_SOLAR_SENSOR, PRICES_ALL_IN,
    STORAGE_VERSION, SWITCH_RULES, VERSION,
)

_LOGGER = logging.getLogger(__name__)
HBC_LABEL = {"cheapest": "cheapest hours", "expensive": "expensive hours", "solar": "solar reserved for house"}
BAD = ("unknown", "unavailable", "none", "None", "", "nan")
SOLCAST_FALLBACK = ["sensor.solcast_pv_forecast_forecast_today", "sensor.solcast_pv_forecast_forecast_tomorrow"]

BatterijplanConfigEntry = ConfigEntry["BatterijplanCoordinator"]


def _fmt(v: float | None) -> str:
    return "?" if v is None else (str(int(v)) if float(v).is_integer() else f"{v:g}")


class BatterijplanCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """One coordinator for the whole integration; it is push-driven (timers and state changes)."""

    config_entry: BatterijplanConfigEntry

    def __init__(self, hass: HomeAssistant, entry: BatterijplanConfigEntry) -> None:
        super().__init__(hass, _LOGGER, config_entry=entry, name=DOMAIN, update_interval=None)
        self._store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}")
        self.settings: dict[str, Any] = {}
        self.live = False
        self.rules = {k: True for k in SWITCH_RULES}
        self.profile = profile.Profile()
        self.avg = profile.StepAverage(900)
        self.consumption_w: float | None = None
        self.plan_result: dict[str, Any] = {}
        self.price_now: float | None = None
        # counter
        self.cnt: dict[str, Any] = {"total": 0.0, "live": 0.0, "schaduw": 0.0, "sinds": "", "base": 0.0,
                                    "base_start": "", "n_hold": 0, "n_feed": 0, "n_discharge": 0, "pending": None,
                                    "schaduw_t": 0.0, "schaduw_nieuw": False,
                                    "s_cf": None, "cf_dag": ""}
        self.remembered: dict[str, str] = {}
        self.hbc_source = ""  # forecast entity HBC pointed to before we took the pointer (pass-through source)
        # HBC settings advice and auto-adjust (rc6)
        self._hstore: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}.history")
        self.hist: dict[str, list] = {}  # str(quarter start ts) -> [bare HBC price ct, house use W, solar W]
        self.adv_days: dict[str, list] = {}  # local day -> [sum, n] of the daily 'solar reserved for house' advice
        self.hbc_advice: dict[str, Any] = {}  # result of the last daily calculation
        self.hbc_auto = False  # switch: set the three HBC settings to the advice
        self.hbc_user: dict[str, float] = {}  # your own HBC values, remembered while auto-adjust is on
        self.avg_solar = profile.StepAverage(900)
        self._own_ctx: deque[str] = deque(maxlen=50)  # context ids of our own HBC setting writes
        self._hist_days = 0
        self._advice_busy = False
        self._unsub: list[Any] = []
        self._recalc_pending = False
        self._recalc_unsub: Any = None
        self._live_unsub: Any = None  # debounce timer of the live charge level
        self._live_last: float | None = None
        self.load_settings()
        self.data = self._build_data()

    # ---- settings -------------------------------------------------------------------------
    def load_settings(self) -> None:
        self.settings = {**DEFAULTS, **dict(self.config_entry.data), **dict(self.config_entry.options)}

    async def async_set_setting(self, key: str, value: Any) -> None:
        """Change one setting; it is stored in the config entry options (survives updates)."""
        opts = {**self.settings, key: value}
        self.settings[key] = value
        self.hass.config_entries.async_update_entry(self.config_entry, options=opts)

    def setting_text(self, key: str) -> str:
        return str(self.settings.get(key) or "").strip()

    source_keys = (CONF_SENSOR_NET, CONF_SENSOR_SOLAR, CONF_SENSOR_BATTERY, CONF_SENSOR_EV)

    def apply_takeover(self, imp: dict[str, Any] | None) -> None:
        """First start after 'take over from the package': learned profile, counter, remembered HBC modes. Live stays off."""
        if not imp:
            return
        self.profile = profile.Profile.from_dict(imp.get("profile"))
        c = imp.get("counter") or {}
        for k in ("total", "live", "schaduw"):
            self.cnt[k] = float(c.get(k) or 0)
        self.cnt["sinds"] = str(c.get("sinds") or "")
        self.cnt["base"] = self.cnt["total"]
        self.live = False  # Live is never taken over: the package may still steer HBC; switch on by hand
        self.remembered = {k: v for k, v in (imp.get("remembered") or {}).items() if k in steering.HBC_SELECTS and v}
        self._save_now()

    # ---- start / stop ---------------------------------------------------------------------
    async def async_start(self) -> None:
        data = await self._store.async_load()
        if data:  # stored data wins; on a first start the takeover values (if any) stay
            self.profile = profile.Profile.from_dict(data.get("profile"))
            self.cnt.update({k: v for k, v in (data.get("counter") or {}).items() if k in self.cnt})
            self.remembered = dict(data.get("remembered") or {})
            self.hbc_source = str(data.get("hbc_source") or "")
            self.hbc_auto = bool(data.get("hbc_auto"))
            self.hbc_user = {k: float(v) for k, v in (data.get("hbc_user") or {}).items() if k in HBC_SETTINGS}
            self.hbc_advice = dict(data.get("hbc_advice") or {})
            self.adv_days = {k: list(v) for k, v in (data.get("adv_days") or {}).items()}
        hdata = await self._hstore.async_load()
        if hdata:
            self.hist = {str(k): list(v) for k, v in (hdata.get("q") or {}).items()}
        self._refresh_hist_days()
        if not self.cnt["sinds"]:
            self.cnt["sinds"] = dt_util.now().strftime("%d-%m-%Y")
        hass = self.hass
        srcs = [self.setting_text(k) for k in (CONF_SENSOR_NET, CONF_SENSOR_SOLAR, CONF_SENSOR_BATTERY, CONF_SENSOR_EV)]
        srcs = [s for s in srcs if s]
        if srcs:
            self._unsub.append(async_track_state_change_event(hass, srcs, self._source_changed))
        self._unsub.append(async_track_state_change_event(hass, [HBC_PRICES], self._prices_changed))
        self._unsub.append(async_track_state_change_event(hass, [HBC_RESERVED, HBC_MAX_ENERGY], self._source_changed))
        self._unsub.append(async_track_state_change_event(hass, [HBC_FORECAST_POINTER], self._pointer_changed))
        self._unsub.append(async_track_state_change_event(
            hass, [HBC_STRATEGY, *steering.HBC_SELECTS.values()], self._hbc_changed))
        self._unsub.append(async_track_state_change_event(
            hass, [eid for eid, _t, _u in HBC_SETTINGS.values()], self._hbc_setting_changed))
        self._unsub.append(async_track_state_change_event(
            hass, [f"sensor.marstek_m{i}_battery_state_of_charge" for i in range(1, 5)]
            + [f"input_number.marstek_m{i}_discharging_cutoff_capacity" for i in range(1, 5)], self._soc_changed))
        self._unsub.append(async_track_time_change(hass, self._tick_plan, minute=[14, 29, 44, 59], second=30))
        self._unsub.append(async_track_time_change(hass, self._tick_learn, minute=[0, 15, 30, 45], second=0))
        self._unsub.append(async_track_time_change(hass, self._tick_advice, hour=3, minute=10, second=0))
        self._record_prices()
        self._unsub.append(async_at_started(hass, self._started))
        self._remember_pointer()
        self._sample()

    async def _started(self, _hass: HomeAssistant) -> None:
        self._sample()
        await self.async_recalculate()
        self._unsub.append(async_call_later(self.hass, 180, self._catch_up))  # once a day, also after a restart

    async def _catch_up(self, _now: datetime) -> None:
        if self.hbc_advice.get("berekend", "")[:10] != dt_util.now().date().isoformat():
            await self.async_calc_advice()

    @callback
    def async_stop(self) -> None:
        for u in self._unsub:
            u()
        self._unsub = []
        if self._live_unsub is not None:
            self._live_unsub()
            self._live_unsub = None
        if self._recalc_unsub is not None:
            self._recalc_unsub()
            self._recalc_unsub = None
        self._save_now()

    def _save_now(self) -> None:
        self._store.async_delay_save(self._data_to_save, 1)

    def _data_to_save(self) -> dict[str, Any]:
        return {"profile": self.profile.to_dict(), "counter": self.cnt, "remembered": self.remembered, "hbc_source": self.hbc_source,
                "hbc_auto": self.hbc_auto, "hbc_user": self.hbc_user, "hbc_advice": self.hbc_advice, "adv_days": self.adv_days}

    def _save_hist(self) -> None:
        self._hstore.async_delay_save(lambda: {"q": self.hist}, 30)

    # ---- sources: house consumption -------------------------------------------------------
    def _float(self, entity_id: str, default: float = 0.0) -> float:
        if not entity_id:
            return default
        st = self.hass.states.get(entity_id)
        if st is None or st.state in BAD:
            return default
        try:
            return float(st.state)
        except ValueError:
            return default

    def _has_value(self, entity_id: str) -> bool:
        st = self.hass.states.get(entity_id) if entity_id else None
        return st is not None and st.state not in BAD

    def _consumption(self) -> float | None:
        """Grid (+ = import) + solar + battery (+ = discharge) - EV charger, never below 0."""
        net, bat = self.setting_text(CONF_SENSOR_NET), self.setting_text(CONF_SENSOR_BATTERY)
        if not (self._has_value(net) and self._has_value(bat)):
            return None
        w = (self._float(net) + self._float(self.setting_text(CONF_SENSOR_SOLAR))
             + self._float(bat) - self._float(self.setting_text(CONF_SENSOR_EV)))
        return float(round(max(w, 0)))

    def _sample(self) -> None:
        self.consumption_w = self._consumption()
        if self.consumption_w is not None:
            self.avg.add(time.time(), self.consumption_w)
        sol = self.setting_text(CONF_SENSOR_SOLAR)
        if sol and self._has_value(sol):
            self.avg_solar.add(time.time(), self._float(sol))
        self.async_set_updated_data(self._build_data())

    @callback
    def _source_changed(self, _event: Event) -> None:
        self._sample()

    # ---- timers ---------------------------------------------------------------------------
    async def _tick_plan(self, _now: datetime) -> None:
        await self.async_recalculate()

    async def _tick_learn(self, _now: datetime) -> None:
        """Learn the consumption of the quarter that just ended (time minus 2 minutes, as the package did)."""
        v = self.avg.average(time.time())
        when = dt_util.now() - timedelta(minutes=2)
        self.profile = profile.update(self.profile, when, v if v is not None else -1)
        self._record_quarter(v)
        self._save_now()
        self.async_set_updated_data(self._build_data())

    @callback
    def _prices_changed(self, _event: Event) -> None:
        self._record_prices()
        self.request_recalculate()

    def _charge_live(self) -> float | None:
        """Charge level now in kWh, same formula as the plan (plan.stored_energy) but from the live SOC sensors."""
        nbat = int(self._float(HBC_COUNT, 0))
        val = plan.stored_energy(
            [self._float(f"sensor.marstek_m{i}_battery_state_of_charge", -1) for i in range(1, nbat + 1)],
            [self._float(f"input_number.marstek_m{i}_discharging_cutoff_capacity", 10) for i in range(1, nbat + 1)],
            nbat, float(self.settings[CONF_CAPACITY]))
        return round(val, 1) if val >= 0 else None  # 0.1 kWh: the sensor only writes when it changes by that much

    @callback
    def _soc_changed(self, _event: Event) -> None:
        """A battery SOC changed: refresh the charge level only (no plan run); at most one update per 5 seconds."""
        if self._live_unsub is not None:
            return

        @callback
        def _go(_now: datetime) -> None:
            self._live_unsub = None
            val = self._charge_live()
            if val is not None and val != self._live_last:
                self.async_set_updated_data(self._build_data())

        self._live_unsub = async_call_later(self.hass, 5, _go)

    @callback
    def request_recalculate(self) -> None:
        """Recalculate soon; many triggers in a row give one run."""
        if self._recalc_pending:
            return
        self._recalc_pending = True

        async def _go(_now: datetime) -> None:
            self._recalc_pending = False
            self._recalc_unsub = None
            await self.async_recalculate()

        self._recalc_unsub = async_call_later(self.hass, 5, _go)

    # ---- plan -----------------------------------------------------------------------------
    def _solcast_ids(self) -> list[str]:
        """Sensors with the detailed forecast: with a filled-in field only the chosen today/tomorrow sensors,
        otherwise every Solcast sensor of the platform (as before), else the known ids."""
        chosen = self.solar_ids()
        if self.setting_text(CONF_SOLAR_TODAY) or self.setting_text(CONF_SOLAR_TOMORROW):
            return [e for e in (chosen["vandaag"], chosen["morgen"]) if e]
        reg = er.async_get(self.hass)
        ids = [e.entity_id for e in reg.entities.values() if e.platform == "solcast_solar" and e.domain == "sensor"]
        return ids or [e for e in (chosen["vandaag"], chosen["morgen"]) if e] or SOLCAST_FALLBACK

    def _solcast(self) -> tuple[dict[int, float], dict[int, float]]:
        ids = self._solcast_ids()
        pv10: dict[int, float] = {}
        pv: dict[int, float] = {}
        for eid in ids or SOLCAST_FALLBACK:
            st = self.hass.states.get(eid)
            for f in (st.attributes.get("detailedForecast") or []) if st else []:
                try:
                    start = f["period_start"]
                    ts = int((start if isinstance(start, datetime) else dt_util.parse_datetime(str(start))).timestamp())
                    pv10[ts] = float(f.get("pv_estimate10") or 0)
                    pv[ts] = float(f.get("pv_estimate") or 0)
                except (KeyError, TypeError, ValueError, AttributeError):
                    continue
        return pv10, pv

    def _advice(self) -> dict[str, Any]:
        """Advice for HBC 'Solar reserved for house': expected house use covered by solar from the first
        cheap quarter (HBC mark low) of today and tomorrow; port of the package template (05-11-2026)."""
        hbc = self.hass.states.get(HBC_PRICES)
        marks = list((hbc.attributes.get("marks") if hbc else None) or [])
        d0 = dt_util.now().date()
        d1 = d0 + timedelta(days=1)
        first: dict[date, float | None] = {d0: None, d1: None}
        for m in marks:
            if m.get("mark") != "low":
                continue
            try:
                st = plan._mark_start_ms(m.get("start")) / 1000
            except (TypeError, ValueError, AttributeError):
                continue
            dg = dt_util.as_local(dt_util.utc_from_timestamp(st)).date()
            if dg in first and (first[dg] is None or st < first[dg]):
                first[dg] = st
        _pv10, pv = self._solcast()
        prof = self.profile.uur
        fb = self.consumption_w if self.consumption_w is not None else 400.0
        tot = {d0: 0.0, d1: 0.0}
        for ts, kw in pv.items():
            t = dt_util.as_local(dt_util.utc_from_timestamp(ts))
            dg = t.date()
            if dg not in first or first[dg] is None or ts < first[dg]:
                continue
            w = prof[t.hour] if (len(prof) == 24 and isinstance(prof[t.hour], (int, float))) else fb
            tot[dg] += min(w / 1000 * 0.5, kw * 0.5)

        def hm(v: float | None) -> str | None:
            return dt_util.as_local(dt_util.utc_from_timestamp(v)).strftime("%H:%M") if v is not None else None

        ing = self._float("input_number.house_battery_solar_reserved_for_house", -1)
        return {
            "vandaag": round(tot[d0], 1) if first[d0] is not None else None,
            "morgen": round(tot[d1], 1) if first[d1] is not None else None,
            "vanaf_vandaag": hm(first[d0]),
            "vanaf_morgen": hm(first[d1]),
            "ingesteld": ing if ing >= 0 else None,
            "voorlopig": self.profile.state != "prima",
        }

    # ---- Solcast sensors and the forecast source for HBC ----------------------------------
    def solar_ids(self) -> dict[str, str | None]:
        """Chosen Solcast sensors: filled-in fields first, then Solcast by platform, then known ids EN -> NL -> DE."""
        reg = er.async_get(self.hass)
        plat = solcast.platform_ids(
            (e.entity_id, e.translation_key, e.unique_id) for e in reg.entities.values()
            if e.platform == "solcast_solar" and e.domain == "sensor")
        custom = {"vandaag": self.setting_text(CONF_SOLAR_TODAY), "morgen": self.setting_text(CONF_SOLAR_TOMORROW)}
        return solcast.resolve(custom, plat, lambda e: self.hass.states.get(e) is not None)

    @callback
    def _remember_pointer(self) -> None:
        """Remember the entity HBC points to for its solar forecast, as long as it is not our own sensor."""
        st = self.hass.states.get(HBC_FORECAST_POINTER)
        v = st.state.strip() if st is not None else ""
        if v and v not in BAD and not v.startswith(OWN_SOLAR_SENSOR) and v != self.hbc_source:
            self.hbc_source = v
            self._save_now()

    @callback
    def _pointer_changed(self, _event: Event) -> None:
        self._remember_pointer()
        self._sample()

    def _source_value(self) -> tuple[str | None, float | None]:
        """(entity id, number) of the real forecast HBC used before: remembered pointer, else Solcast 'remaining today'."""
        eid = self.hbc_source or self.solar_ids().get("rest")
        st = self.hass.states.get(eid) if eid else None
        try:
            return eid, float(st.state) if st is not None and st.state not in BAD else None
        except ValueError:
            return eid, None

    def _hbc_solar(self) -> dict[str, Any]:
        """Value for HBC's 'solar forecast' pointer. Steers HBC's charge goal 'solar forecast' to the plan's
        charge target; in every other case it passes the real source through 1:1 (see steering.solar_for_hbc)."""
        r = self.plan_result
        hbc_max = self._float(HBC_MAX_ENERGY, 0)
        source = "hbc"
        if hbc_max <= 1:  # HBC has not filled its usable maximum (yet): use the capacity setting
            hbc_max, source = float(self.settings[CONF_CAPACITY]), "instelling"
        reserved = self._float(HBC_RESERVED, -1)
        src_id, src_val = self._source_value()
        res = steering.solar_for_hbc(
            live=self.live, dynamic=self.hbc_dynamic, rule_charge=self.rules["laden"], points=r.get("punten"),
            stored_now=r.get("lading"), reserved=reserved, hbc_max=hbc_max, source_value=src_val)
        out: dict[str, Any] = {"value": None if res["value"] is None else round(res["value"], 2),
                               "modus": res["modus"], "reden": res["reden"], "bron": src_id}
        tgt = res.get("tgt")
        if tgt:
            def hm(v: float | None) -> str | None:
                return dt_util.as_local(dt_util.utc_from_timestamp(v)).strftime("%H:%M") if v is not None else None

            out.update({"doel": round(tgt["doel"], 2), "reserve": reserved, "hbc_max": round(hbc_max, 2), "bron_max": source,
                        "blok_van": hm(tgt["start"]), "blok_tot": hm(tgt["einde"])})
        return out

    def _plan_input(self) -> plan.PlanInput:
        s = self.settings
        hbc = self.hass.states.get(HBC_PRICES)
        attrs = hbc.attributes if hbc else {}
        nbat = int(self._float(HBC_COUNT, 0))
        pv10, pv = self._solcast()
        fallback = self.avg.average(time.time())
        return plan.PlanInput(
            now_ts=time.time(),
            capacity=float(s[CONF_CAPACITY]),
            margin=float(s[CONF_MARGIN]),
            storage_fee=float(s[CONF_STORAGE_FEE]),
            vat=float(s[CONF_VAT]) / 100,
            feed_in_fee=float(s[CONF_FEED_IN_FEE]),
            feed_in_bonus=float(s[CONF_FEED_IN_BONUS]),
            bonus_from=int(s[CONF_BONUS_FROM]),
            bonus_to=int(s[CONF_BONUS_TO]),
            all_in=s[CONF_PRICES] == PRICES_ALL_IN,
            delta=self._float(HBC_DELTA, 6.0),
            prev_l_run=self._prev_l_run(),
            battery_count=nbat,
            soc=[self._float(f"sensor.marstek_m{i}_battery_state_of_charge", -1) for i in range(1, nbat + 1)],
            cutoff=[self._float(f"input_number.marstek_m{i}_discharging_cutoff_capacity", 10) for i in range(1, nbat + 1)],
            charge_w=[self._float(f"number.marstek_m{i}_max_charge_power") for i in range(1, nbat + 1)],
            discharge_w=[self._float(f"number.marstek_m{i}_max_discharge_power") for i in range(1, nbat + 1)],
            marks=list(attrs.get("marks") or []),
            datapoints_per_hour=float(attrs.get("datapoints_per_hour") or 4),
            profile=list(self.profile.uur),
            fallback_w=fallback if fallback is not None else (self.consumption_w if self.consumption_w is not None else 400.0),
            pv10=pv10,
            pv=pv,
            time_zone=self.hass.config.time_zone,
            rule_charge=self.rules["laden"],
            rule_discharge=self.rules["ontladen"],
            rule_hold=self.rules["vasthouden"],
            rule_feed_in=self.rules["terugleveren"],
        )

    @property
    def hbc_dynamic(self) -> bool:
        st = self.hass.states.get(HBC_STRATEGY)
        return st is not None and st.state == "Dynamic"

    async def async_recalculate(self) -> None:
        """Run the rules, settle the counter, steer HBC for the coming quarter."""
        try:
            inp = self._plan_input()
            result = await self.hass.async_add_executor_job(plan.compute, inp)
        except Exception:  # noqa: BLE001 - a failing run must not stop the timers
            _LOGGER.exception("Batterijplan calculation failed")
            return
        self.plan_result = result if (result.get("ok") and self.settings[CONF_CAPACITY] > 0) else {}
        self._update_counter()
        self.async_set_updated_data(self._build_data())
        await self.async_steer()

    # ---- counter --------------------------------------------------------------------------
    def _update_counter(self) -> None:
        c, r = self.cnt, self.plan_result
        pend = c.get("pending")
        if pend and (not r or pend["start"] != r.get("start")):
            self._settle(pend)
            c["pending"] = None
            pend = None
        if r and r.get("punten") and not pend:
            pt = r["punten"][0]
            # HBC alone keeps its own battery level from quarter to quarter (reset each day), so holding now
            # and charging later is not counted as a loss in the first quarter only (05-11-2026)
            dag = dt_util.as_local(dt_util.utc_from_timestamp(r["start"])).date().isoformat()
            if r.get("q0") is not None and r.get("e0") is not None:
                if c.get("cf_dag") != dag or c.get("s_cf") is None:
                    c["s_cf"], c["cf_dag"] = float(r["e0"]), dag
                k_cf, s_cf2 = plan.hbc_alone_step(r["q0"], float(c["s_cf"]), float(r["top"]), float(r["laadq"]))
                d_plan = (float(r["s_plan0"]) - float(r["marge"])) - float(r["e0"])
                value = (k_cf - r["k_plan0"]) + (d_plan - (s_cf2 - float(c["s_cf"]))) * r["pmin_b"]
            else:
                s_cf2 = None
                value = counter.quarter_value(r["k_hbc0"], r["k_plan0"], r["s_hbc0"], r["s_plan0"], r["pmin_b"])
            c["pending"] = {
                "start": r["start"],
                "value": value,
                "s_cf_next": s_cf2,
                "live": bool(self.live and self.hbc_dynamic),
                "action": pt[5],
            }
        elif r and pend and r.get("punten"):
            pend["live"] = bool(pend["live"] and self.live and self.hbc_dynamic)
        self._save_now()

    def _settle(self, pend: dict[str, Any]) -> None:
        c = self.cnt
        if pend.get("s_cf_next") is not None:
            c["s_cf"] = float(pend["s_cf_next"])
        v = float(pend["value"])
        if pend["live"]:
            c["live"] = round(c["live"] + v, 4)
            c["total"] = round(c["total"] + v, 4)
            c["n_hold"] += 1 if pend["action"] == "H" else 0
            c["n_feed"] += 1 if pend["action"] == "V" else 0
            c["n_discharge"] += 1 if pend["action"] == "O" else 0
            c["schaduw_nieuw"] = True  # the next shadow stretch starts from zero
        else:
            # shadow is only kept for the current shadow stretch and at most 30 days
            now = time.time()
            if c.get("schaduw_nieuw") or not c.get("schaduw_t") or now - float(c.get("schaduw_t") or 0) > 30 * 86400:
                c["schaduw"] = 0.0
                c["schaduw_t"] = now
                c["schaduw_nieuw"] = False
            c["schaduw"] = round(c["schaduw"] + v, 4)

    def _period(self) -> tuple[date, float]:
        raw = self.setting_text(CONF_CONTRACT_START)
        cs = dt_util.parse_date(raw) if raw else None
        start = counter.contract_year_start(dt_util.now().date(), cs)
        iso = start.isoformat()
        if self.cnt.get("base_start") != iso:
            self.cnt["base_start"] = iso
            self.cnt["base"] = self.cnt["total"]
        # counter started inside this contract year: everything it counted belongs to the period
        # (after a takeover the base was the taken-over total, so the period missed that part; 05-11-2026)
        try:
            sinds = datetime.strptime(str(self.cnt.get("sinds") or ""), "%d-%m-%Y").date()
        except ValueError:
            sinds = None
        if sinds is not None and sinds >= start:
            self.cnt["base"] = 0.0
        return start, round(self.cnt["total"] - self.cnt["base"], 2)

    # ---- steering HBC ---------------------------------------------------------------------
    def _prev_l_run(self) -> int:
        """Quarters in a row, just before the coming one, in which the plan charged from the grid."""
        hist = getattr(self, "_l_hist", {})
        t = int((time.time() + 90) // 900 * 900) - 900
        n = 0
        while hist.get(t) == "L":
            n += 1
            t -= 900
        return n

    async def async_steer(self) -> None:
        """Set the HBC mode of the coming quarter's class to the plan's action (Live on, HBC on Dynamic)."""
        if not (self.live and self.hbc_dynamic):
            return
        first = (self.plan_result.get("punten") or [None])[0]
        if first:  # remember what the plan did per quarter (minimum charge block)
            hist = getattr(self, "_l_hist", None)
            if hist is None:
                hist = self._l_hist = {}
            hist[int(first[0])] = first[5]
            for k in [k for k in hist if k < first[0] - 7200]:
                del hist[k]
        step = steering.steer(first)
        if step is None:
            return
        cls, select, mode = step
        st = self.hass.states.get(select)
        if st is None or st.state == mode:
            return
        await self.hass.services.async_call("input_select", "select_option", {"entity_id": select, "option": mode}, blocking=True)
        pt = self.plan_result["punten"][0]
        when = dt_util.as_local(dt_util.utc_from_timestamp(pt[0])).strftime("%H:%M")
        await self.hass.services.async_call("logbook", "log", {
            "name": "Batterijplan",
            "message": f"Quarter {when} ({cls} according to HBC): {steering.ACTION_TEXT.get(pt[5], pt[5])} (HBC mode {mode})",
        })

    def _selects_now(self) -> dict[str, str]:
        out = {}
        for cls, eid in steering.HBC_SELECTS.items():
            st = self.hass.states.get(eid)
            if st is not None and st.state not in BAD:
                out[cls] = st.state
        return out

    def remember_modes(self) -> None:
        """Remember your own HBC modes (restored when Live goes off or HBC leaves Dynamic)."""
        self.remembered = self._selects_now()
        self._save_now()

    async def async_restore_modes(self) -> None:
        for cls, eid in steering.HBC_SELECTS.items():
            want = self.remembered.get(cls) or steering.HBC_DEFAULT_MODES[cls]
            st = self.hass.states.get(eid)
            if st is not None and st.state != want:
                await self.hass.services.async_call("input_select", "select_option", {"entity_id": eid, "option": want}, blocking=True)

    @callback
    def _hbc_changed(self, event: Event) -> None:
        eid = event.data["entity_id"]
        old, new = event.data.get("old_state"), event.data.get("new_state")
        if eid == HBC_STRATEGY:
            self._sample()  # the HBC solar forecast switches between steering and pass-through with the strategy
            if old is not None and old.state == "Dynamic" and (new is None or new.state != "Dynamic") and self.live:
                self.hass.async_create_task(self.async_restore_modes())
            elif new is not None and new.state == "Dynamic":
                self.request_recalculate()
        elif not self.live:  # you changed a mode yourself while Live is off: remember it
            self.remember_modes()

    async def async_set_live(self, on: bool) -> None:
        was, self.live = self.live, on
        if on and not was:
            self.remember_modes()
        elif was and not on:
            await self.async_restore_modes()
        await self.async_recalculate()

    async def async_set_rule(self, rule: str, on: bool) -> None:
        self.rules[rule] = on
        await self.async_recalculate()

    # ---- history and advice for the HBC settings (rc6) --------------------------------------
    def _tz(self) -> ZoneInfo:
        return ZoneInfo(self.hass.config.time_zone)

    def _refresh_hist_days(self) -> None:
        self._hist_days = len(advisor.complete_days(self.hist, dt_util.now().date(), self._tz()))

    @callback
    def _record_prices(self) -> None:
        """Keep the bare HBC price of every quarter HBC lists (past prices never change)."""
        st = self.hass.states.get(HBC_PRICES)
        a = st.attributes if st else {}
        prices, marks = a.get("prices"), a.get("marks")
        if not isinstance(prices, list) or not isinstance(marks, list) or len(prices) != len(marks):
            return
        if abs(float(a.get("datapoints_per_hour") or 4) - 4) > 1e-6:
            return  # the history is per quarter
        changed = False
        for p, m in zip(prices, marks):
            try:
                ts = int(plan._mark_start_ms(m["start"]) // 1000)
                pv = float(p)
            except (KeyError, TypeError, ValueError, AttributeError):
                continue
            if ts % 900:
                continue
            row = self.hist.get(str(ts))
            if row is None:
                self.hist[str(ts)] = [pv, None, None]
                changed = True
            elif row[0] != pv:
                row[0] = pv
                changed = True
        if changed:
            self._save_hist()

    def _record_quarter(self, house_w: float | None) -> None:
        """At a quarter boundary: store the measured house use and solar of the quarter that just ended."""
        q = int(time.time() + 30) // 900 * 900 - 900
        row = self.hist.setdefault(str(q), [None, None, None])
        if house_w is not None:
            row[1] = round(house_w)
        if self.setting_text(CONF_SENSOR_SOLAR):
            s = self.avg_solar.average(time.time())
            if s is not None:
                row[2] = round(max(s, 0))
        today = dt_util.now().date()
        a = (self.data or {}).get("advice", {}).get("vandaag") if self.data else None
        if a is not None:
            rec = self.adv_days.setdefault(today.isoformat(), [0.0, 0])
            rec[0] += float(a)
            rec[1] += 1
            for k in [k for k in self.adv_days if date.fromisoformat(k) < today - timedelta(days=advisor.KEEP_DAYS)]:
                del self.adv_days[k]
        advisor.prune(self.hist, today, self._tz())
        self._refresh_hist_days()
        self._save_hist()

    def _helper(self, eid: str) -> tuple[float | None, tuple[float, float, float]]:
        """(value, (min, max, step)) of an HBC input_number; value None when unknown."""
        st = self.hass.states.get(eid)
        if st is None or st.state in BAD:
            return None, (0.0, 0.0, 1.0)
        try:
            val = float(st.state)
        except ValueError:
            return None, (0.0, 0.0, 1.0)
        at = st.attributes
        return val, (float(at.get("min", 0)), float(at.get("max", 0)), float(at.get("step", 1) or 1))

    async def _tick_advice(self, _now: datetime) -> None:
        await self.async_calc_advice()

    async def async_calc_advice(self) -> None:
        """Once a day (night): replay the last 7 days for the cheapest / expensive hours and store the advice."""
        if self._advice_busy:
            return
        self._advice_busy = True
        try:
            today = dt_util.now().date()
            c_now, c_spec = self._helper(HBC_SETTINGS["cheapest"][0])
            e_now, e_spec = self._helper(HBC_SETTINGS["expensive"][0])
            res: dict[str, Any]
            if not self.setting_text(CONF_SENSOR_SOLAR):
                res = {"status": "geen_zon", "dagen": self._hist_days}
            elif c_now is None or e_now is None or self._float(HBC_DELTA, -1) < 0:
                res = {"status": "niet_beschikbaar", "dagen": self._hist_days}
            else:
                base = self._plan_input()
                snapshot = {k: list(v) for k, v in self.hist.items()}
                res = await self.hass.async_add_executor_job(partial(
                    advisor.advise, base, snapshot, today, self.hass.config.time_zone,
                    self.hass.states.get(HBC_DELTA).state, c_now, e_now, c_spec, e_spec, 0.02))
            res["berekend"] = dt_util.now().isoformat(timespec="seconds")
            self.hbc_advice = res
            self._save_now()
            _LOGGER.info("Batterijplan HBC settings advice: %s", {k: v for k, v in res.items() if k != "berekend"})
        except Exception:  # noqa: BLE001 - a failing run must not stop the timers
            _LOGGER.exception("Batterijplan HBC settings advice failed")
            return
        finally:
            self._advice_busy = False
        self.async_set_updated_data(self._build_data())
        await self.async_apply_hbc()

    async def _set_helper(self, key: str, new: float, why: str) -> None:
        eid, _thr, _unit = HBC_SETTINGS[key]
        old, _spec = self._helper(eid)
        ctx = Context()
        self._own_ctx.append(ctx.id)
        await self.hass.services.async_call("input_number", "set_value", {"entity_id": eid, "value": new}, blocking=True, context=ctx)
        await self.hass.services.async_call("logbook", "log", {
            "name": "Batterijplan",
            "message": f"HBC setting {HBC_LABEL[key]}: {_fmt(old)} -> {_fmt(new)} ({why})",
            "entity_id": eid,
        })

    def _hbc_now(self) -> tuple[dict[str, float | None], dict[str, tuple[float, float, float]]]:
        cur, specs = {}, {}
        for key, (eid, _thr, _unit) in HBC_SETTINGS.items():
            cur[key], specs[key] = self._helper(eid)
        return cur, specs

    async def async_apply_hbc(self) -> None:
        """Auto-adjust on: set a HBC setting to the advice when it differs enough (>= 1 h, >= 0.5 kWh)."""
        if not self.hbc_auto or self.hbc_advice.get("status") != "berekend":
            return
        advice = {"cheapest": self.hbc_advice.get("cheapest"), "expensive": self.hbc_advice.get("expensive"),
                  "solar": advisor.solar_advice(self.adv_days, dt_util.now().date())}
        cur, specs = self._hbc_now()
        for key, new in advisor.changes(advice, cur, specs, {k: v[1] for k, v in HBC_SETTINGS.items()}).items():
            await self._set_helper(key, new, "advice, auto-adjust on")

    def remember_hbc(self) -> None:
        """Remember your own values of the three HBC settings (restored when auto-adjust goes off)."""
        cur, _specs = self._hbc_now()
        self.hbc_user = {k: v for k, v in cur.items() if v is not None}

    @callback
    def _hbc_setting_changed(self, event: Event) -> None:
        """Auto-adjust on and you change a setting by hand: that is your new own value (not overwritten right away)."""
        eid, new = event.data["entity_id"], event.data.get("new_state")
        key = next((k for k, v in HBC_SETTINGS.items() if v[0] == eid), None)
        if key is None or new is None or event.data.get("old_state") is None:
            return
        val = advisor.user_edit(self.hbc_auto, event.context.id in self._own_ctx, new.state, self.hbc_user, key)
        if val is None:
            return
        old = self.hbc_user.get(key)
        self.hbc_user[key] = val
        self._save_now()
        self.async_set_updated_data(self._build_data())
        self.hass.async_create_task(self.hass.services.async_call("logbook", "log", {
            "name": "Batterijplan",
            "message": f"HBC setting {HBC_LABEL[key]} changed by you to {_fmt(val)}: kept as your own value "
                       f"(was {_fmt(old)}), restored when auto-adjust goes off; next advice may adjust it again",
            "entity_id": eid,
        }))

    async def async_restore_hbc(self) -> None:
        cur, _specs = self._hbc_now()
        for key, val in advisor.restore(self.hbc_user, cur).items():
            await self._set_helper(key, val, "your own value, auto-adjust off")
        self.hbc_user = {}

    async def async_set_hbc_auto(self, on: bool) -> None:
        was, self.hbc_auto = self.hbc_auto, on
        if on and not was:
            self.remember_hbc()
        elif was and not on:
            await self.async_restore_hbc()
        self._save_now()
        self.async_set_updated_data(self._build_data())
        if on and not was:
            if self.hbc_advice.get("status") == "berekend":
                await self.async_apply_hbc()
            elif self._hist_days >= advisor.DAYS:
                await self.async_calc_advice()

    def _hbc_advice_view(self) -> dict[str, Any]:
        """State and attributes of sensor.batterijplan_advies_hbc: current value, advice and 'differs' per setting."""
        adv = self.hbc_advice
        ready = adv.get("status") == "berekend"
        solar = advisor.solar_advice(self.adv_days, dt_util.now().date())
        out: dict[str, Any] = {
            "status": adv.get("status") or "meten", "dagen": self._hist_days,
            "dag": min(self._hist_days + 1, advisor.DAYS), "van": advisor.DAYS,
            "automatisch": self.hbc_auto, "berekend": adv.get("berekend"), "duur_s": adv.get("duur_s"),
            "kosten_nu": adv.get("kosten_nu"), "kosten_advies": adv.get("kosten_advies"), "besparing": adv.get("besparing"),
            "dagen_van": adv.get("dagen_van"), "dagen_tot": adv.get("dagen_tot"),
            "planner_runs": adv.get("planner_runs"), "eigen_waarden": dict(self.hbc_user),
        }
        for key, (eid, thr, _unit) in HBC_SETTINGS.items():
            cur, _spec = self._helper(eid)
            want = solar if key == "solar" else (adv.get(key) if ready else None)
            out[f"{key}_nu"] = cur
            out[f"{key}_advies"] = want
            out[f"{key}_verschil"] = bool(want is not None and cur is not None and abs(want - cur) >= thr - 1e-9)
        return out

    # ---- data for the entities ------------------------------------------------------------
    def _build_data(self) -> dict[str, Any]:
        r = self.plan_result
        pts = r.get("punten") or []
        p = self.profile
        pct = profile.reliability(p)
        start, period = self._period()
        st = self.hass.states.get(HBC_STRATEGY)
        sol = self.solar_ids()
        live_charge = self._charge_live()
        self._live_last = live_charge
        return {
            "plan": r,
            "plan_attrs": {
                "kosten_hbc": r.get("kosten_hbc"), "kosten_plan": r.get("kosten_plan"), "start": r.get("start"),
                "lading": r.get("lading"), "punten": pts, "komend_kwartier": r.get("start"),
                "actie": pts[0][5] if pts else None, "hbc_actie": pts[0][3] if pts else None,
                "modus": "live" if (self.live and self.hbc_dynamic) else "schaduw",
                "hbc_strategie": st.state if st else None, "versie": VERSION,
                "zon_vandaag": sol["vandaag"], "zon_morgen": sol["morgen"], "zon_rest_vandaag": sol["rest"],
                "uitleg": "punten = [time, price ct, kind (1 HBC expensive, 2 extra expensive, -1 cheap, 0 normal), "
                          "action HBC, charge HBC, action plan, charge plan, solar kW, cautious solar kW]; "
                          "actions L charge from grid, O discharge, H hold, Z solar only, V feed in",
            },
            "saving": r.get("opbrengst") if r else None,
            "charge": live_charge if live_charge is not None else (r.get("lading") if r else None),
            "price": self._price_now(),
            "consumption": self.consumption_w,
            "consumption_15m": round(a, 1) if (a := self.avg.average(time.time())) is not None else None,
            "profile": p,
            "profile_state": p.state,
            "reliability": pct,
            "verdict": profile.verdict(pct),
            "colour": profile.colour(p.dagen, pct),
            "advice": self._advice(),
            "hbc_advice": self._hbc_advice_view(),
            "hbc_solar": self._hbc_solar(),
            "counter": dict(self.cnt),
            "period": period,
            "period_start": start.isoformat(),
        }

    def _price_now(self) -> float | None:
        st = self.hass.states.get(HBC_PRICES)
        if st is None:
            return None
        now = time.time()
        dph = float(st.attributes.get("datapoints_per_hour") or 4)
        dur = 3600 / max(dph, 0.01)
        for m in st.attributes.get("marks") or []:
            try:
                t = plan._mark_start_ms(m["start"]) / 1000
                if t <= now < t + dur:
                    return float(m["price"])
            except (KeyError, TypeError, ValueError):
                continue
        return None
