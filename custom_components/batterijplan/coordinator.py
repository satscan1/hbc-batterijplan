"""Coordinator: reads Home Assistant, runs plan.py, steers HBC, learns consumption, counts value."""
from __future__ import annotations

import logging
import time
from collections import deque
from functools import partial
from datetime import date, datetime, timedelta, tzinfo
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Context, Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import (
    async_call_later, async_track_state_change_event, async_track_time_change, async_track_time_interval,
)
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from . import consumption as profile
from . import advisor, counter, daluren, donker, hbcmarks, peak, plan, reserve, solcast, steering, vastsim, verkoopreserve, weekprofiel, zonleer, zonmarge
from .const import (
    CONF_BONUS_FROM, CONF_BONUS_TO, CONF_CAPACITY, CONF_CONTRACT_START, CONF_FEED_IN_BONUS, CONF_FEED_IN_FEE, CONF_FEED_IN_FIXED,
    COUNTRY_BE, HBC_LIMIT_IMPORT_ON, HBC_LIMIT_IMPORT_W, CONF_FLANDERS, ha_country, migrate_options,
    CONF_CAP_TARIFF, CONF_CONTRACT_TYPE, CONF_NIGHT_FROM, CONF_NIGHT_TO, CONF_OWN_LIMIT, CONF_WEEKEND, CONF_PRICE_DAY, CONF_PRICE_FIXED, CONF_PRICE_NIGHT,
    CONF_TARIFF, CONF_FEED_IN_PRICE, TARIFF_DUAL, internal_contract, CONTRACT_DAYNIGHT, CONTRACT_DYNAMIC, CONTRACT_FIXED, HBC_STRATEGY_CHARGE, HBC_STRATEGY_SELF,
    CONF_MARGIN, CONF_PRICES, CONF_SENSOR_BATTERY, CONF_SENSOR_EV, CONF_SENSOR_NET, CONF_SENSOR_SOLAR,
    CONF_STORAGE_FEE, CONF_VAT, DEFAULTS, DOMAIN, HBC_COUNT, HBC_DELTA, HBC_FORECAST_POINTER, HBC_MAX_ENERGY, HBC_PRICES, HBC_RESERVED, HBC_SETTINGS, HBC_STRATEGY,
    CONF_SOLAR_TODAY, CONF_SOLAR_TOMORROW, OWN_SOLAR_SENSOR, PRICES_ALL_IN,
    RULES_DEFAULT_OFF, STORAGE_VERSION, SWITCH_RULES, VERSION, HBC_SELL_GOAL, HBC_SELL_RESERVE, HBC_SELL_THEN,
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
        self.rules = {k: k not in RULES_DEFAULT_OFF for k in SWITCH_RULES}
        self.profile = profile.Profile()
        self.avg = profile.StepAverage(900)
        self.consumption_w: float | None = None
        self.plan_result: dict[str, Any] = {}
        self.price_now: float | None = None
        # counter
        self.cnt: dict[str, Any] = {"total": 0.0, "live": 0.0, "schaduw": 0.0, "sinds": "", "base": 0.0,
                                    "base_start": "", "n_hold": 0, "n_feed": 0, "n_discharge": 0, "pending": None,
                                    "schaduw_t": 0.0, "schaduw_nieuw": False, "alleen_live": False,
                                    "s_cf": None, "cf_dag": "",
                                    # 2.0.0-dev1: part of live / schaduw / total that comes from a Fixed / Day-night contract
                                    # (battery value at the contract price), kept apart from the v1 plan-versus-HBC value
                                    "contract_live": 0.0, "contract_schaduw": 0.0,
                                    # today's battery flows under a Fixed contract (kWh): to the house, charged with solar / from the grid, fed in
                                    "contract_dag": {}}
        self.remembered: dict[str, str] = {}
        self.hbc_source = ""  # forecast entity HBC pointed to before we took the pointer (pass-through source)
        # HBC settings advice and auto-adjust (rc6)
        self._hstore: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}.history")
        self._cstore: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}.capacity")
        self.cap_days: dict[str, dict[str, Any]] = {}  # calendar day -> capacity record (see capacity.py)
        self.cap_advice: dict[str, Any] = {"status": "te_weinig_dagen", "dagen": 0}
        self._cap_busy = False
        self.hist: dict[str, list] = {}  # str(quarter start ts) -> [bare HBC price ct, house use W, solar W]
        self.adv_days: dict[str, list] = {}  # local day -> [sum, n] of the daily 'solar reserved for house' advice
        self.hbc_advice: dict[str, Any] = {}  # result of the last daily calculation
        self.hbc_auto = False  # switch: set the three HBC settings to the advice
        self.cap_on = True  # switch (expert): capacity experiment; off = no new days are measured, stored days are kept
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
        # Flemish capacity tariff (2.0.0-dev1): own store, never the recorder
        self._pstore: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}.peaks")
        self.peaks = peak.PeakBook()
        # channels: net = grid (+ import), nb = grid + battery (= grid without the battery), dis / chg = battery discharge / charge, imp = import only
        self._qs = peak.QuarterSet(("net", "nb", "dis", "chg", "imp", "exp"))
        self._night_on = False  # we put HBC on Charge for the night
        self._strat_q: int | None = None  # plan quarter of the last Dynamic <-> Charge change (2.0.0)
        self.donker: dict[str, Any] = {}  # dark days after the price horizon (2.0.0, donker.py)
        self.zon_boek: dict[str, list] = {}  # 2.0.0: per day [solar forecast kWh (morning), measured kWh] (zonleer.py), own store
        self.reserve: dict[str, Any] = {}  # 2.0.0: learned reserve (reserve.py)
        self.week: dict[str, Any] = weekprofiel.empty()  # 2.0.0: consumption per weekday x hour + self-test, own store
        self.lading_hist: list[list[float]] = []  # [quarter ts, kWh in the battery], last 24 h: the chart under a Fixed contract
        self._vast_cache: tuple[Any, dict[str, Any]] | None = None
        self.limit_orig: dict[str, Any] | None = None  # HBC import limit as it was before we took it over (None = not ours)
        self.strat_orig: str | None = None  # HBC strategy as it was before Fixed / Day-night took it over
        self.sell_orig: float | None = None  # 2.0.0: HBC 'Keep energy in reserve' as it was before we took it over (None = not ours)
        self._sell_q: int | None = None  # plan quarter of the last sell-reserve write (at most one per quarter)
        self._sell_written: float | None = None  # last value we wrote (HBC's own Min/max node may only lower it: not your edit)
        self.sell_view: dict[str, Any] = {}  # 2.0.0: what the sell-reserve rule does now (attribute 'verkoopreserve')
        self._lim_last_write: float | None = None
        self._q_pushed = 0.0
        self.load_settings()
        self._applied = (self.contract, self.flanders, self.own_limit_w())  # what strategy / HBC limit were last applied for
        self.data = self._build_data()

    # ---- settings -------------------------------------------------------------------------
    def load_settings(self) -> None:
        self.settings = {**DEFAULTS, **dict(self.config_entry.data), **dict(self.config_entry.options)}

    async def async_set_setting(self, key: str, value: Any) -> None:
        """Change one setting; it is stored in the config entry options (survives updates)."""
        opts = {**self.settings, key: value}
        self.settings[key] = value
        self.hass.config_entries.async_update_entry(self.config_entry, options=opts)

    @property
    def contract(self) -> str:
        """Kind of contract: vast / dag_nacht / dynamisch (independent of the country)."""
        return internal_contract(self.settings.get(CONF_CONTRACT_TYPE), self.settings.get(CONF_TARIFF))

    @property
    def contract_kind(self) -> str:
        """What the user chose in step 1: Fixed or Dynamic."""
        return CONTRACT_DYNAMIC if self.contract == CONTRACT_DYNAMIC else CONTRACT_FIXED

    @property
    def tariff(self) -> str:
        return TARIFF_DUAL if self.contract == CONTRACT_DAYNIGHT else "enkel"

    def migration_options(self) -> dict[str, Any] | None:
        """New options for an entry of v1 / the first dev builds (contract, country, trial mode), or None. See const.migrate_options."""
        return migrate_options(dict(self.config_entry.data), dict(self.config_entry.options))

    def feed_in_price(self) -> float:
        """EUR/kWh for feed-in under a Fixed contract. HBC has no feed-in price helper, so this is our own field."""
        return float(self.settings.get(CONF_FEED_IN_PRICE) or 0)

    @property
    def real_country(self) -> str:
        """Country from Home Assistant (nl / be / de, anything else nl): night hours, public holidays and wording follow this."""
        return ha_country(self.hass.config.country)

    @property
    def country(self) -> str:
        """Country the plan rules use: 'be' (Flemish limit logic) only with the Flanders switch on, otherwise the Home Assistant
        country; a Belgian Home Assistant without the switch plans like the Netherlands."""
        if self.flanders:
            return COUNTRY_BE
        return "nl" if self.real_country == COUNTRY_BE else self.real_country

    @property
    def flanders(self) -> bool:
        """Flemish capacity tariff on: quarter calculation, monthly peak, HBC import limit, own limit, kW display. Own switch,
        independent of the Home Assistant country."""
        return bool(self.settings.get(CONF_FLANDERS))

    def night_hours(self) -> tuple[int, int]:
        """Night window (from, to) of a Day/night contract: set by the user, else the country default (NL 23-07, BE 22-07)."""
        d = daluren.default_night(self.real_country)
        f, t = self.settings.get(CONF_NIGHT_FROM), self.settings.get(CONF_NIGHT_TO)
        return int(d[0] if f is None else f), int(d[1] if t is None else t)

    @property
    def weekend_dal(self) -> bool:
        """Weekend and public holidays off-peak all day: set by the user, else the country default (NL on)."""
        v = self.settings.get(CONF_WEEKEND)
        return daluren.default_weekend(self.real_country) if v is None else bool(v)

    def _is_dal(self, ts: float) -> bool:
        """Off-peak at this time under the Day/night contract (night hours, weekend and public holidays)."""
        f, t = self.night_hours()
        return daluren.is_dal(datetime.fromtimestamp(ts, self._tz()), self.real_country, f, t, self.weekend_dal)

    def own_limit_w(self) -> float:
        return max(float(self.settings.get(CONF_OWN_LIMIT) or 0), 0.0)

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
            if not self.cnt.get("alleen_live"):
                # 14-11-2026 (decision Adrie): the total only counts what was really steered (live). A total taken over
                # from the YAML package also held shadow quarters from before Live; that part is taken out once.
                if self.cnt["total"] - self.cnt["live"] > 0:
                    self.cnt["total"] = self.cnt["live"]
                    self.cnt["base"] = min(self.cnt["base"], self.cnt["total"])
                self.cnt["alleen_live"] = True
            self.remembered = dict(data.get("remembered") or {})
            self.hbc_source = str(data.get("hbc_source") or "")
            self.hbc_auto = bool(data.get("hbc_auto"))
            self.cap_on = bool(data.get("cap_on", True))
            self.hbc_user = {k: float(v) for k, v in (data.get("hbc_user") or {}).items() if k in HBC_SETTINGS}
            self.hbc_advice = dict(data.get("hbc_advice") or {})
            self.adv_days = {k: list(v) for k, v in (data.get("adv_days") or {}).items()}
            lo = data.get("limit_orig")  # additive keys of 2.0.0-dev1: absent in v1 data = not ours
            self.limit_orig = dict(lo) if isinstance(lo, dict) else None
            so = data.get("strat_orig")
            self.strat_orig = str(so) if so else None
            sr = data.get("sell_orig")  # additive key of 2.0.0: absent = not ours
            self.sell_orig = float(sr) if isinstance(sr, (int, float)) else None
            self.lading_hist = [[float(a), float(b)] for a, b in (data.get("lading_hist") or []) if isinstance(a, (int, float)) and isinstance(b, (int, float))]
            self.week = weekprofiel.load(data.get("weekprofiel"))
            self.zon_boek = {str(k): list(v) for k, v in (data.get("zon_boek") or {}).items() if isinstance(v, list) and len(v) == 2}
        hdata = await self._hstore.async_load()
        if hdata:
            self.hist = {str(k): list(v) for k, v in (hdata.get("q") or {}).items()}
        cdata = await self._cstore.async_load()
        if cdata:
            self.cap_days = {str(k): dict(v) for k, v in (cdata.get("days") or {}).items()}
        pdata = await self._pstore.async_load()
        self.peaks = peak.PeakBook.from_dict(pdata)
        self.peaks.roll(peak.month_key(time.time(), self._tz()))
        self._refresh_cap()
        self._refresh_hist_days()
        if not self.cnt["sinds"]:
            self.cnt["sinds"] = dt_util.now().strftime("%d-%m-%Y")
        hass = self.hass
        srcs = [self.setting_text(k) for k in (CONF_SENSOR_NET, CONF_SENSOR_SOLAR, CONF_SENSOR_BATTERY, CONF_SENSOR_EV)]
        srcs = [s for s in srcs if s]
        if srcs:
            self._unsub.append(async_track_state_change_event(hass, srcs, self._source_changed))
        net = self.setting_text(CONF_SENSOR_NET)
        if net:
            self._unsub.append(async_track_state_change_event(hass, [net], self._net_changed))
        self._unsub.append(async_track_time_interval(hass, self._tick_quarter, timedelta(seconds=10)))
        self._unsub.append(async_track_time_interval(hass, self._tick_night, timedelta(minutes=1)))
        self._unsub.append(async_track_time_change(hass, self._tick_quarter_edge, minute=[0, 15, 30, 45], second=1))
        self._unsub.append(async_track_state_change_event(hass, [HBC_PRICES], self._prices_changed))
        self._unsub.append(async_track_state_change_event(hass, [HBC_RESERVED, HBC_MAX_ENERGY], self._source_changed))
        self._unsub.append(async_track_state_change_event(hass, [HBC_FORECAST_POINTER], self._pointer_changed))
        self._unsub.append(async_track_state_change_event(
            hass, [HBC_STRATEGY, *steering.HBC_SELECTS.values()], self._hbc_changed))
        self._unsub.append(async_track_state_change_event(
            hass, [eid for eid, _t, _u in HBC_SETTINGS.values()], self._hbc_setting_changed))
        self._unsub.append(async_track_state_change_event(hass, [HBC_SELL_RESERVE], self._sell_changed))
        self._unsub.append(async_track_state_change_event(hass, [HBC_SELL_GOAL, HBC_SELL_THEN], self._sell_goal_changed))
        self._unsub.append(async_track_state_change_event(
            hass, [f"sensor.marstek_m{i}_battery_state_of_charge" for i in range(1, 5)]
            + [f"input_number.marstek_m{i}_discharging_cutoff_capacity" for i in range(1, 5)], self._soc_changed))
        self._unsub.append(async_track_time_change(hass, self._tick_plan, minute=[14, 29, 44, 59], second=30))
        self._unsub.append(async_track_time_change(hass, self._tick_learn, minute=[0, 15, 30, 45], second=0))
        self._unsub.append(async_track_time_change(hass, self._tick_advice, hour=3, minute=10, second=0))
        self._unsub.append(async_track_time_change(hass, self._tick_capacity, hour=0, minute=15, second=0))
        self._unsub.append(async_call_later(hass, 90, callback(lambda _n: hass.async_create_task(self.async_calc_capacity()))))
        self._unsub.append(async_track_time_change(hass, self._tick_capacity, minute=[10, 40], second=0))
        self._record_prices()
        self._unsub.append(async_at_started(hass, self._started))
        self._unsub.append(async_call_later(hass, 60, callback(lambda _n: hass.async_create_task(self._backfill_lading()))))
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
                "hbc_auto": self.hbc_auto, "cap_on": self.cap_on, "hbc_user": self.hbc_user, "hbc_advice": self.hbc_advice, "adv_days": self.adv_days,
                "limit_orig": self.limit_orig, "strat_orig": self.strat_orig, "sell_orig": self.sell_orig, "lading_hist": self.lading_hist,
                "zon_boek": self.zon_boek, "weekprofiel": self.week}

    def _save_peaks(self) -> None:
        self._pstore.async_delay_save(self.peaks.to_dict, 30)

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
        normal = self.profile.uur[when.hour] if len(self.profile.uur) == 24 else None  # forecast BEFORE learning (self-test)
        weekprofiel.learn(self.week, when.weekday(), when.hour, v, normal)
        self.profile = profile.update(self.profile, when, v if v is not None else -1)
        self._record_quarter(v)
        self._learn_solar()
        lv = self._charge_live()
        if lv is not None:  # the battery level of this quarter: drawn in the chart under a Fixed contract
            self.lading_hist.append([float(int(time.time() // 900 * 900)), float(lv)])
            self.lading_hist = self.lading_hist[-96:]
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
        reg = er.async_get(self.hass)
        if self.setting_text(CONF_SOLAR_TODAY) or self.setting_text(CONF_SOLAR_TOMORROW):
            # 2.0.0: also Solcast day 3 .. 7, else the dark days (after the prices) never have a forecast
            later = solcast.later_days((e.entity_id, e.translation_key, e.unique_id) for e in reg.entities.values()
                                       if e.platform == "solcast_solar" and e.domain == "sensor")
            mine = [e for e in (chosen["vandaag"], chosen["morgen"]) if e]
            return mine + [e for e in later if e not in mine]
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
        # 2.0.0: laaddoel_kwh / zon_voor_huis (and the old doel / reserve) in every mode, None when not steering or unknown (for HBC+)
        out.update(steering.solar_names(tgt["doel"] if tgt else None, reserved))
        if tgt:
            def hm(v: float | None) -> str | None:
                return dt_util.as_local(dt_util.utc_from_timestamp(v)).strftime("%H:%M") if v is not None else None

            out.update({"hbc_max": round(hbc_max, 2), "bron_max": source,
                        "blok_van": hm(tgt["start"]), "blok_tot": hm(tgt["einde"])})
        return out

    def _limit_w(self) -> float | None:
        """BE: import limit in W for the plan. While Live steers the limit it is the target limit (never the moving
        quarter value we write to HBC); otherwise HBC's own limit when peak shaving (import) is on. None elsewhere."""
        if not self.flanders:
            return None
        if self.live:
            return self._target()
        st = self.hass.states.get(HBC_LIMIT_IMPORT_ON)
        if st is None or st.state != "on":
            return None
        w = self._float(HBC_LIMIT_IMPORT_W, -1)
        return w if w > 0 else None

    def _plan_input(self) -> plan.PlanInput:
        s = self.settings
        hbc = self.hass.states.get(HBC_PRICES)
        attrs = hbc.attributes if hbc else {}
        nbat = int(self._float(HBC_COUNT, 0))
        pv10, pv = self._solcast()
        fallback = self.avg.average(time.time())
        marks = list(attrs.get("marks") or [])
        dph = float(attrs.get("datapoints_per_hour") or 4)
        cap = float(s[CONF_CAPACITY])
        use_pct = profile.reliability(self.profile)
        # without a solar power sensor the solar forecast can never be checked: then only the use forecast counts
        sun_pct = zonleer.reliability(self.zon_boek)["pct"] if self.setting_text(CONF_SENSOR_SOLAR) else use_pct
        self.reserve = reserve.learned(cap, float(s[CONF_MARGIN]), use_pct, sun_pct)
        margin = float(self.reserve["kwh"])
        self.donker = self._dark_days(marks, dph, pv, pv10, max(cap - margin, 0.0))
        return plan.PlanInput(
            end_floor=float(self.donker.get("vloer") or 0.0),
            now_ts=time.time(),
            capacity=float(s[CONF_CAPACITY]),
            margin=margin,  # 2.0.0: learned reserve, your own margin is the minimum (reserve.py)
            storage_fee=float(s[CONF_STORAGE_FEE]),
            vat=float(s[CONF_VAT]) / 100,
            feed_in_fee=float(s[CONF_FEED_IN_FEE]),
            feed_in_bonus=float(s[CONF_FEED_IN_BONUS]),
            bonus_from=int(s[CONF_BONUS_FROM]),
            bonus_to=int(s[CONF_BONUS_TO]),
            country=self.country,
            feed_in_fixed=float(s[CONF_FEED_IN_FIXED]),
            limit_w=self._limit_w(),
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
            charge_any=self.rules["elk_kwartier"],
            sell_reserve=self._sell_rule_applies(),  # 2.0.0: the plan sells down to the sell reserve, as HBC will
            sell_then=verkoopreserve.then_action(self._state(HBC_SELL_THEN)),
            profile_week=self._week_table(),
            solar_margin=True,
        )

    def _learn_solar(self) -> None:
        """Solar forecast reliability (zonleer.py): write today's P50 forecast once before 07:00, and the measured solar of
        the complete past days from the quarter history (at least 90 % of the quarters measured)."""
        if not self.setting_text(CONF_SENSOR_SOLAR):
            return
        tz = self._tz()
        now = dt_util.now()
        today = now.date()
        changed = False
        if now.hour < 7:
            _pv10, pv = self._solcast()
            start = int(datetime(today.year, today.month, today.day, tzinfo=tz).timestamp())
            day = [v for ts, v in pv.items() if start <= ts < start + 86400 and datetime.fromtimestamp(ts, tz).date() == today]
            if day:
                changed |= zonleer.note_forecast(self.zon_boek, today.isoformat(), round(sum(day) * 0.5, 2))
        for k in [k for k, r in self.zon_boek.items() if r[1] is None and k < today.isoformat()]:
            qs = advisor.day_quarters(date.fromisoformat(k), tz)
            vals = [self.hist[str(t)][2] for t in qs if str(t) in self.hist and self.hist[str(t)][2] is not None]
            if qs and len(vals) >= advisor.COVER * len(qs):
                changed |= zonleer.note_measured(self.zon_boek, k, sum(vals) / len(vals) * len(qs) * 0.25 / 1000)
        n0 = len(self.zon_boek)
        zonleer.prune(self.zon_boek, today.isoformat())
        if changed or len(self.zon_boek) != n0:
            self._save_now()

    def _week_table(self) -> list[list[float | None]] | None:
        """7 x 24 profile per weekday, only when its self-test shows it forecasts better than the normal profile."""
        return weekprofiel.table(self.week, list(self.profile.uur)) if weekprofiel.verdict(self.week)["actief"] else None

    def _day_use_kwh(self, day: date) -> float:
        """Expected house use in kWh on ``day`` (learned profile per hour, per weekday when that one won its self-test;
        fallback the 15-min average or 400 W)."""
        wt = self._week_table()
        prof = wt[day.weekday()] if wt is not None else self.profile.uur
        fb = self.consumption_w if self.consumption_w is not None else 400.0
        return sum(float(v) if isinstance(v, (int, float)) else float(fb) for v in (prof if len(prof) == 24 else [fb] * 24)) / 1000

    def _dark_days(self, marks: list, dph: float, pv: dict[int, float], pv10: dict[int, float], usable: float) -> dict[str, Any]:
        """Dark days right after the price horizon (donker.py): floor for the charge at the end of the plan."""
        try:
            starts = [plan._mark_start_ms(m["start"]) / 1000 for m in marks]
        except (KeyError, TypeError, ValueError):
            starts = []
        if not starts:
            return {"vloer": 0.0, "dagen": 0, "tekort": 0.0, "reden": "geen prijzen"}
        tz = self._tz()
        end = max(starts) + 3600 / max(dph, 0.01)
        e = datetime.fromtimestamp(end, tz)
        first = e.date() if (e.hour, e.minute) == (0, 0) else e.date() + timedelta(days=1)  # first whole day without prices
        tot = zonmarge.day_totals(pv, pv10, time.time(), lambda ts: datetime.fromtimestamp(ts, tz).date())
        days = []
        for i in range(donker.MAX_DAYS):
            d = first + timedelta(days=i)
            days.append((d.isoformat(), tot.get(d), round(self._day_use_kwh(d), 2)))
        out = donker.floor(days, usable)
        out["vanaf"] = first.isoformat()
        out["dagen_info"] = [[k, v, u] for k, v, u in days]
        return out

    @property
    def hbc_dynamic(self) -> bool:
        """HBC on Dynamic, or on the Charge Batterijplan itself set for a grid-charge block outside HBC's cheap hours (2.0.0):
        HBC then still follows Batterijplan (steering, charge target, counter)."""
        st = self.hass.states.get(HBC_STRATEGY)
        if st is None:
            return False
        return st.state == "Dynamic" or self._ours_charge(st.state)

    def _ours_charge(self, state: str | None) -> bool:
        return (self.contract == CONTRACT_DYNAMIC and state == HBC_STRATEGY_CHARGE
                and self.strat_orig == steering.HBC_DYNAMIC)

    async def async_recalculate(self) -> None:
        """Run the rules, settle the counter, steer HBC for the coming quarter."""
        if self.contract != CONTRACT_DYNAMIC:  # Fixed / Day-night: no plan on price, HBC stays on Self-consumption
            self.plan_result = {}
            self._update_counter()
            self.async_set_updated_data(self._build_data())
            return
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
        """Set the HBC mode of the coming quarter's class to the plan's action (Live on, HBC on Dynamic).
        2.0.0: first the main strategy: Charge for a grid-charge block outside HBC's cheap hours, else back to Dynamic;
        then the sell reserve, so HBC has it before a Sell quarter starts."""
        if self.live and self.contract == CONTRACT_DYNAMIC:
            await self.async_apply_contract()
        await self._sell_step()
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
            self.hass.async_create_task(self._sell_step())  # 2.0.0: HBC leaves Dynamic: your own sell reserve back at once
            if (old is not None and old.state == "Dynamic" and (new is None or new.state != "Dynamic") and self.live
                    and not self._ours_charge(new.state if new else None)):  # our own Charge block: keep the modes
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
        await self.async_apply_contract()
        await self._limit_step(time.time())  # Live on: take over the HBC limit (BE); Live off: give it back
        await self._sell_step()  # Live off: your own sell reserve back (also under a Fixed contract, where no plan runs)
        await self.async_recalculate()

    # ---- contract kind: Fixed / Day-night keep HBC on Self-consumption (2.0.0-dev1) ----------
    def _night_charge_ok(self, now_ts: float) -> bool:
        """Fixed + dual rate: may HBC charge from the grid in this quarter? Only in the off-peak hours AND when it pays (rate difference
        at least HBC's threshold) or, in Flanders, when there is room under the target limit (see _night_charge)."""
        return self._night_charge(now_ts)[0]

    def _night_charge(self, now_ts: float) -> tuple[bool, str, float]:
        """(allowed, reason, price difference in ct) for charging from the grid in the quarter of ``now_ts``, see vastsim.night_charge_decision.
        The threshold is HBC's own 'Dynamic threshold delta' (the same helper Batterijplan uses for a Dynamic contract). In Flanders the
        charge may fill the reserve for peaks: then only the room under the target limit counts (expected house use from the profile)."""
        s = self.settings
        headroom = True
        if self.flanders:
            hour = datetime.fromtimestamp(now_ts, self._tz()).hour
            prof = self.profile.uur
            use = float(prof[hour]) if (len(prof) == 24 and isinstance(prof[hour], (int, float))) else (self.consumption_w or 400.0)
            headroom = self._target() - use >= peak.MIN_ALLOWED_W
        return vastsim.night_charge_decision(
            off_peak=self._is_dal(now_ts), flanders=self.flanders, normal=float(s.get(CONF_PRICE_DAY) or 0), dal=float(s.get(CONF_PRICE_NIGHT) or 0),
            threshold_ct=self._float(HBC_DELTA, 6.0), headroom_ok=headroom)

    def _desired_strategy(self, now_ts: float) -> str | None:
        """HBC strategy we want: None = not ours (Live off or Dynamic); Charge in the night of a Day/night contract; else Self-consumption."""
        if not self.live:
            return None
        if self.contract == CONTRACT_DYNAMIC:  # 2.0.0: Charge only for a grid-charge block outside HBC's cheap hours
            st = self.hass.states.get(HBC_STRATEGY)
            first = (self.plan_result.get("punten") or [None])[0]
            want, _why = steering.any_quarter_charge(
                live=self.live, contract_dynamic=True, rule_charge=self.rules["laden"], rule_any=self.rules["elk_kwartier"],
                strategy=st.state if st else None, strat_orig=self.strat_orig, first_point=first)
            q = int(first[0]) if first else None
            ours = self._ours_charge(st.state if st else None)
            want = steering.hold_switch(want=want, ours=ours, forced=not (self.rules["laden"] and self.rules["elk_kwartier"]),
                                        quarter=q, last_switch_quarter=self._strat_q)
            if want != ours:
                self._strat_q = q  # one Dynamic <-> Charge change per plan quarter
            return HBC_STRATEGY_CHARGE if want else None
        if self.contract == CONTRACT_DAYNIGHT and self._night_charge_ok(now_ts):
            return HBC_STRATEGY_CHARGE
        return HBC_STRATEGY_SELF

    async def _set_strategy(self, old: str, new: str, why: str) -> None:
        await self.hass.services.async_call(
            "input_select", "select_option", {"entity_id": HBC_STRATEGY, "option": new}, blocking=True)
        await self.hass.services.async_call("logbook", "log", {
            "name": "Batterijplan", "message": f"HBC strategy {old} -> {new} ({why})", "entity_id": HBC_STRATEGY})

    async def async_apply_contract(self, transition: bool = True) -> None:
        """Live on and a Fixed / Day-night contract: HBC on Self-consumption, in the night hours of a Day/night contract on
        Charge. Live off or back to Dynamic: your own strategy returns (remembered when we took over).
        ``transition`` (Live / contract change): we set it. The 1-minute tick only follows day <-> night and leaves it alone
        when you chose another strategy yourself."""
        st = self.hass.states.get(HBC_STRATEGY)
        if st is None or st.state in BAD:
            return
        want = self._desired_strategy(time.time())
        if want is not None:
            ours = st.state in (HBC_STRATEGY_SELF, HBC_STRATEGY_CHARGE)
            if st.state != want and (transition or (self.strat_orig is not None and ours)):
                if self.strat_orig is None:
                    self.strat_orig = st.state
                    self._save_now()
                await self._set_strategy(st.state, want, f"contract: {self.contract}")
            self._night_on = want == HBC_STRATEGY_CHARGE
        elif self.strat_orig is not None:
            orig, self.strat_orig, self._night_on = self.strat_orig, None, False
            self._save_now()
            # Dynamic contract: only our own Charge goes back to Dynamic; a strategy you chose yourself in between stays
            back = (HBC_STRATEGY_CHARGE,) if (self.contract == CONTRACT_DYNAMIC and self.live) else (HBC_STRATEGY_SELF, HBC_STRATEGY_CHARGE)
            if st.state in back and st.state != orig:
                await self._set_strategy(st.state, orig, "your own value back")

    async def _tick_night(self, _now: datetime) -> None:
        """Every minute (Day/night + Live): switch between Self-consumption (day) and Charge (night)."""
        if self.live and self.contract == CONTRACT_DAYNIGHT:
            await self.async_apply_contract(transition=False)

    def settings_need_apply(self) -> bool:
        """True once when contract, country or own limit differ from what was last applied (async_set_setting writes the
        new value into ``settings`` before the update listener runs, so a before/after compare there never sees a change)."""
        now = (self.contract, self.flanders, self.own_limit_w())
        if now == self._applied:
            return False
        self._applied = now
        return True

    async def async_settings_applied(self) -> None:
        """Contract, Flanders switch or own limit changed: strategy and HBC limit follow."""
        await self.async_apply_contract()
        await self._limit_step(time.time())
        await self._sell_step()  # e.g. Fixed contract: the sell reserve goes back to your own value
        self.async_set_updated_data(self._build_data())

    # ---- Flemish capacity tariff: quarter average, monthly peak, HBC import limit (BE only) -
    def _power_w(self, entity_id: str) -> float | None:
        """Power in W of a sensor (kW is converted); None when it has no number."""
        st = self.hass.states.get(entity_id) if entity_id else None
        if st is None or st.state in BAD:
            return None
        try:
            w = float(st.state)
        except ValueError:
            return None
        return w * 1000 if str(st.attributes.get("unit_of_measurement") or "").lower() == "kw" else w

    def _net_w(self) -> float | None:
        """Net grid power in W (+ = import) from the P1 sensor Batterijplan already uses."""
        return self._power_w(self.setting_text(CONF_SENSOR_NET))

    def _target(self) -> float:
        self.peaks.roll(peak.month_key(time.time(), self._tz()))
        return peak.target_limit(self.peaks.peak_now(), self.own_limit_w())

    def _quarter_observe(self, ts: float) -> bool:
        """Feed the quarter accumulators. Finished quarters: peaks (BE) and the value of the battery at the contract
        price (Fixed / Day-night). True when a quarter ended."""
        net, bat = self._net_w(), self._power_w(self.setting_text(CONF_SENSOR_BATTERY))
        vals = {"net": net, "imp": None if net is None else max(net, 0.0),
                "nb": None if (net is None or bat is None) else net + bat,  # grid without the battery: + discharge, - charge
                "dis": None if bat is None else max(bat, 0.0), "chg": None if bat is None else max(-bat, 0.0),
                "exp": None if net is None else max(-net, 0.0)}
        done = self._qs.observe(ts, vals)
        for q in done:
            if self.flanders:
                avg, avg_nb = peak.channel_avg(q, "net"), peak.channel_avg(q, "nb")
                if avg is not None:
                    self.peaks.record(q["start"], max(avg, 0.0), self._tz(), None if avg_nb is None else max(avg_nb, 0.0))
                    self._save_peaks()
            if self.contract != CONTRACT_DYNAMIC:
                self._add_contract_value(q)
        return bool(done)

    def _contract_price(self, start_ts: float) -> float:
        """EUR/kWh of the Fixed or Day/night contract at the time of a quarter."""
        s = self.settings
        if self.contract == CONTRACT_FIXED:
            return float(s.get(CONF_PRICE_FIXED) or 0)
        return float(s.get(CONF_PRICE_NIGHT) or 0) if self._is_dal(start_ts) else float(s.get(CONF_PRICE_DAY) or 0)

    def _add_contract_value(self, q: dict[str, Any]) -> None:
        """Fixed / Day-night: add what the battery earned in this quarter to the counter ('live' when Live is on, else 'shadow')."""
        dis, chg, imp = peak.channel_kwh(q, "dis"), peak.channel_kwh(q, "chg"), peak.channel_kwh(q, "imp")
        if dis is None or chg is None or imp is None:
            return
        exp = peak.channel_kwh(q, "exp") or 0.0
        v = peak.energy_value(dis, chg, imp, self._contract_price(q["start"]), exp, self.feed_in_price())
        c = self.cnt
        day = datetime.fromtimestamp(q["start"], self._tz()).date().isoformat()  # self-consumption via the battery, per calendar day
        cd = c.get("contract_dag") or {}
        if cd.get("datum") != day:
            cd = {"datum": day, "huis": 0.0, "zon": 0.0, "net": 0.0, "terug": 0.0}
        to_grid = min(max(dis, 0.0), max(exp, 0.0))
        grid_ch = min(max(chg, 0.0), max(imp, 0.0))
        cd["huis"] = round(cd["huis"] + max(dis, 0.0) - to_grid, 4)
        cd["terug"] = round(cd["terug"] + to_grid, 4)
        cd["net"] = round(cd["net"] + grid_ch, 4)
        cd["zon"] = round(cd["zon"] + max(chg, 0.0) - grid_ch, 4)
        c["contract_dag"] = cd
        if self.live:
            c["live"] = round(c["live"] + v, 4)
            c["total"] = round(c["total"] + v, 4)
            c["contract_live"] = round(c["contract_live"] + v, 4)
        else:
            c["schaduw"] = round(c["schaduw"] + v, 4)
            c["contract_schaduw"] = round(c["contract_schaduw"] + v, 4)
        self._save_now()

    @callback
    def _net_changed(self, _event: Event) -> None:
        if self.flanders or self.contract != CONTRACT_DYNAMIC:
            self._quarter_observe(time.time())

    async def _tick_quarter(self, _now: datetime) -> None:
        """Every 10 s: keep the quarter figures (BE: peaks and the HBC limit; Fixed / Day-night: value of the battery),
        refresh the cards at most every 30 s."""
        t = time.time()
        if not self.flanders:
            if self.limit_orig is not None:
                await self._limit_step(t)  # no longer BE: give the HBC limit back
            if self.contract != CONTRACT_DYNAMIC:
                self._quarter_observe(t)
            return
        new_q = self._quarter_observe(t)
        await self._limit_step(t, force=new_q)
        if new_q or t - self._q_pushed >= 30:
            self._q_pushed = t
            self.async_set_updated_data(self._build_data())

    async def _tick_quarter_edge(self, _now: datetime) -> None:
        """Quarter change: back to the target limit right away."""
        t = time.time()
        if self.flanders or self.contract != CONTRACT_DYNAMIC:
            self._quarter_observe(t)
        if self.flanders:
            await self._limit_step(t, force=True)
            self._q_pushed = t
            self.async_set_updated_data(self._build_data())

    async def _limit_step(self, now_ts: float, force: bool = False) -> None:
        """Live on and country BE: write the allowed import power of the running quarter to the HBC limit.
        Otherwise: give the original HBC values back (when we had taken them over)."""
        if not (self.live and self.flanders):
            await self._limit_restore()
            return
        on_st = self.hass.states.get(HBC_LIMIT_IMPORT_ON)
        cur_w, (lo, hi, _step) = self._helper(HBC_LIMIT_IMPORT_W)
        if on_st is None or cur_w is None:
            return  # HBC helpers not there (yet): nothing to steer
        if self.limit_orig is None:  # first time: remember what HBC had; never again while we own it (also over a restart)
            self.limit_orig = {"on": on_st.state, "w": cur_w}
            self._save_now()
            await self.hass.services.async_call("logbook", "log", {
                "name": "Batterijplan", "message": f"HBC import limit taken over (was {on_st.state}, {_fmt(cur_w)} W): "
                                                   "Batterijplan sets it per quarter (capacity tariff)", "entity_id": HBC_LIMIT_IMPORT_W})
        lo = lo if lo > 0 else peak.MIN_ALLOWED_W
        hi = hi if hi > 0 else peak.MAX_ALLOWED_W
        target = self._target()
        cur = self._qs.current("net", now_ts)
        allowed = peak.allowed_w(target, peak.used_estimate(cur, target), cur["elapsed"], lo, hi)
        wanted = min(max(target, lo), hi) if force else allowed
        if on_st.state != "on":
            await self.hass.services.async_call("input_boolean", "turn_on", {"entity_id": HBC_LIMIT_IMPORT_ON}, blocking=True)
        if peak.should_write(cur_w, wanted, now_ts, self._lim_last_write, force):
            self._lim_last_write = now_ts
            await self.hass.services.async_call(
                "input_number", "set_value", {"entity_id": HBC_LIMIT_IMPORT_W, "value": int(round(wanted))}, blocking=True)

    async def _limit_restore(self) -> None:
        if self.limit_orig is None:
            return
        orig, self.limit_orig = self.limit_orig, None
        self._lim_last_write = None
        self._save_now()
        if orig.get("w") is not None and self.hass.states.get(HBC_LIMIT_IMPORT_W) is not None:
            await self.hass.services.async_call(
                "input_number", "set_value", {"entity_id": HBC_LIMIT_IMPORT_W, "value": orig["w"]}, blocking=True)
        st = self.hass.states.get(HBC_LIMIT_IMPORT_ON)
        if orig.get("on") in ("on", "off") and st is not None and st.state != orig["on"]:
            await self.hass.services.async_call(
                "input_boolean", "turn_on" if orig["on"] == "on" else "turn_off", {"entity_id": HBC_LIMIT_IMPORT_ON}, blocking=True)
        await self.hass.services.async_call("logbook", "log", {
            "name": "Batterijplan", "message": f"HBC import limit back to your own values ({orig.get('on')}, {_fmt(orig.get('w'))} W)",
            "entity_id": HBC_LIMIT_IMPORT_W})

    def _vast_sim(self, now: float, dual: bool, pv: dict[int, float]) -> tuple[list[list[Any]] | None, dict[str, Any] | None, float | None]:
        """Expected battery level for the next 30 h under a Fixed contract (see vastsim.py): outside the off-peak hours HBC is on
        Self-consumption (the battery covers the house use with the learned profile, charges with the solar surplus), in the off-peak
        hours of a dual rate on Charge up to the HBC charge target. Returns (rows [ts, kWh, action], timeline, level now)."""
        cap = float(self.settings[CONF_CAPACITY])
        level = self._charge_live()
        if level is None and self.lading_hist:
            level = self.lading_hist[-1][1]
        if level is None or cap <= 1:
            return None, None, level
        nbat = int(self._float(HBC_COUNT, 0))
        lw = sum(self._float(f"number.marstek_m{i}_max_charge_power") for i in range(1, nbat + 1))
        ow = sum(self._float(f"number.marstek_m{i}_max_discharge_power") for i in range(1, nbat + 1))
        cq = lw / 1000 * 0.25 if lw > 0 else cap / 8
        dq = ow / 1000 * 0.25 if ow > 0 else cq
        prof = self.profile.uur
        fallback = self.consumption_w if self.consumption_w is not None else 400.0
        tz = self._tz()

        wt = self._week_table()

        def house(ts: int) -> float:
            lt = datetime.fromtimestamp(ts, tz)
            h = lt.hour
            if wt is not None and isinstance(wt[lt.weekday()][h], (int, float)):
                return float(wt[lt.weekday()][h])
            return float(prof[h]) if (len(prof) == 24 and isinstance(prof[h], (int, float))) else float(fallback)

        target = self._float("input_number.house_battery_strategy_charge_target_energy", cap)
        rows = vastsim.simulate(
            start_ts=int(now // 900 * 900), n=120, level0=level, cap=cap, charge_q=cq, discharge_q=dq, house_w=house,
            pv_kw=lambda ts: pv.get(ts // 1800 * 1800, 0.0), grid_charge=(lambda ts: dual and self._night_charge_ok(ts)),
            target_kwh=target if target > 0 else cap, limit_w=self._target() if self.flanders else None)
        return [[r[0], r[1], r[2]] for r in rows], vastsim.summarize(rows, level, cap, hour_of=lambda ts: datetime.fromtimestamp(ts, tz).hour), round(level, 2)

    async def _backfill_lading(self) -> None:
        """After a start: fill the battery-level history of the last 24 h from the recorder (sensor.batterijplan_lading), per quarter,
        so the chart under a Fixed contract shows the past hours at once. Measured quarters already in the history are kept."""
        eid = "sensor.batterijplan_lading"
        try:
            from homeassistant.components.recorder import get_instance, history
            start = dt_util.utcnow() - timedelta(hours=24)

            def _q() -> Any:
                return history.get_significant_states(
                    self.hass, start, None, [eid], include_start_time_state=True, significant_changes_only=False,
                    minimal_response=False, no_attributes=True)

            res = await get_instance(self.hass).async_add_executor_job(_q)
        except Exception:  # noqa: BLE001 - the chart then starts empty and fills per quarter
            _LOGGER.debug("Batterijplan: no battery-level history from the recorder", exc_info=True)
            return
        pts: list[tuple[float, float]] = []
        for st in res.get(eid) or []:
            try:
                pts.append((st.last_updated.timestamp(), float(st.state)))
            except (ValueError, TypeError, AttributeError):
                continue
        if not pts:
            return
        pts.sort()
        have = {int(a): b for a, b in self.lading_hist}
        now_q = int(time.time() // 900 * 900)
        k = 0
        last: float | None = None
        for ts in range(int(start.timestamp() // 900 * 900), now_q + 1, 900):
            while k < len(pts) and pts[k][0] <= ts:
                last = pts[k][1]
                k += 1
            if last is not None and ts not in have:
                have[ts] = last
        self.lading_hist = [[float(t), float(v)] for t, v in sorted(have.items())][-96:]
        self._vast_cache = None
        self._save_now()
        self.async_set_updated_data(self._build_data())

    def _vast_view(self) -> dict[str, Any] | None:
        """Fixed contract (single or dual rate): what the main screen shows instead of the plan: price now, the rates, the next
        change between normal and off-peak, the strategy HBC should be on, the sun forecast and the battery level around now.
        None under a Dynamic contract. Recomputed at most once a minute."""
        if self.contract == CONTRACT_DYNAMIC:
            return None
        now = time.time()
        s = self.settings
        key = (int(now // 60), self.contract, s.get(CONF_PRICE_FIXED), s.get(CONF_PRICE_DAY), s.get(CONF_PRICE_NIGHT), s.get(CONF_FEED_IN_PRICE),
               self.night_hours(), self.weekend_dal, self.flanders, len(self.lading_hist), s.get(CONF_CAPACITY), self._float(HBC_DELTA, 6.0))
        if self._vast_cache is not None and self._vast_cache[0] == key:
            return self._vast_cache[1]
        dual = self.contract == CONTRACT_DAYNIGHT
        p_normal = float(s.get(CONF_PRICE_DAY if dual else CONF_PRICE_FIXED) or 0)
        p_off = float(s.get(CONF_PRICE_NIGHT) or 0) if dual else None
        dal_now = bool(dual and self._is_dal(now))
        nxt = None
        if dual:  # next change between normal and off-peak, looking 7 days ahead
            t = (int(now // 900) + 1) * 900
            for _ in range(7 * 96):
                if self._is_dal(t) != dal_now:
                    nxt = t
                    break
                t += 900
        _pv10, pv = self._solcast()
        first = int((now - 6 * 3600) // 900 * 900)
        rows = []
        for i in range(144):  # 6 h back, 30 h ahead, per quarter: [ts, solar kW, off-peak 0/1]
            ts = first + i * 900
            z = pv.get(ts // 1800 * 1800)
            rows.append([ts, round(z, 2) if z is not None else 0.0, 1 if (dual and self._is_dal(ts)) else 0])
        hist = [[int(a), round(b, 2)] for a, b in self.lading_hist if a >= first]
        sim, summary, level_now = self._vast_sim(now, dual, pv)
        laden = None
        if dual:  # does charging from the grid in the off-peak hours pay? (threshold = HBC's own, as for a Dynamic contract)
            _ok, reason, diff = vastsim.night_charge_decision(off_peak=True, flanders=self.flanders, normal=p_normal, dal=float(p_off or 0),
                                                              threshold_ct=self._float(HBC_DELTA, 6.0))
            laden = {"actief": reason in ("loont", "vlaanderen"), "reden": reason, "verschil_ct": diff, "drempel_ct": self._float(HBC_DELTA, 6.0)}
        out = {
            "tarief": "dubbel" if dual else "enkel", "prijs_normaal": p_normal, "prijs_dal": p_off,
            "prijs_nu": p_off if dal_now else p_normal, "dal_nu": dal_now, "volgende_wissel": nxt, "weekend": self.weekend_dal,
            "nacht_van": self.night_hours()[0], "nacht_tot": self.night_hours()[1], "terugleverprijs": self.feed_in_price(),
            "strategie": HBC_STRATEGY_CHARGE if (dual and self._night_charge_ok(now)) else HBC_STRATEGY_SELF,
            "vlaanderen": self.flanders, "kwartieren": rows, "lading": hist,
            "laden": laden, "sim": sim, "tijdlijn": summary, "niveau_nu": level_now, "capaciteit": float(self.settings[CONF_CAPACITY]),
        }
        self._vast_cache = (key, out)
        return out

    def _piek_view(self) -> dict[str, Any]:
        """Sensor 'monthly peak': highest quarter per day this month (with and without battery), last 12 months with the
        saving per month, and the Fluvius averages (last 12 monthly peaks) with and without the battery."""
        now = time.time()
        mk = peak.month_key(now, self._tz())
        tariff = float(self.settings.get(CONF_CAP_TARIFF) or 0)
        rows = self.peaks.table(mk, tariff)
        av = self.peaks.averages(mk)
        save_year = None
        if av["zonder"] is not None:
            save_year = round((av["zonder"] - av["met_zelfde"]) / 1000 * tariff, 2)  # same months with and without
        nb_now = self.peaks.peak_now_nb()
        return {
            "state": round(self.peaks.peak_now()) if self.flanders else None,
            "vlaanderen": self.flanders, "maand": mk, "doelgrens": round(self._target()),
            "eigen_grens": round(self.own_limit_w()), "minimum": int(peak.FLOOR_W),
            "piek_zonder": None if nb_now is None else round(nb_now),
            "dagen": [[d, round(w)] for d, w in sorted(self.peaks.days.items())],
            "dagen_zonder": [[d, round(w)] for d, w in sorted(self.peaks.days_nb.items())],
            "maanden": [{**r, "piek": round(r["piek"]), "zonder": None if r["zonder"] is None else round(r["zonder"])} for r in rows],
            "gemiddelde": None if av["met"] is None else round(av["met"]), "aantal_maanden": av["n"],
            "gemiddelde_zonder": None if av["zonder"] is None else round(av["zonder"]), "aantal_maanden_zonder": av["n_zonder"],
            "besparing_jaar": save_year, "tarief": tariff,
            "kosten_jaar": None if av["met"] is None else round(av["met"] / 1000 * tariff, 2),
        }

    def _kwartier_view(self) -> dict[str, Any]:
        """Sensor 'running quarter': average so far, what is still allowed, the limit set in HBC."""
        now = time.time()
        cur = self._qs.current("net", now)
        target = self._target()
        el = cur["elapsed"]
        lim_w = self._float(HBC_LIMIT_IMPORT_W, -1)
        on_st = self.hass.states.get(HBC_LIMIT_IMPORT_ON)
        return {
            "state": round(cur["avg_w"]) if (self.flanders and cur["covered"] >= 5) else None,
            "stuurt": bool(self.live and self.flanders), "start": cur["start"], "verstreken_s": round(el),
            "verbruikt_kwh": round(cur["used_kwh"], 3), "budget_kwh": round(target * 0.25 / 1000, 3), "doelgrens": round(target),
            "toegestaan_w": round(peak.allowed_w(target, peak.used_estimate(cur, target), el)),
            "hbc_grens_w": round(lim_w) if lim_w > 0 else None,
            "hbc_grens_aan": bool(on_st is not None and on_st.state == "on"),
        }

    async def async_set_rule(self, rule: str, on: bool) -> None:
        self.rules[rule] = on
        await self.async_recalculate()
        if rule == "verkoopreserve":
            await self._sell_step()  # also when no plan ran (Fixed contract): give the reserve back right away
            self.async_set_updated_data(self._build_data())

    # ---- sell reserve: HBC 'Keep energy in reserve' (2.0.0, GitHub issue #9) ----------------------------------------
    def _state(self, eid: str) -> str | None:
        st = self.hass.states.get(eid)
        return st.state if st is not None and st.state not in BAD else None

    def _sell_rule_applies(self) -> bool:
        """Rule on, Dynamic contract and HBC's 'Sell until' on 'energy reserve' (else the helper does nothing in HBC)."""
        return (bool(self.rules.get("verkoopreserve")) and self.contract == CONTRACT_DYNAMIC
                and self._state(HBC_SELL_GOAL) == verkoopreserve.SELL_GOAL_RESERVE)

    def _sell_reason(self) -> str:
        strat = self._state(HBC_STRATEGY)
        return verkoopreserve.inactive_reason(
            rule_on=bool(self.rules.get("verkoopreserve")), contract_dynamic=self.contract == CONTRACT_DYNAMIC,
            sell_goal=self._state(HBC_SELL_GOAL), live=self.live, strategy=strat, ours_charge=self._ours_charge(strat))

    def _sell_wanted(self) -> float | None:
        """Helper value from the plan: need until the next cheap quarter + the plan's reserve, on the helper's step and range."""
        need = self.plan_result.get("verkoopreserve")
        cur, (lo, hi, step) = self._helper(HBC_SELL_RESERVE)
        if need is None or cur is None:
            return None
        usable = self._float(HBC_MAX_ENERGY, 0)
        if usable <= 1:
            usable = float(self.settings[CONF_CAPACITY])
        return verkoopreserve.helper_value(float(need), float(self.plan_result.get("marge") or 0.0), step, lo, hi, usable)

    async def _sell_step(self) -> None:
        """Rule active (Live on, rule on, Dynamic, HBC on Dynamic, Sell until 'energy reserve'): write the sell reserve,
        at most once per plan quarter and only on a real difference. Otherwise: give your own value back (when it was ours)."""
        reason = self._sell_reason()
        before = dict(self.sell_view)
        try:
            await self._sell_apply(reason)
        finally:
            if self.sell_view != before:
                self.async_set_updated_data(self._build_data())

    async def _sell_apply(self, reason: str) -> None:
        cur, (_lo, _hi, step) = self._helper(HBC_SELL_RESERVE)
        wanted = self._sell_wanted() if not reason or reason in ("live uit", "HBC niet op Dynamic") else None
        self.sell_view = {"aan": bool(self.rules.get("verkoopreserve")), "actief": not reason, "reden": reason or None,
                          "kwh": wanted, "in_hbc": cur, "eigen": self.sell_orig,
                          "plan_kwh": self.plan_result.get("verkoopreserve")}
        if reason:
            await self._sell_restore()
            return
        if wanted is None or cur is None:
            return  # no plan or no HBC helper (yet): nothing to steer
        first = (self.plan_result.get("punten") or [None])[0]
        q = int(first[0]) if first else None
        if self.sell_orig is None:  # first time: remember your value; never again while we own it (also over a restart)
            self.sell_orig = cur
            self._save_now()
            self.sell_view["eigen"] = cur
            await self.hass.services.async_call("logbook", "log", {
                "name": "Batterijplan", "message": f"HBC 'Keep energy in reserve' taken over (was {_fmt(cur)} kWh): "
                                                   "Batterijplan sets it per quarter (sell reserve)", "entity_id": HBC_SELL_RESERVE})
        if not verkoopreserve.should_write(cur, wanted, step, q, self._sell_q):
            return
        self._sell_q = q
        ctx = Context()
        self._own_ctx.append(ctx.id)
        await self.hass.services.async_call("input_number", "set_value", {"entity_id": HBC_SELL_RESERVE, "value": wanted},
                                            blocking=True, context=ctx)
        self.sell_view["in_hbc"] = wanted
        self._sell_written = wanted
        await self.hass.services.async_call("logbook", "log", {
            "name": "Batterijplan", "message": f"HBC 'Keep energy in reserve': {_fmt(cur)} -> {_fmt(wanted)} kWh "
                                               "(house use until the next cheap quarter + reserve)", "entity_id": HBC_SELL_RESERVE})

    async def _sell_restore(self) -> None:
        if self.sell_orig is None:
            return
        orig, self.sell_orig = self.sell_orig, None
        self._sell_q = None
        self.sell_view["eigen"] = None
        self._save_now()
        if self.hass.states.get(HBC_SELL_RESERVE) is not None:
            ctx = Context()
            self._own_ctx.append(ctx.id)
            await self.hass.services.async_call("input_number", "set_value", {"entity_id": HBC_SELL_RESERVE, "value": orig},
                                                blocking=True, context=ctx)
            self.sell_view["in_hbc"] = orig
        await self.hass.services.async_call("logbook", "log", {
            "name": "Batterijplan", "message": f"HBC 'Keep energy in reserve' back to your own value ({_fmt(orig)} kWh)",
            "entity_id": HBC_SELL_RESERVE})

    @callback
    def _sell_goal_changed(self, _event: Event) -> None:
        """HBC 'Sell until' / 'Then use' changed: the rule may stop or start at once, and the plan models the new behaviour."""
        self.hass.async_create_task(self._sell_step())
        self.request_recalculate()

    @callback
    def _sell_changed(self, event: Event) -> None:
        """You change 'Keep energy in reserve' by hand while Batterijplan owns it: that is your new own value (restored later)."""
        new = event.data.get("new_state")
        if self.sell_orig is None or new is None or event.data.get("old_state") is None or event.context.id in self._own_ctx:
            return
        try:
            val = float(new.state)
            old = float(event.data["old_state"].state)
        except ValueError:
            return
        if self._sell_written is not None and abs(old - self._sell_written) < 1e-6 and val < old:
            return  # HBC's Sell flow clamps the helper to the usable energy: not your own value
        self.sell_orig = val
        self._save_now()

    # ---- history and advice for the HBC settings (rc6) --------------------------------------
    def _tz(self) -> tzinfo:
        return dt_util.get_default_time_zone()

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

    def _refresh_cap(self) -> None:
        from . import capacity
        if capacity.prune(self.cap_days, dt_util.now().date()):
            self._cstore.async_delay_save(lambda: {"days": self.cap_days}, 30)
        self.cap_advice = capacity.advise(self.cap_days)

    async def _tick_capacity(self, _now: Any) -> None:
        await self.async_calc_capacity()

    async def async_calc_capacity(self) -> None:
        """Once a day (just after midnight) and at start: add the complete calendar days that are not in the table yet."""
        if self._cap_busy or not self.cap_on:
            return
        self._cap_busy = True
        try:
            from . import capacity
            today = dt_util.now().date()
            tz = self._tz()
            todo = [d for d in advisor.complete_days(self.hist, today, tz) if d.isoformat() not in self.cap_days]
            c_now, _cs = self._helper(HBC_SETTINGS["cheapest"][0])
            e_now, _es = self._helper(HBC_SETTINGS["expensive"][0])
            delta = self._float(HBC_DELTA, -1)
            if todo and c_now is not None and e_now is not None and delta >= 0:
                base = self._plan_input()
                snapshot = {k: list(v) for k, v in self.hist.items()}
                recs = await self.hass.async_add_executor_job(partial(
                    capacity.build_records, base, snapshot, todo, tz, float(self.settings[CONF_CAPACITY]),
                    float(c_now), float(e_now), float(delta), today))
                self.cap_days.update(recs)
                self._cstore.async_delay_save(lambda: {"days": self.cap_days}, 30)
            have = {d.isoformat() for d in advisor.complete_days(self.hist, today, tz)}
            missing = {k: v for k, v in self.cap_days.items()
                       if ("net" not in v or v.get("v", 1) < capacity.REC_VERSION) and k in have}
            if missing:  # once: days recorded before the net-cost table existed (12-11-2026)
                base = self._plan_input()
                snapshot = {k: list(v) for k, v in self.hist.items()}
                extra = await self.hass.async_add_executor_job(partial(
                    capacity.net_records, base, snapshot, missing, tz))
                for k, v in extra.items():
                    self.cap_days[k].update(v)
                self._cstore.async_delay_save(lambda: {"days": self.cap_days}, 30)
            self._refresh_cap()
            self.async_set_updated_data(self._build_data())
        finally:
            self._cap_busy = False

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
        """Auto-adjust on: set a HBC setting to the advice when it differs enough (>= 1 h, >= 1 kWh)."""
        if self.contract != CONTRACT_DYNAMIC or not self.hbc_auto or self.hbc_advice.get("status") != "berekend":
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

    async def async_set_cap_on(self, on: bool) -> None:
        """Capacity experiment on/off (expert). Off only stops measuring new days; every stored day is kept."""
        was, self.cap_on = self.cap_on, on
        self._save_now()
        self.async_set_updated_data(self._build_data())
        if on and not was:
            self.hass.async_create_task(self.async_calc_capacity())

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
                "lading": r.get("lading"), "punten": pts, "kw": r.get("kw"), "pmin_b": r.get("pmin_b"), "komend_kwartier": r.get("start"),
                "actie": pts[0][5] if pts else None, "hbc_actie": pts[0][3] if pts else None,
                "modus": "live" if (self.live and (self.hbc_dynamic or self.contract != CONTRACT_DYNAMIC)) else "schaduw",
                "contract": self.contract, "vast": self._vast_view(),
                "hbc_strategie": st.state if st else None, "versie": VERSION,
                "zon_vandaag": sol["vandaag"], "zon_morgen": sol["morgen"], "zon_rest_vandaag": sol["rest"],
                "donker": {k: v for k, v in self.donker.items() if k != "dagen_info"} or None,  # 2.0.0: dark days after the price horizon
                "reserve_plan": self.reserve or None,  # 2.0.0: learned reserve (kwh, eigen, geleerd, betrouwbaar)
                "verkoopreserve": self.sell_view or None,  # 2.0.0: HBC sell reserve (aan, actief, reden, kwh, in_hbc, eigen, plan_kwh)
                "zon_betrouwbaar": zonleer.reliability(self.zon_boek),  # 2.0.0: solar forecast vs measured
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
            "weekprofiel": weekprofiel.verdict(self.week),
            "profile_state": p.state,
            "reliability": pct,
            "verdict": profile.verdict(pct),
            "colour": profile.colour(p.dagen, pct),
            "advice": self._advice(),
            "hbc_advice": self._hbc_advice_view(),
            "capaciteit": {**self.cap_advice, "aan": self.cap_on},
            "hbc_solar": self._hbc_solar(),
            "counter": dict(self.cnt),
            "period": period,
            "period_start": start.isoformat(),
            "piek": self._piek_view(),
            "kwartier": self._kwartier_view(),
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
