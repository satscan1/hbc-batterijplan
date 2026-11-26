"""How reliable is the solar forecast here? (2.0.0, no Home Assistant or HBC imports)

Every day Batterijplan writes down the normal solar forecast (P50, kWh) for that day, once, early in the morning (before the sun
is up, so the measurement cannot leak into it). After the day the measured solar (kWh, from the quarter history) is set next to
it. Reliability = 100 % minus the summed deviation over the summed measurement of the last ``WINDOW`` complete days; a sunny
day weighs more than a dark one, as it does for the battery. Fewer than ``MIN_DAYS`` days: not known yet (None).
Plain types only, so Batterijplan Pro can take it over.
"""
from __future__ import annotations

WINDOW = 14  # days
MIN_DAYS = 3
KEEP = 21  # days kept in the book


def note_forecast(book: dict[str, list], day: str, forecast_kwh: float | None) -> bool:
    """Write the forecast of ``day`` (ISO date) once. Returns True when the book changed."""
    if forecast_kwh is None or forecast_kwh < 0:
        return False
    row = book.get(day)
    if row is not None and row[0] is not None:
        return False
    book[day] = [round(float(forecast_kwh), 2), row[1] if row else None]
    return True


def note_measured(book: dict[str, list], day: str, measured_kwh: float | None) -> bool:
    """Set the measured solar of a complete past ``day``. Only for days with a forecast. Returns True when the book changed."""
    row = book.get(day)
    if row is None or measured_kwh is None or measured_kwh < 0:
        return False
    v = round(float(measured_kwh), 2)
    if row[1] == v:
        return False
    row[1] = v
    return True


def prune(book: dict[str, list], today: str) -> None:
    """Keep the last ``KEEP`` days (ISO dates compare as text)."""
    from datetime import date, timedelta

    edge = (date.fromisoformat(today) - timedelta(days=KEEP)).isoformat()
    for k in [k for k in book if k < edge]:
        del book[k]


def reliability(book: dict[str, list]) -> dict:
    """{"pct": reliability % or None, "dagen": days used, "afwijking_kwh": mean absolute deviation per day}."""
    days = sorted(k for k, r in book.items() if r[0] is not None and r[1] is not None)[-WINDOW:]
    if len(days) < MIN_DAYS:
        return {"pct": None, "dagen": len(days), "afwijking_kwh": None}
    dev = sum(abs(book[d][0] - book[d][1]) for d in days)
    meas = sum(book[d][1] for d in days)
    pct = 0 if meas <= 0.5 else max(0, min(100, round(100 * (1 - dev / meas))))
    return {"pct": pct, "dagen": len(days), "afwijking_kwh": round(dev / len(days), 2)}
