"""Finding the Solcast forecast sensors (no Home Assistant imports, so it can be tested offline).

Order for each sensor: the sensor you filled in (always wins) -> Solcast by platform (language-independent:
the translation key / unique id of the entity) -> known entity ids in the order English, Dutch, German
(taken from the translation files of the Solcast integration)."""
from __future__ import annotations

from collections.abc import Callable, Iterable

KINDS = ("vandaag", "morgen", "rest")  # today, tomorrow, remaining today

# translation key or unique id of the Solcast entity -> kind
PLATFORM_KEYS = {
    "total_kwh_forecast_today": "vandaag",
    "total_kwh_forecast_tomorrow": "morgen",
    "forecast_remaining_today": "rest",
    "get_remaining_today": "rest",
}

# known entity ids, English -> Dutch -> German
KNOWN: dict[str, tuple[str, ...]] = {
    "vandaag": (
        "sensor.solcast_pv_forecast_forecast_today",
        "sensor.solcast_pv_forecast_voorspelling_vandaag",
        "sensor.solcast_pv_forecast_prognose_heute",
    ),
    "morgen": (
        "sensor.solcast_pv_forecast_forecast_tomorrow",
        "sensor.solcast_pv_forecast_voorspelling_morgen",
        "sensor.solcast_pv_forecast_prognose_morgen",
    ),
    "rest": (
        "sensor.solcast_pv_forecast_forecast_remaining_today",
        "sensor.solcast_pv_forecast_resterende_voorspelling_vandaag",
        "sensor.solcast_pv_forecast_prognose_verbleibende_leistung_heute",
    ),
}


def platform_ids(entities: Iterable[tuple[str, str | None, str | None]]) -> dict[str, str]:
    """(entity_id, translation_key, unique_id) of the Solcast sensors -> kind -> entity id."""
    out: dict[str, str] = {}
    for eid, tkey, uid in entities:
        kind = PLATFORM_KEYS.get(tkey or "") or PLATFORM_KEYS.get(uid or "")
        if kind and kind not in out:
            out[kind] = eid
    return out


# Solcast day 3 .. day 7 (translation key or unique id): only read for their detailed forecast (dark days, donker.py)
LATER_DAY_KEYS = tuple(f"total_kwh_forecast_d{i}" for i in range(3, 8))


def later_days(entities: Iterable[tuple[str, str | None, str | None]]) -> list[str]:
    """(entity_id, translation_key, unique_id) of the Solcast sensors -> entity ids of day 3 .. day 7, in day order."""
    found: dict[str, str] = {}
    for eid, tkey, uid in entities:
        for key in LATER_DAY_KEYS:
            if key not in found and (tkey == key or (uid or "").endswith(key)):
                found[key] = eid
    return [found[k] for k in LATER_DAY_KEYS if k in found]


def resolve(custom: dict[str, str], platform: dict[str, str], exists: Callable[[str], bool]) -> dict[str, str | None]:
    """Chosen entity id per kind, or None when nothing is found."""
    out: dict[str, str | None] = {}
    for kind in KINDS:
        mine = (custom.get(kind) or "").strip()
        if mine:
            out[kind] = mine
        elif kind in platform:
            out[kind] = platform[kind]
        else:
            out[kind] = next((e for e in KNOWN[kind] if exists(e)), None)
    return out
