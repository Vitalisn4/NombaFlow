"""
Cash flow forecasting.
GET /forecast/:merchantId — called by NestJS analytics service.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()


class ActiveSubscription(BaseModel):
    subscriptionId: str
    amount: float
    intervalDays: int
    nextBillingDate: str
    historicalSuccessRate: float


class ForecastRequest(BaseModel):
    activeSubscriptions: list[ActiveSubscription]
    historicalChurnRateMonthly: float
    expectedNewSubscriptionsPerMonth: int


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


def project_collections(
    subscriptions: list[ActiveSubscription],
    days: int,
    churn_rate_monthly: float,
    new_subs_per_month: int,
) -> tuple[float, float]:
    now = datetime.utcnow()
    end_date = now + timedelta(days=days)
    total_expected = 0.0
    total_risk_adjusted = 0.0

    for sub in subscriptions:
        try:
            next_billing = datetime.fromisoformat(
                sub.nextBillingDate.replace("Z", "+00:00")
            ).replace(tzinfo=None)
        except Exception:
            continue

        current_date = next_billing
        while current_date <= end_date:
            month_index = max(0, (current_date - now).days // 30)
            survival_rate = (1 - churn_rate_monthly) ** month_index
            charge_expected = sub.amount * survival_rate
            charge_risk_adjusted = charge_expected * sub.historicalSuccessRate
            total_expected += charge_expected
            total_risk_adjusted += charge_risk_adjusted
            current_date += timedelta(days=sub.intervalDays)

    if subscriptions:
        avg_amount = sum(s.amount for s in subscriptions) / len(subscriptions)
        avg_interval = sum(s.intervalDays for s in subscriptions) / len(subscriptions)
        for month in range(days // 30):
            subs_by_month = new_subs_per_month * (month + 1)
            charges_per_sub = max(1, int((days - month * 30) // avg_interval))
            new_rev = subs_by_month * avg_amount * charges_per_sub * 0.85
            total_expected += new_rev
            total_risk_adjusted += new_rev * 0.80

    return round(total_expected, 2), round(total_risk_adjusted, 2)


@router.get("/forecast/{merchant_id}", response_model=ForecastResponse)
def generate_forecast(merchant_id: str, req: ForecastRequest) -> ForecastResponse:
    now = datetime.utcnow()

    exp30, risk30 = project_collections(
        req.activeSubscriptions, 30,
        req.historicalChurnRateMonthly, req.expectedNewSubscriptionsPerMonth,
    )
    exp60, risk60 = project_collections(
        req.activeSubscriptions, 60,
        req.historicalChurnRateMonthly, req.expectedNewSubscriptionsPerMonth,
    )
    exp90, risk90 = project_collections(
        req.activeSubscriptions, 90,
        req.historicalChurnRateMonthly, req.expectedNewSubscriptionsPerMonth,
    )

    at_risk = round(exp30 - risk30, 2)

    # Chart data — collected is null for future months (no fabricated data)
    chart_data = []
    for month_offset in range(4):
        date = now + timedelta(days=30 * month_offset)
        exp, _ = project_collections(
            req.activeSubscriptions,
            30 * (month_offset + 1),
            req.historicalChurnRateMonthly,
            req.expectedNewSubscriptionsPerMonth,
        )
        chart_data.append(ChartDataPoint(
            date=date.strftime("%Y-%m-%d"),
            expected=f"{exp:.2f}",
            collected=None,  # only populated with real DB data by backend
        ))

    return ForecastResponse(
        merchantId=merchant_id,
        generatedAt=now.isoformat() + "Z",
        forecast={
            "next30Days": f"{exp30:.2f}",
            "next60Days": f"{exp60:.2f}",
            "next90Days": f"{exp90:.2f}",
        },
        atRiskAmount=f"{at_risk:.2f}",
        chartData=chart_data,
    )
