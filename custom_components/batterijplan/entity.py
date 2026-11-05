"""Base entity: every Batterijplan entity hangs under one device and keeps its fixed entity id."""
from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, NAME, VERSION
from .coordinator import BatterijplanCoordinator


def device_info(entry_id: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, entry_id)},
        name=NAME,
        manufacturer="SatScan",
        model="HBC Batterijplan",
        sw_version=VERSION,
        entry_type=DeviceEntryType.SERVICE,
    )


class BatterijplanEntity(CoordinatorEntity[BatterijplanCoordinator]):
    """Entity whose id is ``<domain>.<key>`` (same object ids as the YAML package had).

    ``has_entity_name`` is on so the visible name comes from the translations
    (``translation_key``) and is shown next to the device name. Because that would also
    change the generated id (device name as prefix), the id is set explicitly to
    ``<platform domain>.<key>``: existing cards, history and the dashboard keep working."""

    _attr_has_entity_name = True
    _platform_domain: str  # set by each platform class (switch, sensor, number, select, text, date)

    def __init__(self, coordinator: BatterijplanCoordinator, key: str) -> None:
        super().__init__(coordinator)
        self._key = key
        self.entity_id = f"{self._platform_domain}.{key}"
        self._attr_unique_id = f"{coordinator.config_entry.entry_id}_{key}"
        self._attr_translation_key = key
        self._attr_device_info = device_info(coordinator.config_entry.entry_id)
