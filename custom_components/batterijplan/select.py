"""Select setting: are the HBC prices raw exchange prices or all-in prices?"""
from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import CONF_CONTRACT_TYPE, CONF_PRICES, CONF_TARIFF, CONTRACTS, PRICES_ALL_IN, PRICES_RAW, TARIFFS
from .coordinator import BatterijplanConfigEntry
from .entity import BatterijplanEntity


async def async_setup_entry(hass: HomeAssistant, entry: BatterijplanConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    c = entry.runtime_data
    async_add_entities([PricesSelect(c), ContractSelect(c), TariffSelect(c)])


class PricesSelect(BatterijplanEntity, SelectEntity):
    _platform_domain = "select"
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


class ContractSelect(BatterijplanEntity, SelectEntity):
    """Step 1 of the contract, independent of the country: Fixed or Dynamic."""

    _platform_domain = "select"
    _attr_options = list(CONTRACTS)
    _attr_icon = "mdi:file-document-edit-outline"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "batterijplan_contract_soort")

    @property
    def current_option(self) -> str:
        return self.coordinator.contract_kind

    async def async_select_option(self, option: str) -> None:
        await self.coordinator.async_set_setting(CONF_CONTRACT_TYPE, option)


class TariffSelect(BatterijplanEntity, SelectEntity):
    """Step 2, only with a Fixed contract: single rate (enkel) or dual rate (dubbel: normal / off-peak)."""

    _platform_domain = "select"
    _attr_options = list(TARIFFS)
    _attr_icon = "mdi:clock-time-eight-outline"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, "batterijplan_tarief")

    @property
    def current_option(self) -> str:
        return self.coordinator.tariff

    async def async_select_option(self, option: str) -> None:
        await self.coordinator.async_set_setting(CONF_TARIFF, option)

