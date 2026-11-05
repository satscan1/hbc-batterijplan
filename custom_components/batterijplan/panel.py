"""The Batterijplan dashboard, delivered by the integration itself (in the sidebar).

The dashboard lives in ``dashboard/batterijplan_dashboard.yaml`` (English) and
``dashboard/batterijplan_dashboard.<lang>.yaml``; it is written with the fixed entity ids of this
integration, so nothing has to be replaced. It follows the language each user chose in the
profile and falls back to the language of Home Assistant, then English.

Home Assistant has no public API for an integration-provided dashboard. This uses the same route
as a YAML dashboard from configuration.yaml (the lovelace component's dashboard table and panel
registration), like HESC does. If that route changes in a future Home Assistant, only the
dashboard is missing; the integration keeps working and the error is logged. When the address is
already taken by a dashboard you made yourself, the integration leaves it alone and shows a repair.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import issue_registry as ir
from homeassistant.util.hass_dict import HassKey
from homeassistant.util.yaml import parse_yaml

from .const import DOMAIN, NAME

_LOGGER = logging.getLogger(__name__)

DASHBOARD_URL = "batterijplan"
DASHBOARD_ICON = "mdi:battery-clock"
DASHBOARD_DIR = Path(__file__).parent / "dashboard"
ISSUE_URL_TAKEN = "dashboard_url_taken"
DATA_DASHBOARD: HassKey[BatterijplanDashboard] = HassKey(f"{DOMAIN}_dashboard")


class BatterijplanDashboard:
    """Registers, serves and removes the dashboard."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._raw: dict[str, dict[str, Any]] = {}
        self._json: dict[str, Any] = {}
        self._lovelace: Any = None
        self.panel_registered = False

    async def async_load_files(self) -> None:
        def _read() -> dict[str, dict[str, Any]]:
            out: dict[str, dict[str, Any]] = {}
            for f in DASHBOARD_DIR.glob("batterijplan_dashboard*.yaml"):
                parts = f.name.split(".")
                lang = parts[1] if len(parts) == 3 else "en"
                config = parse_yaml(f.read_text(encoding="utf-8"))
                if not isinstance(config, dict) or not isinstance(config.get("views"), list):
                    raise HomeAssistantError(f"{f.name} has no views")
                out[lang] = config
            if "en" not in out:
                raise HomeAssistantError("English dashboard missing")
            return out

        self._raw = await self.hass.async_add_executor_job(_read)

    def language(self, lang: str | None = None) -> str:
        code = (lang or self.hass.config.language or "en").replace("_", "-").split("-")[0].lower()
        return code if code in self._raw else "en"

    def config_for(self, lang: str | None) -> dict[str, Any]:
        return self._raw[self.language(lang)]

    def json_for(self, lang: str | None) -> Any:
        from homeassistant.helpers.json import cached_json_fragment

        code = self.language(lang)
        if code not in self._json:
            self._json[code] = cached_json_fragment(self._raw[code])
        return self._json[code]

    async def async_user_language(self) -> str | None:
        """The profile language of the user who asks, or None (then: the language of Home Assistant)."""
        try:
            from homeassistant.components.frontend.storage import async_user_store
            from homeassistant.components.websocket_api import current_connection

            user = getattr(current_connection.get(), "user", None)
            if user is None:
                return None
            data = (await async_user_store(self.hass, user.id)).data.get("language")
            lang = data.get("language") if isinstance(data, dict) else None
            return lang if isinstance(lang, str) and lang else None
        except Exception:  # noqa: BLE001 - never let this cost the dashboard
            return None

    def _make_lovelace(self) -> Any:
        from homeassistant.components.lovelace.dashboard import LovelaceConfig

        owner = self

        class _Lovelace(LovelaceConfig):
            @property
            def mode(self) -> str:
                return "yaml"

            async def async_get_info(self) -> dict[str, Any]:
                return {"mode": self.mode, "views": len(owner.config_for(None).get("views", []))}

            async def async_load(self, force: bool) -> dict[str, Any]:
                return owner.config_for(await owner.async_user_language())

            async def async_json(self, force: bool) -> Any:
                return owner.json_for(await owner.async_user_language())

        return _Lovelace(self.hass, DASHBOARD_URL, {"mode": "yaml", "title": NAME, "icon": DASHBOARD_ICON,
                                                     "show_in_sidebar": True, "require_admin": False})

    def _address_taken(self, data: Any) -> bool:
        from homeassistant.components import frontend

        existing = data.dashboards.get(DASHBOARD_URL)
        if existing is not None and existing is not self._lovelace:
            return True
        return not self.panel_registered and frontend.async_panel_exists(self.hass, DASHBOARD_URL)

    async def async_register(self) -> None:
        if self.panel_registered:
            return
        if "lovelace" not in self.hass.config.components or "frontend" not in self.hass.config.components:
            return
        from homeassistant.components import frontend
        from homeassistant.components.lovelace.const import LOVELACE_DATA

        data = self.hass.data.get(LOVELACE_DATA)
        if data is None:
            return
        if self._address_taken(data):
            self._raise_taken()
            return
        if not self._raw:
            await self.async_load_files()
        if self._address_taken(data):  # the awaits above gave other code a chance
            self._raise_taken()
            return
        self._lovelace = self._lovelace or self._make_lovelace()
        data.dashboards[DASHBOARD_URL] = self._lovelace
        try:
            frontend.async_register_built_in_panel(
                self.hass, "lovelace", frontend_url_path=DASHBOARD_URL, require_admin=False, show_in_sidebar=True,
                sidebar_title=NAME, sidebar_icon=DASHBOARD_ICON, config={"mode": "yaml"}, update=False)
        except Exception:
            if data.dashboards.get(DASHBOARD_URL) is self._lovelace:
                data.dashboards.pop(DASHBOARD_URL)
            raise
        self.panel_registered = True
        ir.async_delete_issue(self.hass, DOMAIN, ISSUE_URL_TAKEN)

    def _raise_taken(self) -> None:
        _LOGGER.info("Address /%s is already in use: Batterijplan does not add its own dashboard", DASHBOARD_URL)
        ir.async_create_issue(
            self.hass, DOMAIN, ISSUE_URL_TAKEN, is_fixable=False, is_persistent=False, severity=ir.IssueSeverity.WARNING,
            translation_key=ISSUE_URL_TAKEN, translation_placeholders={"url": f"/{DASHBOARD_URL}"})

    @callback
    def async_unregister(self) -> None:
        ir.async_delete_issue(self.hass, DOMAIN, ISSUE_URL_TAKEN)
        from homeassistant.components import frontend
        from homeassistant.components.lovelace.const import LOVELACE_DATA

        if self.panel_registered:
            frontend.async_remove_panel(self.hass, DASHBOARD_URL, warn_if_unknown=False)
            self.panel_registered = False
        data = self.hass.data.get(LOVELACE_DATA)
        if data is not None and self._lovelace is not None and data.dashboards.get(DASHBOARD_URL) is self._lovelace:
            data.dashboards.pop(DASHBOARD_URL)


async def async_setup_dashboard(hass: HomeAssistant) -> None:
    """Register the dashboard once the integration is configured. A failure costs only the dashboard."""
    dash = hass.data.get(DATA_DASHBOARD)
    if dash is None:
        dash = hass.data[DATA_DASHBOARD] = BatterijplanDashboard(hass)
    if dash.panel_registered or not hass.config_entries.async_entries(DOMAIN):
        return
    try:
        await dash.async_register()
    except Exception:
        _LOGGER.exception("Batterijplan could not add its dashboard")


@callback
def async_remove_dashboard(hass: HomeAssistant) -> None:
    dash = hass.data.pop(DATA_DASHBOARD, None)
    if dash is not None:
        dash.async_unregister()
