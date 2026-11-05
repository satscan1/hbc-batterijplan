"""Consumption learning (7 days, per hour of day) and forecast quality (no Home Assistant imports).

Port of the template sensor ``batterijplan_verbruiksprofiel``:
- ``uur``: expected house consumption in W per hour of the day. Up to 28 measurements per hour
  (4 per day x 7 days) a plain average, after that sliding (each new one counts 1/28).
- ``bt_*``: reliability of the forecast per block of 3 hours, sliding over 7 days (56 blocks):
  100 % - mean deviation per block / mean consumption per block.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any

MAX_N = 28
MAX_BT = 56
BT_MAAT = "blok3"


@dataclass
class Profile:
    uur: list[float | None] = field(default_factory=lambda: [None] * 24)
    n: list[int] = field(default_factory=lambda: [0] * 24)
    bt_n: int = 0
    bt_afw: float = 0.0
    bt_gem: float = 0.0
    bt_bw: float = 0.0
    bt_bp: float = 0.0
    bt_bk: int = 0
    bt_blok: str = ""
    bt_maat: str = ""

    @classmethod
    def from_dict(cls, d: dict[str, Any] | None) -> "Profile":
        """Build from stored data or from the attributes of the old package sensor."""
        d = d or {}
        p = cls()
        u, c = d.get("uur"), d.get("n")
        if isinstance(u, list) and len(u) == 24:
            p.uur = [x if isinstance(x, (int, float)) else None for x in u]
        if isinstance(c, list) and len(c) == 24:
            p.n = [int(x) if isinstance(x, (int, float)) else 0 for x in c]
        for k in ("bt_n", "bt_bk"):
            setattr(p, k, int(float(d.get(k) or 0)))
        for k in ("bt_afw", "bt_gem", "bt_bw", "bt_bp"):
            setattr(p, k, float(d.get(k) or 0))
        p.bt_blok = str(d.get("bt_blok") or "")
        p.bt_maat = str(d.get("bt_maat") or "")
        return p

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @property
    def dagen(self) -> float:
        return round(min(self.n) / 4, 1) if len(self.n) == 24 else 0.0

    @property
    def state(self) -> str:
        d = min(self.n) // 4 if len(self.n) == 24 else 0
        return "prima" if d >= 7 else ("grof" if d >= 4 else "aan het leren")


def update(prev: Profile, when: datetime, v: float) -> Profile:
    """One learning step at a quarter boundary.

    ``when`` is local time minus 2 minutes (the quarter that just ended), ``v`` the average
    house consumption in W over that quarter (negative = unknown: nothing is learned)."""
    h = when.hour
    blok = f"{when:%Y%m%d}-{h // 3}"
    nieuw = prev.bt_maat != BT_MAAT
    p_old = prev.uur[h] if len(prev.uur) == 24 and isinstance(prev.uur[h], (int, float)) else None
    geldig = p_old is not None and v >= 0
    zelfde = prev.bt_blok == blok and not nieuw
    bw, bp, bk, n, f, g = (0, 0, 0, 0, 0.0, 0.0) if nieuw else (prev.bt_bw, prev.bt_bp, prev.bt_bk, prev.bt_n, prev.bt_afw, prev.bt_gem)
    af = (not zelfde) and (not nieuw) and bk >= 8
    k = min(n + 1, MAX_BT)

    new = Profile(uur=[], n=[], bt_blok=blok, bt_maat=BT_MAAT)
    for i in range(24):
        old, cnt = prev.uur[i], prev.n[i]
        if i == h and v >= 0:
            kk = min(cnt + 1, MAX_N)
            new.uur.append(round(v if old is None else old + (v - old) / kk))
            new.n.append(kk)
        else:
            new.uur.append(old)
            new.n.append(cnt)
    new.bt_n = k if af else n
    new.bt_afw = round(f + (abs(bw - bp) - f) / k, 1) if af else f
    new.bt_gem = round(g + (bw - g) / k, 1) if af else g
    new.bt_bw = round((bw if zelfde else 0) + (v if geldig else 0), 1)
    new.bt_bp = round((bp if zelfde else 0) + (p_old if geldig else 0), 1)
    new.bt_bk = (bk if zelfde else 0) + (1 if geldig else 0)
    return new


def reliability(p: Profile) -> int | None:
    """Forecast reliability in % (None while measuring)."""
    if p.bt_n >= 4 and p.bt_gem > 0:
        return int(round(max(0, min(100, 100 * (1 - p.bt_afw / p.bt_gem)))))
    return None


def verdict(pct: int | None) -> str:
    """State of sensor.batterijplan_voorspelling (values kept as in the package: the cards read them)."""
    if pct is None:
        return "nog aan het meten"
    return "uitstekend" if pct >= 85 else "zeer goed" if pct >= 75 else "goed" if pct >= 65 else "redelijk" if pct >= 55 else "wisselvallig"


def colour(dagen: float, pct: int | None) -> str:
    """State of sensor.batterijplan_voorspelling_kleur."""
    if dagen < 7:
        return "grijs1" if dagen < 3 else ("grijs2" if dagen < 5 else "grijs3")
    if pct is None:
        return "grijs3"
    return "groen4" if pct >= 85 else "groen3" if pct >= 75 else "groen2" if pct >= 65 else "groen1" if pct >= 55 else "grijs3"


class StepAverage:
    """Time-weighted step average over a sliding window (statistics ``average_step``, keep_last_sample)."""

    def __init__(self, window: float = 900.0) -> None:
        self.window = window
        self._s: list[tuple[float, float]] = []  # (time, value) from which the value holds

    def add(self, t: float, value: float) -> None:
        self._s.append((t, value))
        cutoff = t - 2 * self.window
        while len(self._s) > 2 and self._s[1][0] < cutoff:
            self._s.pop(0)

    def average(self, now: float) -> float | None:
        if not self._s:
            return None
        start = now - self.window
        total = 0.0
        covered = 0.0
        for i, (t, v) in enumerate(self._s):
            end = self._s[i + 1][0] if i + 1 < len(self._s) else now
            a, b = max(t, start), min(end, now)
            if b > a:
                total += v * (b - a)
                covered += b - a
        if covered <= 0:
            return self._s[-1][1]
        return total / covered
