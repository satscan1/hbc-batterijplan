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

    ``has_entity_name`` is off on purpose: the id must not get the device name as a prefix,
    so existing cards, history and the dashboard keep working. The visible name comes
    from the translations (``translation_key``)."""

    _attr_has_entity_name = False

    def __init__(self, coordinator: BatterijplanCoordinator, key: str) -> None:
        super().__init__(coordinator)
        self._key = key
        self._attr_unique_id = f"{coordinator.config_entry.entry_id}_{key}"
        self._attr_translation_key = key
        self._attr_device_info = device_info(coordinator.config_entry.entry_id)

    @property
    def suggested_object_id(self) -> str | None:
        return self._key
