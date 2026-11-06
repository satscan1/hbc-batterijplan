"""Sensors: the plan, charge, price, house consumption, learned profile, forecast quality and value counter."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorEntityDescription, SensorStateClass
from homeassistant.const import UnitOfEnergy, UnitOfPower
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .coordinator import BatterijplanConfigEntry
from .entity import BatterijplanEntity


@dataclass(frozen=True, kw_only=True)
class BpSensorDescription(SensorEntityDescription):
    value: Callable[[dict[str, Any]], Any]
    attrs: Callable[[dict[str, Any]], dict[str, Any]] | None = None


def _profile_attrs(d: dict[str, Any]) -> dict[str, Any]:
    p = d["profile"]
    return {"dagen": p.dagen, "uur": p.uur, "n": p.n, "bt_n": p.bt_n, "bt_afw": p.bt_afw, "bt_gem": p.bt_gem,
            "bt_bw": p.bt_bw, "bt_bp": p.bt_bp, "bt_bk": p.bt_bk, "bt_blok": p.bt_blok, "bt_maat": p.bt_maat}


def _counter_attrs(d: dict[str, Any]) -> dict[str, Any]:
    c = d["counter"]
    return {"sinds": c["sinds"], "eur_live": c["live"], "eur_schaduw": c["schaduw"],
            "kwartieren_vastgehouden": c["n_hold"], "kwartieren_teruggeleverd": c["n_feed"],
            "kwartieren_ontladen": c["n_discharge"]}


SENSORS: tuple[BpSensorDescription, ...] = (
    BpSensorDescription(key="batterijplan", icon="mdi:battery-clock",
                        native_unit_of_measurement="EUR", value=lambda d: d["saving"], attrs=lambda d: d["plan_attrs"]),
    BpSensorDescription(key="batterijplan_lading", translation_key="batterijplan_lading", icon="mdi:battery-clock-outline",
                        native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR, device_class=SensorDeviceClass.ENERGY_STORAGE,
                        state_class=SensorStateClass.MEASUREMENT, value=lambda d: d["charge"],
                        attrs=lambda d: {"lading_plan": d["plan_attrs"]["lading"]}),
    BpSensorDescription(key="batterijplan_prijs", translation_key="batterijplan_prijs", icon="mdi:currency-eur",
                        native_unit_of_measurement="ct/kWh", state_class=SensorStateClass.MEASUREMENT, value=lambda d: d["price"]),
    BpSensorDescription(key="batterijplan_huisverbruik", translation_key="batterijplan_huisverbruik", icon="mdi:home-lightning-bolt",
                        native_unit_of_measurement=UnitOfPower.WATT, device_class=SensorDeviceClass.POWER,
                        state_class=SensorStateClass.MEASUREMENT, value=lambda d: d["consumption"]),
    BpSensorDescription(key="batterijplan_huisverbruik_15m", translation_key="batterijplan_huisverbruik_15m", icon="mdi:home-lightning-bolt-outline",
                        native_unit_of_measurement=UnitOfPower.WATT, device_class=SensorDeviceClass.POWER,
                        state_class=SensorStateClass.MEASUREMENT, value=lambda d: d["consumption_15m"]),
    BpSensorDescription(key="batterijplan_verbruiksprofiel", translation_key="batterijplan_verbruiksprofiel", icon="mdi:chart-bell-curve",
                        value=lambda d: d["profile_state"], attrs=_profile_attrs),
    BpSensorDescription(key="batterijplan_voorspelling", translation_key="batterijplan_voorspelling", icon="mdi:crystal-ball",
                        value=lambda d: d["verdict"],
                        attrs=lambda d: {"dagen": d["profile"].dagen, "betrouwbaarheid": d["reliability"]}),
    BpSensorDescription(key="batterijplan_voorspelling_kleur", translation_key="batterijplan_voorspelling_kleur", icon="mdi:palette",
                        value=lambda d: d["colour"]),
    BpSensorDescription(key="batterijplan_meerwaarde", translation_key="batterijplan_meerwaarde", icon="mdi:cash-plus",
                        native_unit_of_measurement="EUR", device_class=SensorDeviceClass.MONETARY,
                        state_class=SensorStateClass.TOTAL, value=lambda d: round(d["counter"]["total"], 4), attrs=_counter_attrs),
    BpSensorDescription(key="batterijplan_advies_zon_na_goedkoop_laden", translation_key="batterijplan_advies_zon_na_goedkoop_laden",
                        icon="mdi:home-lightning-bolt-outline", native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
                        state_class=SensorStateClass.MEASUREMENT, value=lambda d: d["advice"]["vandaag"],
                        attrs=lambda d: {k: v for k, v in d["advice"].items() if k != "vandaag"}),
    BpSensorDescription(key="batterijplan_advies_hbc", translation_key="batterijplan_advies_hbc", icon="mdi:tune-vertical",
                        value=lambda d: d["hbc_advice"]["status"],
                        attrs=lambda d: {k: v for k, v in d["hbc_advice"].items() if k != "status"}),
    BpSensorDescription(key="batterijplan_zon_voor_hbc", translation_key="batterijplan_zon_voor_hbc",
                        icon="mdi:solar-power-variant", native_unit_of_measurement=UnitOfEnergy.KILO_WATT_HOUR,
                        state_class=SensorStateClass.MEASUREMENT,
                        value=lambda d: d["hbc_solar"]["value"],
                        attrs=lambda d: {k: v for k, v in d["hbc_solar"].items() if k != "value"}),
    BpSensorDescription(key="batterijplan_meerwaarde_periode", translation_key="batterijplan_meerwaarde_periode", icon="mdi:calendar-check",
                        native_unit_of_measurement="EUR", device_class=SensorDeviceClass.MONETARY,
                        value=lambda d: d["period"], attrs=lambda d: {"periode_start": d["period_start"]}),
)


async def async_setup_entry(hass: HomeAssistant, entry: BatterijplanConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    async_add_entities(BatterijplanSensor(entry.runtime_data, d) for d in SENSORS)


# Attributes the cards only read live from the state machine; they stay in the state machine but are not written to
# the recorder database (the large plan, the explanation, quarter timestamps and the figures that change with every
# plan run). Nothing reads their history (history calls in the cards use no_attributes; statistics use the state).
# Kept in the database on purpose: actie, hbc_actie, modus, hbc_strategie (the decisions), sinds, advice fields.
UNRECORDED = frozenset({
    "punten", "uitleg", "versie", "zon_vandaag", "zon_morgen", "zon_rest_vandaag",
    "kosten_hbc", "kosten_plan", "lading", "start", "komend_kwartier",
    "lading_plan", "eur_live", "eur_schaduw",
    "kwartieren_vastgehouden", "kwartieren_teruggeleverd", "kwartieren_ontladen",
})


class BatterijplanSensor(BatterijplanEntity, SensorEntity):
    _platform_domain = "sensor"
    _unrecorded_attributes = UNRECORDED
    entity_description: BpSensorDescription

    def __init__(self, coordinator, description: BpSensorDescription) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description
        if description.key == "batterijplan":
            # Main entity of the device: shows just the device name (no translated name)
            self._attr_translation_key = None
            self._attr_name = None

    @property
    def native_value(self) -> Any:
        return self.entity_description.value(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        a = self.entity_description.attrs
        return a(self.coordinator.data) if a else None

    @property
    def available(self) -> bool:
        return self.native_value is not None or self.entity_description.key == "batterijplan"
