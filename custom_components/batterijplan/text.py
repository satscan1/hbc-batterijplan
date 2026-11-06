"""Text settings: the sensors that give grid, solar, battery and EV charger power and the solar forecast (entity ids)."""
from __future__ import annotations

import re

from homeassistant.components.text import TextEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import CONF_SENSOR_BATTERY, CONF_SENSOR_EV, CONF_SENSOR_NET, CONF_SENSOR_SOLAR, CONF_SOLAR_TODAY, CONF_SOLAR_TOMORROW
from .coordinator import BatterijplanConfigEntry
from .entity import BatterijplanEntity

# the value is only ever read as a sensor state; accept nothing but a sensor id (or empty), never another domain
SENSOR_ID = re.compile(r"^sensor\.[a-z0-9_]+\Z")

TEXTS = (
    ("batterijplan_sensor_net", CONF_SENSOR_NET, "mdi:transmission-tower"),
    ("batterijplan_sensor_zon", CONF_SENSOR_SOLAR, "mdi:solar-power"),
    ("batterijplan_sensor_batterij", CONF_SENSOR_BATTERY, "mdi:home-battery"),
    ("batterijplan_sensor_ev", CONF_SENSOR_EV, "mdi:ev-station"),
    ("batterijplan_sensor_zon_vandaag", CONF_SOLAR_TODAY, "mdi:weather-sunny"),
    ("batterijplan_sensor_zon_morgen", CONF_SOLAR_TOMORROW, "mdi:weather-sunset-up"),
)


async def async_setup_entry(hass: HomeAssistant, entry: BatterijplanConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    async_add_entities(SensorText(entry.runtime_data, *t) for t in TEXTS)


class SensorText(BatterijplanEntity, TextEntity):
    _platform_domain = "text"
    _attr_native_max = 255
    _attr_native_min = 0
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, coordinator, key: str, option: str, icon: str) -> None:
        super().__init__(coordinator, key)
        self._option = option
        self._attr_icon = icon

    @property
    def native_value(self) -> str:
        return str(self.coordinator.settings[self._option] or "")

    async def async_set_value(self, value: str) -> None:
        value = value.strip()
        if value and not SENSOR_ID.match(value):
            raise ServiceValidationError(f"{value!r} is not a sensor entity id (sensor.xxx)")
        await self.coordinator.async_set_setting(self._option, value)
