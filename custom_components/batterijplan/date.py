"""Date setting: start date of the energy contract (the contract year of the value counter begins then)."""
from __future__ import annotations

from datetime import date

from homeassistant.components.date import DateEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import CONF_CONTRACT_START
from .coordinator import BatterijplanConfigEntry
from .entity import BatterijplanEntity


async def async_setup_entry(hass: HomeAssistant, entry: BatterijplanConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    async_add_entities([ContractStart(entry.runtime_data)])


class ContractStart(BatterijplanEntity, DateEntity):
    _platform_domain = "date"
    _attr_icon = "mdi:calendar-start"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "batterijplan_contract_start")

    @property
    def native_value(self) -> date | None:
        raw = self.coordinator.setting_text(CONF_CONTRACT_START)
        return dt_util.parse_date(raw) if raw else None

    async def async_set_value(self, value: date) -> None:
        await self.coordinator.async_set_setting(CONF_CONTRACT_START, value.isoformat())
