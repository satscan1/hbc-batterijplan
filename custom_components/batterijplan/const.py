"""Constants of the Batterijplan integration."""
from __future__ import annotations

DOMAIN = "batterijplan"
NAME = "Batterijplan"
VERSION = "1.0.0-rc4"

# settings (config entry options) and their defaults
CONF_CAPACITY = "capaciteit"
CONF_MARGIN = "marge"
CONF_STORAGE_FEE = "opslag"
CONF_VAT = "btw"
CONF_FEED_IN_FEE = "teruglever_toeslag"
CONF_FEED_IN_BONUS = "teruglever_bonus"
CONF_BONUS_FROM = "bonus_van"
CONF_BONUS_TO = "bonus_tot"
CONF_PRICES = "hbc_prijzen"
CONF_CONTRACT_START = "contract_start"
CONF_SENSOR_NET = "sensor_net"
CONF_SENSOR_SOLAR = "sensor_zon"
CONF_SENSOR_BATTERY = "sensor_batterij"
CONF_SENSOR_EV = "sensor_ev"

PRICES_RAW = "kaal"
PRICES_ALL_IN = "all-in"

DEFAULTS: dict[str, object] = {
    CONF_CAPACITY: 0.0,
    CONF_MARGIN: 0.3,
    CONF_STORAGE_FEE: 0.0,
    CONF_VAT: 21.0,
    CONF_FEED_IN_FEE: 0.02,
    CONF_FEED_IN_BONUS: 10.0,
    CONF_BONUS_FROM: 8,
    CONF_BONUS_TO: 17,
    CONF_PRICES: PRICES_RAW,
    CONF_CONTRACT_START: "",
    CONF_SENSOR_NET: "",
    CONF_SENSOR_SOLAR: "",
    CONF_SENSOR_BATTERY: "",
    CONF_SENSOR_EV: "",
}

# Home Battery Control (HBC) entities
HBC_PRICES = "sensor.hbc_energy_prices_data"
HBC_STRATEGY = "input_select.house_battery_strategy"
HBC_DELTA = "input_number.house_battery_strategy_dynamic_threshold_delta"
HBC_COUNT = "input_number.house_battery_count"

# keys of the switches (restored on start)
SWITCH_LIVE = "batterijplan_live"
SWITCH_RULES = {
    "laden": "batterijplan_regel_laden",
    "ontladen": "batterijplan_regel_ontladen",
    "vasthouden": "batterijplan_regel_vasthouden",
    "terugleveren": "batterijplan_regel_terugleveren",
}

STORAGE_VERSION = 1
FRONTEND_URL = "/batterijplan_frontend"
