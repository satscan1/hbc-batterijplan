"""Number settings, stored in the config entry options."""
from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import (
    CONF_CAP_TARIFF, CONF_CAPACITY, CONF_FEED_IN_BONUS, CONF_FEED_IN_FEE, CONF_MARGIN, CONF_OWN_LIMIT, CONF_PRICE_DAY,
    CONF_FEED_IN_PRICE, CONF_NIGHT_FROM, CONF_NIGHT_TO, CONF_PRICE_FIXED, CONF_PRICE_NIGHT, CONF_STORAGE_FEE, CONF_VAT,
)
from .coordinator import BatterijplanConfigEntry
from .entity import BatterijplanEntity


@dataclass(frozen=True)
class Spec:
    key: str  # entity key = object id
    option: str  # key in the options
    minimum: float
    maximum: float
    step: float
    unit: str
    icon: str
    scale: float = 1.0  # shown value = stored value / scale (own limit: stored in W, shown in kW)


SPECS = (
    Spec("batterijplan_capaciteit", CONF_CAPACITY, 0, 40, 0.1, "kWh", "mdi:battery-high"),
    Spec("batterijplan_marge", CONF_MARGIN, 0, 3, 0.1, "kWh", "mdi:shield-half-full"),
    Spec("batterijplan_opslag", CONF_STORAGE_FEE, 0, 0.5, 0.00001, "EUR/kWh", "mdi:cash-plus"),
    Spec("batterijplan_btw", CONF_VAT, 0, 30, 1, "%", "mdi:percent"),
    Spec("batterijplan_teruglever_toeslag", CONF_FEED_IN_FEE, -0.5, 0.5, 0.001, "EUR/kWh", "mdi:transmission-tower-export"),
    Spec("batterijplan_teruglever_bonus", CONF_FEED_IN_BONUS, 0, 50, 1, "%", "mdi:weather-sunny"),
    Spec("batterijplan_prijs_vast", CONF_PRICE_FIXED, 0, 2, 0.00001, "EUR/kWh", "mdi:currency-eur"),
    Spec("batterijplan_prijs_dag", CONF_PRICE_DAY, 0, 2, 0.00001, "EUR/kWh", "mdi:weather-sunny"),
    Spec("batterijplan_prijs_nacht", CONF_PRICE_NIGHT, 0, 2, 0.00001, "EUR/kWh", "mdi:weather-night"),
    Spec("batterijplan_nacht_van", CONF_NIGHT_FROM, 0, 23, 1, "h", "mdi:weather-night"),
    Spec("batterijplan_nacht_tot", CONF_NIGHT_TO, 0, 23, 1, "h", "mdi:weather-sunset-up"),
    Spec("batterijplan_capaciteitstarief", CONF_CAP_TARIFF, 0, 200, 0.01, "EUR/kW/jaar", "mdi:transmission-tower"),
    Spec("batterijplan_eigen_grens", CONF_OWN_LIMIT, 0, 25, 0.1, "kW", "mdi:speedometer", scale=1000),
    Spec("batterijplan_terugleverprijs", CONF_FEED_IN_PRICE, 0, 1, 0.00001, "EUR/kWh", "mdi:transmission-tower-export"),
)


async def async_setup_entry(hass: HomeAssistant, entry: BatterijplanConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    async_add_entities(SettingNumber(entry.runtime_data, s) for s in SPECS)


class SettingNumber(BatterijplanEntity, NumberEntity):
    _platform_domain = "number"
    _attr_mode = NumberMode.BOX
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, coordinator, spec: Spec) -> None:
        super().__init__(coordinator, spec.key)
        self._spec = spec
        self._attr_native_min_value = spec.minimum
        self._attr_native_max_value = spec.maximum
        self._attr_native_step = spec.step
        self._attr_native_unit_of_measurement = spec.unit
        self._attr_icon = spec.icon

    @property
    def native_value(self) -> float:
        if self._spec.option in (CONF_NIGHT_FROM, CONF_NIGHT_TO):  # not set yet: the country default (NL 23-07, BE 22-07)
            return float(self.coordinator.night_hours()[0 if self._spec.option == CONF_NIGHT_FROM else 1])
        return round(float(self.coordinator.settings[self._spec.option]) / self._spec.scale, 6)

    async def async_set_native_value(self, value: float) -> None:
        await self.coordinator.async_set_setting(self._spec.option, round(float(value) * self._spec.scale, 6))
