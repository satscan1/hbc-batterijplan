"""Value counter ("meerwaarde") and contract year (no Home Assistant imports)."""
from __future__ import annotations

from datetime import date


def quarter_value(k_hbc0: float, k_plan0: float, s_hbc0: float, s_plan0: float, pmin_b: float) -> float:
    """Estimated value of one quarter on top of HBC alone, EUR.

    (cost HBC alone - cost plan) + (charge plan - charge HBC at the end of the quarter) x
    lowest purchase price in the plan. An estimate, not a meter reading."""
    return (k_hbc0 - k_plan0) + (s_plan0 - s_hbc0) * pmin_b


def contract_year_start(today: date, contract_start: date | None) -> date:
    """Start of the contract year that contains ``today`` (day and month count, every year starts again)."""
    m, d = (contract_start.month, contract_start.day) if contract_start else (1, 1)
    y = today.year if (today.month, today.day) >= (m, d) else today.year - 1
    try:
        return date(y, m, d)
    except ValueError:  # 29 February
        return date(y, m, 28)
