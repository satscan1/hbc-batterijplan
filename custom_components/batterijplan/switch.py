"""Switches: Live (steers HBC) and one per rule (default on)."""
from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import SWITCH_LIVE, SWITCH_RULES
from .coordinator import BatterijplanConfigEntry
from .entity import BatterijplanEntity


async def async_setup_entry(hass: HomeAssistant, entry: BatterijplanConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    c = entry.runtime_data
    async_add_entities([LiveSwitch(c), *(RuleSwitch(c, rule, key) for rule, key in SWITCH_RULES.items())])


class LiveSwitch(BatterijplanEntity, SwitchEntity, RestoreEntity):
    _platform_domain = "switch"
    _attr_icon = "mdi:battery-sync"

    def __init__(self, coordinator) -> None:
        super().__init__(coordinator, SWITCH_LIVE)

    @property
    def is_on(self) -> bool:
        return self.coordinator.live

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None and last.state == STATE_ON:
            self.coordinator.live = True  # no restore of HBC modes at start: remembered modes are loaded from storage

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_live(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_live(False)


class RuleSwitch(BatterijplanEntity, SwitchEntity, RestoreEntity):
    _platform_domain = "switch"

    def __init__(self, coordinator, rule: str, key: str) -> None:
        super().__init__(coordinator, key)
        self._rule = rule
        self._attr_icon = {"laden": "mdi:transmission-tower-import", "ontladen": "mdi:battery-arrow-down",
                           "vasthouden": "mdi:battery-lock", "terugleveren": "mdi:transmission-tower-export"}[rule]

    @property
    def is_on(self) -> bool:
        return self.coordinator.rules[self._rule]

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None and last.state == STATE_OFF:
            self.coordinator.rules[self._rule] = False

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_rule(self._rule, True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_rule(self._rule, False)
