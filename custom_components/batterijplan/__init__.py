"""HBC Batterijplan: a smarter layer on top of Home Battery Control (HBC) Dynamic.

Replaces the YAML package: plan rules, learning of the house consumption, value counter, steering of
HBC, the dashboard cards and a ready-made dashboard. Setup through a config flow.
"""
from __future__ import annotations

import hashlib
import logging
from pathlib import Path

from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, FRONTEND_URL
from .coordinator import BatterijplanConfigEntry, BatterijplanCoordinator
from .panel import async_remove_dashboard, async_setup_dashboard

_LOGGER = logging.getLogger(__name__)
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
FRONTEND_DIR = Path(__file__).parent / "frontend"
CARDS = ("batterijplan-cards.js", "batterijplan-plan-card.js")
PLATFORMS = [Platform.DATE, Platform.NUMBER, Platform.SELECT, Platform.SENSOR, Platform.SWITCH, Platform.TEXT]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """The cards on every page of the frontend (no dashboard resource needed)."""
    if "frontend" not in hass.config.components or getattr(hass, "http", None) is None:
        return True  # e.g. in tests
    from homeassistant.components.frontend import add_extra_js_url
    from homeassistant.components.http import StaticPathConfig

    await hass.http.async_register_static_paths([StaticPathConfig(FRONTEND_URL, str(FRONTEND_DIR), True)])
    for name in CARDS:
        js = FRONTEND_DIR / name
        version = await hass.async_add_executor_job(lambda p=js: hashlib.sha256(p.read_bytes()).hexdigest()[:8])
        add_extra_js_url(hass, f"{FRONTEND_URL}/{name}?v={version}")
    await async_setup_dashboard(hass)  # registered early, so it exists right after a restart
    return True


async def async_setup_entry(hass: HomeAssistant, entry: BatterijplanConfigEntry) -> bool:
    coordinator = BatterijplanCoordinator(hass, entry)
    coordinator.apply_takeover(entry.data.get("import"))
    if entry.data.get("import"):
        hass.config_entries.async_update_entry(entry, data={k: v for k, v in entry.data.items() if k != "import"})
    await coordinator.async_start()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    _restore_ids(hass, entry)
    entry.async_on_unload(async_at_started(hass, lambda _h: _restore_ids(hass, entry)))
    entry.async_on_unload(entry.add_update_listener(_settings_changed))
    await async_setup_dashboard(hass)  # first install: the dashboard could not be registered in async_setup yet
    return True


def _restore_ids(hass: HomeAssistant, entry: BatterijplanConfigEntry) -> None:
    """Keep the entity ids plain (``sensor.batterijplan_lading``, never doubled).

    While the old YAML package still owns a plain id, Home Assistant falls back to a doubled id
    (``sensor.batterijplan_batterijplan_lading``) or a ``_2`` id. A doubled id is corrected to the
    ``_2`` form; when the plain id is free (package removed) the entity gets it back, so cards and
    history keep working. Only doubled and ``_2`` ids are touched: an id the user chose is left alone."""
    reg = er.async_get(hass)

    def free(eid: str) -> bool:
        return reg.async_get(eid) is None and hass.states.get(eid) is None

    for ent in er.async_entries_for_config_entry(reg, entry.entry_id):
        key = ent.unique_id.removeprefix(f"{entry.entry_id}_")
        wanted = f"{ent.domain}.{key}"
        alt = f"{wanted}_2"
        doubled = f"{ent.domain}.{DOMAIN}_{key}" if key != DOMAIN else None
        if ent.entity_id == wanted or ent.entity_id not in (alt, doubled):
            continue
        if free(wanted):
            reg.async_update_entity(ent.entity_id, new_entity_id=wanted)
        elif ent.entity_id == doubled and free(alt):
            reg.async_update_entity(ent.entity_id, new_entity_id=alt)


async def _settings_changed(hass: HomeAssistant, entry: BatterijplanConfigEntry) -> None:
    """Options saved (form or entity): new values in, recalculate. Changing the source sensors needs a reload."""
    c = entry.runtime_data
    old = {k: c.settings.get(k) for k in c.source_keys}
    c.load_settings()
    if any(old[k] != c.settings.get(k) for k in c.source_keys):
        await hass.config_entries.async_reload(entry.entry_id)
        return
    c.async_set_updated_data(c._build_data())
    c.request_recalculate()


async def async_unload_entry(hass: HomeAssistant, entry: BatterijplanConfigEntry) -> bool:
    entry.runtime_data.async_stop()
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: BatterijplanConfigEntry) -> None:
    """Integration removed: its dashboard goes too (a reload keeps it)."""
    async_remove_dashboard(hass)
