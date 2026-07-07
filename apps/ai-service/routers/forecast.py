"""
Cash flow forecasting.
GET /forecast/{merchantId} — called by NestJS analytics service.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from decimal import Decimal

from db import get_active_subscriptions, get_historical_success_rate, get_at_risk_amount

router = APIRouter()

INTERVAL_DAYS = {
    "DAILY": 1,
    "WEEKLY": 7,
    "MONTHLY": 30,
    "QUARTERLY": 90,
    "ANNUALLY": 365,
}


class ChartDataPoint(BaseModel):
    date: str
    expected: str
    collected: Optional[str] = None


class ForecastResponse(BaseModel):
    merchantId: str
    generatedAt: str
    forecast: dict
    atRiskAmount: str
    chartData: list[ChartDataPoint]


def project_expected_amount(subscriptions, days, success_rate):
    now = datetime.utcnow()
    end_date = now + timedelta(days=days)
    total_expected = 0.0

    for sub in subscriptions:
        interval_days = INTERVAL_DAYS.get(sub["interval"], 30) * (sub["interval_count"] or 1)
        next_billing = sub["next_billing_date"]
        if next_billing is None:
            continue
        if next_billing.tzinfo is not None:
            next_billing = next_billing.replace(tzinfo=None)

        amount = float(sub["amount"]) if isinstance(sub["amount"], Decimal) else sub["amount"]

        current_date = next_billing
        while current_date <= end_date:
            if current_date >= now:
                total_expected += amount * success_rate
            current_date += timedelta(days=max(interval_days, 1))

    return round(total_expected, 2)


@router.get("/forecast/{merchant_id}", response_model=ForecastResponse)
def generate_forecast(merchant_id: str) -> ForecastResponse:
    now = datetime.utcnow()

    try:
        subscriptions = get_active_subscriptions(merchant_id)
        success_rate = get_historical_success_rate(merchant_id)
        at_risk_amount = get_at_risk_amount(merchant_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch forecast data: {str(e)}")

    exp30 = project_expected_amount(subscriptions, 30, success_rate)
    exp60 = project_expected_amount(subscriptions, 60, success_rate)
    exp90 = project_expected_amount(subscriptions, 90, success_rate)

    chart_data = []
    for month_offset in range(3):
        date = now + timedelta(days=30 * month_offset)
        month_start = 30 * month_offset
        month_end = 30 * (month_offset + 1)
        exp_this_month = project_expected_amount(subscriptions, month_end, success_rate) - (
            project_expected_amount(subscriptions, month_start, success_rate) if month_offset > 0 else 0
        )
        chart_data.append(ChartDataPoint(
            date=date.strftime("%Y-%m-%d"),
            expected=f"{exp_this_month:.2f}",
            collected=None,
        ))

    return ForecastResponse(
        merchantId=merchant_id,
        generatedAt=now.isoformat() + "Z",
        forecast={
            "next30Days": f"{exp30:.2f}",
            "next60Days": f"{exp60:.2f}",
            "next90Days": f"{exp90:.2f}",
        },
        atRiskAmount=f"{at_risk_amount:.2f}",
        chartData=chart_data,
    )
