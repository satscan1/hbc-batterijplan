"""Config flow and options flow of Batterijplan, with a takeover step for the old YAML package."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import selector

from .const import (
    CONF_BONUS_FROM, CONF_BONUS_TO, CONF_CAPACITY, CONF_CONTRACT_START, CONF_FEED_IN_BONUS, CONF_FEED_IN_FEE,
    CONF_MARGIN, CONF_PRICES, CONF_SENSOR_BATTERY, CONF_SENSOR_EV, CONF_SENSOR_NET, CONF_SENSOR_SOLAR,
    CONF_SOLAR_TODAY, CONF_SOLAR_TOMORROW, CONF_STORAGE_FEE, CONF_VAT, DEFAULTS, DOMAIN, PRICES_ALL_IN, PRICES_RAW,
)

SENSOR = selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor"))


def _number(minimum: float, maximum: float, step: float | str, unit: str) -> selector.NumberSelector:
    return selector.NumberSelector(selector.NumberSelectorConfig(
        min=minimum, max=maximum, step=step, unit_of_measurement=unit, mode=selector.NumberSelectorMode.BOX))


def _schema(values: dict[str, Any], expert: bool) -> vol.Schema:
    """The form. Optional text fields use ``suggested_value`` so an empty field stays empty."""
    def sug(key: str) -> dict[str, Any]:
        v = values.get(key, DEFAULTS[key])
        return {"suggested_value": v} if v not in (None, "") else {}

    fields: dict[Any, Any] = {
        vol.Required(CONF_SENSOR_NET, description=sug(CONF_SENSOR_NET)): SENSOR,
        vol.Required(CONF_SENSOR_BATTERY, description=sug(CONF_SENSOR_BATTERY)): SENSOR,
        vol.Optional(CONF_SENSOR_SOLAR, description=sug(CONF_SENSOR_SOLAR)): SENSOR,
        vol.Optional(CONF_SENSOR_EV, description=sug(CONF_SENSOR_EV)): SENSOR,
        vol.Optional(CONF_SOLAR_TODAY, description=sug(CONF_SOLAR_TODAY)): SENSOR,
        vol.Optional(CONF_SOLAR_TOMORROW, description=sug(CONF_SOLAR_TOMORROW)): SENSOR,
        vol.Required(CONF_CAPACITY, description=sug(CONF_CAPACITY)): _number(1, 40, 0.1, "kWh"),
        vol.Required(CONF_MARGIN, description=sug(CONF_MARGIN)): _number(0, 3, 0.1, "kWh"),
        vol.Required(CONF_PRICES, description=sug(CONF_PRICES)): selector.SelectSelector(selector.SelectSelectorConfig(
            options=[PRICES_RAW, PRICES_ALL_IN], translation_key=CONF_PRICES, mode=selector.SelectSelectorMode.DROPDOWN)),
        vol.Required(CONF_STORAGE_FEE, description=sug(CONF_STORAGE_FEE)): _number(0, 0.5, "any", "EUR/kWh"),  # "any": NumberSelector rejects step < 0.001
        vol.Optional(CONF_CONTRACT_START, description=sug(CONF_CONTRACT_START)): selector.DateSelector(),
    }
    if expert:
        fields.update({
            vol.Required(CONF_VAT, description=sug(CONF_VAT)): _number(0, 30, 1, "%"),
            vol.Required(CONF_FEED_IN_FEE, description=sug(CONF_FEED_IN_FEE)): _number(-0.5, 0.5, 0.001, "EUR/kWh"),
            vol.Required(CONF_FEED_IN_BONUS, description=sug(CONF_FEED_IN_BONUS)): _number(0, 50, 1, "%"),
            vol.Required(CONF_BONUS_FROM, description=sug(CONF_BONUS_FROM)): _number(0, 23, 1, "h"),
            vol.Required(CONF_BONUS_TO, description=sug(CONF_BONUS_TO)): _number(1, 24, 1, "h"),
        })
    return vol.Schema(fields)


def _clean(user_input: dict[str, Any]) -> dict[str, Any]:
    out = dict(user_input)
    for k in (CONF_BONUS_FROM, CONF_BONUS_TO):
        if k in out:
            out[k] = int(out[k])
    for k in (CONF_SENSOR_SOLAR, CONF_SENSOR_EV, CONF_SOLAR_TODAY, CONF_SOLAR_TOMORROW, CONF_CONTRACT_START):
        out.setdefault(k, "")
    return out


# ---- takeover from the YAML package (1.0.0-rc1/rc2) -----------------------------------------
OLD = {
    CONF_CAPACITY: "input_number.batterijplan_capaciteit",
    CONF_MARGIN: "input_number.batterijplan_marge",
    CONF_STORAGE_FEE: "input_number.batterijplan_opslag",
    CONF_PRICES: "input_select.batterijplan_hbc_prijzen",
    CONF_CONTRACT_START: "input_datetime.batterijplan_contract_start",
    CONF_SENSOR_NET: "input_text.batterijplan_sensor_net",
    CONF_SENSOR_SOLAR: "input_text.batterijplan_sensor_zon",
    CONF_SENSOR_BATTERY: "input_text.batterijplan_sensor_batterij",
    CONF_SENSOR_EV: "input_text.batterijplan_sensor_ev",
}
BAD = ("unknown", "unavailable", "none", "None", "")


def package_present(hass: HomeAssistant) -> bool:
    """True while the old package's helpers exist (as input_* helpers, not as this integration's entities)."""
    return hass.states.get("input_number.batterijplan_capaciteit") is not None


def read_package(hass: HomeAssistant) -> dict[str, Any]:
    """Settings, learned profile and counter of the old package, as one dict for the new entry."""
    values: dict[str, Any] = {}
    for key, eid in OLD.items():
        st = hass.states.get(eid)
        if st is None or st.state in BAD:
            continue
        if key in (CONF_CAPACITY, CONF_MARGIN, CONF_STORAGE_FEE):
            try:
                values[key] = float(st.state)
            except ValueError:
                continue
        elif key == CONF_CONTRACT_START:
            values[key] = st.state[:10]
        else:
            values[key] = st.state
    prof = hass.states.get("sensor.batterijplan_verbruiksprofiel")
    total = hass.states.get("sensor.batterijplan_meerwaarde")
    imp: dict[str, Any] = {}
    if prof is not None:
        imp["profile"] = dict(prof.attributes)
    if total is not None and total.state not in BAD:
        a = total.attributes
        try:
            imp["counter"] = {"total": float(total.state), "live": float(a.get("eur_live") or 0),
                              "schaduw": float(a.get("eur_schaduw") or 0), "sinds": str(a.get("sinds") or "")}
        except ValueError:
            pass
    rem = {}
    for cls, eid in (("duur", "input_text.batterijplan_hbc_duur"), ("gewoon", "input_text.batterijplan_hbc_gewoon"),
                     ("goedkoop", "input_text.batterijplan_hbc_goedkoop")):
        st = hass.states.get(eid)
        if st is not None and st.state not in BAD:
            rem[cls] = st.state
    imp["remembered"] = rem
    imp["live"] = False  # Live always starts off, also after taking over
    return {"settings": values, "import": imp}


class BatterijplanConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    def __init__(self) -> None:
        self._values: dict[str, Any] = {}
        self._import: dict[str, Any] = {}

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        await self.async_set_unique_id(DOMAIN, raise_on_progress=False)  # a stuck earlier flow must not block
        self._abort_if_unique_id_configured()
        if package_present(self.hass):
            return self.async_show_menu(step_id="user", menu_options=["takeover", "setup"])
        return await self.async_step_setup()

    async def async_step_takeover(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Take over settings, learned consumption profile and counter from the package."""
        found = read_package(self.hass)
        self._values, self._import = found["settings"], found["import"]
        return await self.async_step_setup()

    async def async_step_setup(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            data = _clean(user_input)
            if data[CONF_SENSOR_NET] == data[CONF_SENSOR_BATTERY]:
                errors["base"] = "same_sensor"
            else:
                return self.async_create_entry(title="Batterijplan", data={**DEFAULTS, **data, **({"import": self._import} if self._import else {})})
        return self.async_show_form(step_id="setup", data_schema=_schema(self._values, expert=False), errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: Any) -> OptionsFlow:
        return BatterijplanOptionsFlow()


class BatterijplanOptionsFlow(OptionsFlow):
    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        current = {**DEFAULTS, **dict(self.config_entry.data), **dict(self.config_entry.options)}
        errors: dict[str, str] = {}
        if user_input is not None:
            data = _clean(user_input)
            if data[CONF_SENSOR_NET] == data[CONF_SENSOR_BATTERY]:
                errors["base"] = "same_sensor"
            else:
                return self.async_create_entry(data={**current, **data})
        return self.async_show_form(step_id="init", data_schema=_schema(current, expert=True), errors=errors)
