"""Off-peak ('dal') hours of a Day/night contract (no Home Assistant imports).

Netherlands (Selectra / Innova tariff sheets): on working days the night is 23:00-07:00; Saturday, Sunday and the
recognised public holidays are off-peak all day. (Enexis, part of Noord-Brabant / Limburg, starts at 21:00: set the night start.)
Belgium: no weekend rule by default; the night is 22:00-07:00, the user can change it.

Public holidays used for 'off-peak all day':
  NL: 1 Jan, Easter Monday, King's Day (27 Apr, 26 Apr when the 27th is a Sunday), Ascension Day, Whit Monday, 25 and 26 Dec.
  BE: 1 Jan, Easter Monday, 1 May, Ascension Day, Whit Monday, 21 Jul, 15 Aug, 1 Nov, 11 Nov, 25 Dec.
Other countries: weekend only.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta

NIGHT_DEFAULT = {"nl": (23, 7), "be": (22, 7)}  # (from, to) hour; other countries use the Belgian default
WEEKEND_DEFAULT = {"nl": True}  # weekend and public holidays off-peak all day; Belgium and others: off


def default_night(country: str) -> tuple[int, int]:
    return NIGHT_DEFAULT.get(str(country).lower(), (22, 7))


def default_weekend(country: str) -> bool:
    return WEEKEND_DEFAULT.get(str(country).lower(), False)


def easter(year: int) -> date:
    """Easter Sunday (Gregorian, anonymous algorithm)."""
    a, b, c = year % 19, year // 100, year % 100
    d, e = b // 4, b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    el = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * el) // 451
    month = (h + el - 7 * m + 114) // 31
    day = (h + el - 7 * m + 114) % 31 + 1
    return date(year, month, day)


def holidays(country: str, year: int) -> set[date]:
    c = str(country).lower()
    e = easter(year)
    if c == "nl":
        kings = date(year, 4, 27)
        if kings.weekday() == 6:
            kings = date(year, 4, 26)
        return {date(year, 1, 1), e + timedelta(days=1), kings, e + timedelta(days=39), e + timedelta(days=50),
                date(year, 12, 25), date(year, 12, 26)}
    if c == "be":
        return {date(year, 1, 1), e + timedelta(days=1), date(year, 5, 1), e + timedelta(days=39), e + timedelta(days=50),
                date(year, 7, 21), date(year, 8, 15), date(year, 11, 1), date(year, 11, 11), date(year, 12, 25)}
    return set()


def in_night(hour: int, night_from: int, night_to: int) -> bool:
    """Is ``hour`` inside the night window [from, to)? A window like 23 -> 7 wraps midnight; from == to = no night."""
    if night_from == night_to:
        return False
    return night_from <= hour < night_to if night_from < night_to else (hour >= night_from or hour < night_to)


def is_dal(local: datetime, country: str, night_from: int, night_to: int, weekend: bool) -> bool:
    """Off-peak at this local time: inside the night window, or (when ``weekend``) on a Saturday, Sunday or public holiday."""
    if in_night(local.hour, night_from, night_to):
        return True
    if weekend:
        d = local.date()
        return d.weekday() >= 5 or d in holidays(country, d.year)
    return False
