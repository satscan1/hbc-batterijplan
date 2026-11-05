"""Coordinator: reads Home Assistant, runs plan.py, steers HBC, learns consumption, counts value."""
from __future__ import annotations

import logging
import time
from datetime import date, datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_call_later, async_track_state_change_event, async_track_time_change
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from . import consumption as profile
from . import counter, plan, steering
from .const import (
    CONF_BONUS_FROM, CONF_BONUS_TO, CONF_CAPACITY, CONF_CONTRACT_START, CONF_FEED_IN_BONUS, CONF_FEED_IN_FEE,
    CONF_MARGIN, CONF_PRICES, CONF_SENSOR_BATTERY, CONF_SENSOR_EV, CONF_SENSOR_NET, CONF_SENSOR_SOLAR,
    CONF_STORAGE_FEE, CONF_VAT, DEFAULTS, DOMAIN, HBC_COUNT, HBC_DELTA, HBC_PRICES, HBC_STRATEGY, PRICES_ALL_IN,
    STORAGE_VERSION, SWITCH_RULES, VERSION,
)

_LOGGER = logging.getLogger(__name__)
BAD = ("unknown", "unavailable", "none", "None", "", "nan")
SOLCAST_FALLBACK = ["sensor.solcast_pv_forecast_forecast_today", "sensor.solcast_pv_forecast_forecast_tomorrow"]

BatterijplanConfigEntry = ConfigEntry["BatterijplanCoordinator"]


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
                                    "schaduw_t": 0.0, "schaduw_nieuw": False}
        self.remembered: dict[str, str] = {}
        self._unsub: list[Any] = []
        self._recalc_pending = False
        self._recalc_unsub: Any = None
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
        if not self.cnt["sinds"]:
            self.cnt["sinds"] = dt_util.now().strftime("%d-%m-%Y")
        hass = self.hass
        srcs = [self.setting_text(k) for k in (CONF_SENSOR_NET, CONF_SENSOR_SOLAR, CONF_SENSOR_BATTERY, CONF_SENSOR_EV)]
        srcs = [s for s in srcs if s]
        if srcs:
            self._unsub.append(async_track_state_change_event(hass, srcs, self._source_changed))
        self._unsub.append(async_track_state_change_event(hass, [HBC_PRICES], self._prices_changed))
        self._unsub.append(async_track_state_change_event(
            hass, [HBC_STRATEGY, *steering.HBC_SELECTS.values()], self._hbc_changed))
        self._unsub.append(async_track_time_change(hass, self._tick_plan, minute=[14, 29, 44, 59], second=30))
        self._unsub.append(async_track_time_change(hass, self._tick_learn, minute=[0, 15, 30, 45], second=0))
        self._unsub.append(async_at_started(hass, self._started))
        self._sample()

    async def _started(self, _hass: HomeAssistant) -> None:
        self._sample()
        await self.async_recalculate()

    @callback
    def async_stop(self) -> None:
        for u in self._unsub:
            u()
        self._unsub = []
        if self._recalc_unsub is not None:
            self._recalc_unsub()
            self._recalc_unsub = None
        self._save_now()

    def _save_now(self) -> None:
        self._store.async_delay_save(self._data_to_save, 1)

    def _data_to_save(self) -> dict[str, Any]:
        return {"profile": self.profile.to_dict(), "counter": self.cnt, "remembered": self.remembered}

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
        self._save_now()
        self.async_set_updated_data(self._build_data())

    @callback
    def _prices_changed(self, _event: Event) -> None:
        self.request_recalculate()

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
    def _solcast(self) -> tuple[dict[int, float], dict[int, float]]:
        reg = er.async_get(self.hass)
        ids = [e.entity_id for e in reg.entities.values() if e.platform == "solcast_solar" and e.domain == "sensor"]
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
            c["pending"] = {
                "start": r["start"],
                "value": counter.quarter_value(r["k_hbc0"], r["k_plan0"], r["s_hbc0"], r["s_plan0"], r["pmin_b"]),
                "live": bool(self.live and self.hbc_dynamic),
                "action": pt[5],
            }
        elif r and pend and r.get("punten"):
            pend["live"] = bool(pend["live"] and self.live and self.hbc_dynamic)
        self._save_now()

    def _settle(self, pend: dict[str, Any]) -> None:
        c = self.cnt
        v = float(pend["value"])
        if pend["live"]:
            c["live"] = round(c["live"] + v, 4)
            c["total"] = round(c["total"] + v, 4)
            c["n_hold"] += 1 if pend["action"] == "H" else 0
            c["n_feed"] += 1 if pend["action"] == "V" else 0
            c["n_discharge"] += 1 if pend["action"] == "O" else 0
            c["schaduw_nieuw"] = True  # the next shadow stretch starts from zero
        else:
            # shadow is only kept for the current shadow stretch and at most 30 days (Adrie 05-11-2026)
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

    # ---- data for the entities ------------------------------------------------------------
    def _build_data(self) -> dict[str, Any]:
        r = self.plan_result
        pts = r.get("punten") or []
        p = self.profile
        pct = profile.reliability(p)
        start, period = self._period()
        st = self.hass.states.get(HBC_STRATEGY)
        return {
            "plan": r,
            "plan_attrs": {
                "kosten_hbc": r.get("kosten_hbc"), "kosten_plan": r.get("kosten_plan"), "start": r.get("start"),
                "lading": r.get("lading"), "punten": pts, "komend_kwartier": r.get("start"),
                "actie": pts[0][5] if pts else None, "hbc_actie": pts[0][3] if pts else None,
                "modus": "live" if (self.live and self.hbc_dynamic) else "schaduw",
                "hbc_strategie": st.state if st else None, "versie": VERSION,
                "uitleg": "punten = [time, price ct, kind (1 HBC expensive, 2 extra expensive, -1 cheap, 0 normal), "
                          "action HBC, charge HBC, action plan, charge plan, solar kW]; "
                          "actions L charge from grid, O discharge, H hold, Z solar only, V feed in",
            },
            "saving": r.get("opbrengst") if r else None,
            "charge": r.get("lading") if r else None,
            "price": self._price_now(),
            "consumption": self.consumption_w,
            "consumption_15m": round(a, 1) if (a := self.avg.average(time.time())) is not None else None,
            "profile": p,
            "profile_state": p.state,
            "reliability": pct,
            "verdict": profile.verdict(pct),
            "colour": profile.colour(p.dagen, pct),
            "advice": self._advice(),
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
