"""Select setting: are the HBC prices raw exchange prices or all-in prices?"""
from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import CONF_PRICES, PRICES_ALL_IN, PRICES_RAW
from .coordinator import BatterijplanConfigEntry
from .entity import BatterijplanEntity


async def async_setup_entry(hass: HomeAssistant, entry: BatterijplanConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    async_add_entities([PricesSelect(entry.runtime_data)])


class PricesSelect(BatterijplanEntity, SelectEntity):
    _attr_options = [PRICES_RAW, PRICES_ALL_IN]
    _attr_icon = "mdi:currency-eur"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "batterijplan_hbc_prijzen")

    @property
    def current_option(self) -> str:
        return self.coordinator.settings[CONF_PRICES]

    async def async_select_option(self, option: str) -> None:
        await self.coordinator.async_set_setting(CONF_PRICES, option)
