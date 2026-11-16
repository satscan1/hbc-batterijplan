"""Constants of the Batterijplan integration."""
from __future__ import annotations

DOMAIN = "batterijplan"
NAME = "Batterijplan"
VERSION = "2.0.0-dev1"

# settings (config entry options) and their defaults
CONF_CAPACITY = "capaciteit"
CONF_MARGIN = "marge"
CONF_STORAGE_FEE = "opslag"
CONF_VAT = "btw"
CONF_FEED_IN_FEE = "teruglever_toeslag"
CONF_FEED_IN_BONUS = "teruglever_bonus"
CONF_BONUS_FROM = "bonus_van"
CONF_BONUS_TO = "bonus_tot"
CONF_COUNTRY = "land"  # v1 / first dev builds only: the country is now taken from Home Assistant (see coordinator.real_country)
CONF_FEED_IN_FIXED = "teruglever_vast"
CONF_PRICES = "hbc_prijzen"
CONF_CONTRACT_START = "contract_start"
CONF_SENSOR_NET = "sensor_net"
CONF_SENSOR_SOLAR = "sensor_zon"
CONF_SENSOR_BATTERY = "sensor_batterij"
CONF_SENSOR_EV = "sensor_ev"
CONF_SOLAR_TODAY = "sensor_zon_vandaag"
CONF_SOLAR_TOMORROW = "sensor_zon_morgen"
# 2.0.0-dev1: kind of contract (independent of the country), Flemish capacity tariff, trial mode
CONF_CONTRACT_TYPE = "contract_soort"
CONF_PRICE_FIXED = "prijs_vast"
CONF_PRICE_DAY = "prijs_dag"
CONF_PRICE_NIGHT = "prijs_nacht"
CONF_CAP_TARIFF = "capaciteitstarief"
CONF_OWN_LIMIT = "eigen_grens_w"
CONF_FLANDERS = "vlaanderen"  # switch: Flemish capacity tariff (quarter calculation, monthly peak, own limit, kW display); default off
CONF_TRIAL = "proefmodus_be"  # removed in 2.0.0-dev1 (Flanders on in NL does the same); only used by the migration
CONF_TARIFF = "tarief"  # Fixed contract: single rate (enkel) or dual rate (dubbel: normal / off-peak)
CONF_FEED_IN_PRICE = "terugleverprijs_vast"  # EUR/kWh paid for feed-in under a Fixed contract (HBC has no such helper)
CONF_NIGHT_FROM = "nacht_van"  # Day/night contract: night hours [from, to) for charging
CONF_NIGHT_TO = "nacht_tot"
CONF_WEEKEND = "dal_weekend"  # Day/night: weekend and public holidays off-peak all day (None = country default: NL on)

COUNTRY_NL = "nl"
COUNTRY_DE = "de"
COUNTRY_BE = "be"  # Flanders
COUNTRIES = [COUNTRY_NL, COUNTRY_DE, COUNTRY_BE]

CONTRACT_FIXED = "vast"
CONTRACT_DAYNIGHT = "dag_nacht"
CONTRACT_DYNAMIC = "dynamisch"
CONTRACTS = [CONTRACT_FIXED, CONTRACT_DYNAMIC]  # what the user chooses; Fixed + dual rate is CONTRACT_DAYNIGHT inside
TARIFF_SINGLE = "enkel"
TARIFF_DUAL = "dubbel"
TARIFFS = [TARIFF_SINGLE, TARIFF_DUAL]

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
    CONF_FEED_IN_FIXED: 0.077,  # EUR/kWh, only used for Germany
    CONF_PRICES: PRICES_RAW,
    CONF_CONTRACT_START: "",
    CONF_SENSOR_NET: "",
    CONF_SENSOR_SOLAR: "",
    CONF_SENSOR_BATTERY: "",
    CONF_SENSOR_EV: "",
    CONF_SOLAR_TODAY: "",
    CONF_SOLAR_TOMORROW: "",
    CONF_CONTRACT_TYPE: CONTRACT_DYNAMIC,  # = how v1 behaved: HBC Dynamic + plan
    CONF_TARIFF: TARIFF_SINGLE,
    CONF_FEED_IN_PRICE: 0.0,  # EUR/kWh, Fixed contract
    CONF_PRICE_FIXED: 0.30,  # EUR/kWh, Fixed contract (filled in by the user)
    CONF_PRICE_DAY: 0.35,  # EUR/kWh, Day/night contract
    CONF_PRICE_NIGHT: 0.25,  # EUR/kWh, Day/night contract
    CONF_CAP_TARIFF: 55,  # EUR/kW/year, Flanders
    CONF_OWN_LIMIT: 0,  # W, optional own limit (0 = none), Flanders
    CONF_NIGHT_FROM: None,  # h, start of the night (Day/night contract); None = country default (NL 23, BE 22), see daluren.py
    CONF_NIGHT_TO: None,  # h, end of the night (default 7)
    CONF_WEEKEND: None,  # None = country default (NL on, others off)
    CONF_FLANDERS: False,
}

# Home Battery Control (HBC) entities
HBC_PRICES = "sensor.hbc_energy_prices_data"
HBC_STRATEGY = "input_select.house_battery_strategy"
HBC_DELTA = "input_number.house_battery_strategy_dynamic_threshold_delta"
HBC_COUNT = "input_number.house_battery_count"
HBC_FORECAST_POINTER = "input_text.house_battery_strategy_solar_forecast_entity_id"
HBC_RESERVED = "input_number.house_battery_solar_reserved_for_house"
HBC_MAX_ENERGY = "input_number.house_battery_total_max_available_energy"
HBC_CHEAPEST_HRS = "input_number.house_battery_strategy_dynamic_cheapest_hrs"
HBC_EXPENSIVE_HRS = "input_number.house_battery_strategy_dynamic_expensive_hrs"
# HBC peak shaving (import limit), used for Belgium
HBC_LIMIT_IMPORT_ON = "input_boolean.house_battery_control_has_power_limit_import"
HBC_LIMIT_IMPORT_W = "input_number.house_battery_control_power_limit_import"
HBC_STRATEGY_SELF = "Self-consumption"
HBC_STRATEGY_CHARGE = "Charge"  # used for charging at night under a Day/night contract
# the three HBC settings Batterijplan may advise on / adjust: key -> (helper, difference that counts, unit)
HBC_SETTINGS = {
    "cheapest": (HBC_CHEAPEST_HRS, 1.0, "h"),
    "expensive": (HBC_EXPENSIVE_HRS, 1.0, "h"),
    "solar": (HBC_RESERVED, 0.5, "kWh"),
}

# keys of the switches (restored on start)
SWITCH_LIVE = "batterijplan_live"
SWITCH_HBC_AUTO = "batterijplan_hbc_auto"
SWITCH_CAPACITY = "batterijplan_experiment_capaciteit"
SWITCH_FLANDERS = "batterijplan_vlaanderen"
OBSOLETE_ENTITIES = (("select", "batterijplan_land"), ("switch", "batterijplan_proefmodus"))  # of the first dev builds, removed from the registry at setup
SWITCH_RULES = {
    "laden": "batterijplan_regel_laden",
    "ontladen": "batterijplan_regel_ontladen",
    "vasthouden": "batterijplan_regel_vasthouden",
    "terugleveren": "batterijplan_regel_terugleveren",
}

OWN_SOLAR_SENSOR = "sensor.batterijplan_zon_voor_hbc"
STORAGE_VERSION = 1
FRONTEND_URL = "/batterijplan_frontend"


def internal_contract(raw: object, tariff: object) -> str:
    """Contract as the logic uses it. The user chooses Fixed or Dynamic (step 1) and, with Fixed, a single or dual rate (step 2):
    Fixed + single = internal 'vast', Fixed + dual = internal 'dag_nacht'. A stored 'dag_nacht' (first dev build) counts as Fixed + dual."""
    v = str(raw or "").lower()
    if v == CONTRACT_DAYNIGHT:
        return CONTRACT_DAYNIGHT
    if v == CONTRACT_FIXED:
        return CONTRACT_DAYNIGHT if str(tariff or "").lower() == TARIFF_DUAL else CONTRACT_FIXED
    return CONTRACT_DYNAMIC


def migrate_contract(raw: object) -> dict[str, str] | None:
    """Options to store once for a contract value of the first dev build ('dag_nacht' -> Fixed + dual rate); None = nothing to do."""
    if str(raw or "").lower() == CONTRACT_DAYNIGHT:
        return {CONF_CONTRACT_TYPE: CONTRACT_FIXED, CONF_TARIFF: TARIFF_DUAL}
    return None


def ha_country(country: object) -> str:
    """Country for night hours, public holidays and wording: from Home Assistant (nl / be / de), anything else counts as nl."""
    c = str(country or "").lower()
    return c if c in COUNTRIES else COUNTRY_NL


def migrate_options(data: dict, options: dict) -> dict | None:
    """New options for an entry of v1 / the first dev builds, or None when nothing changes. Nothing is lost:
    - contract 'dag_nacht' -> Fixed + dual rate;
    - a stored country 'be' -> the Flanders switch on (the country itself now comes from Home Assistant);
    - the stored country and the trial mode are dropped from the options."""
    merged = {**data, **options}
    new = dict(options)
    mc = migrate_contract(merged.get(CONF_CONTRACT_TYPE))
    if mc:
        new.update(mc)
    if CONF_FLANDERS not in new and str(merged.get(CONF_COUNTRY) or "").lower() == COUNTRY_BE:
        new[CONF_FLANDERS] = True
    new.pop(CONF_COUNTRY, None)
    new.pop(CONF_TRIAL, None)
    return new if new != options else None
