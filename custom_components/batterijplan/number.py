"""Number settings, stored in the config entry options."""
from __future__ import annotations

from dataclasses import dataclass

from homeassistant.components.number import NumberEntity, NumberMode
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import CONF_CAPACITY, CONF_FEED_IN_BONUS, CONF_FEED_IN_FEE, CONF_MARGIN, CONF_STORAGE_FEE, CONF_VAT
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


SPECS = (
    Spec("batterijplan_capaciteit", CONF_CAPACITY, 0, 40, 0.1, "kWh", "mdi:battery-high"),
    Spec("batterijplan_marge", CONF_MARGIN, 0, 3, 0.1, "kWh", "mdi:shield-half-full"),
    Spec("batterijplan_opslag", CONF_STORAGE_FEE, 0, 0.5, 0.00001, "EUR/kWh", "mdi:cash-plus"),
    Spec("batterijplan_btw", CONF_VAT, 0, 30, 1, "%", "mdi:percent"),
    Spec("batterijplan_teruglever_toeslag", CONF_FEED_IN_FEE, -0.5, 0.5, 0.001, "EUR/kWh", "mdi:transmission-tower-export"),
    Spec("batterijplan_teruglever_bonus", CONF_FEED_IN_BONUS, 0, 50, 1, "%", "mdi:weather-sunny"),
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
        return float(self.coordinator.settings[self._spec.option])

    async def async_set_native_value(self, value: float) -> None:
        await self.coordinator.async_set_setting(self._spec.option, float(value))
