"""
Cash flow forecasting.
Projects expected collections for next 30, 60, 90 days.
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
    merchantId: str
    activeSubscriptions: list[ActiveSubscription]
    historicalChurnRateMonthly: float
    expectedNewSubscriptionsPerMonth: int


class ForecastPeriod(BaseModel):
    expected: float
    riskAdjusted: float
    atRisk: float


class ChartDataPoint(BaseModel):
    date: str
    expected: float
    collected: Optional[float] = None


class ForecastResponse(BaseModel):
    merchantId: str
    generatedAt: str
    next30Days: ForecastPeriod
    next60Days: ForecastPeriod
    next90Days: ForecastPeriod
    chartData: list[ChartDataPoint]


def project_collections(
    subscriptions: list[ActiveSubscription],
    days: int,
    churn_rate_monthly: float,
    new_subs_per_month: int,
) -> tuple[float, float, float]:
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
            month_index = (current_date - now).days // 30
            survival_rate = (1 - churn_rate_monthly) ** month_index
            charge_expected = sub.amount * survival_rate
            charge_risk_adjusted = charge_expected * sub.historicalSuccessRate
            total_expected += charge_expected
            total_risk_adjusted += charge_risk_adjusted
            current_date += timedelta(days=sub.intervalDays)

    if subscriptions:
        avg_amount = sum(s.amount for s in subscriptions) / len(subscriptions)
        avg_interval = sum(s.intervalDays for s in subscriptions) / len(subscriptions)
        new_sub_revenue = 0.0
        for month in range(days // 30):
            subs_by_month = new_subs_per_month * (month + 1)
            charges_per_sub = max(1, (days - month * 30) // avg_interval)
            new_sub_revenue += subs_by_month * avg_amount * charges_per_sub * 0.85
        total_expected += new_sub_revenue
        total_risk_adjusted += new_sub_revenue * 0.80

    at_risk = total_expected - total_risk_adjusted
    return round(total_expected, 2), round(total_risk_adjusted, 2), round(at_risk, 2)


@router.post("/", response_model=ForecastResponse)
def generate_forecast(req: ForecastRequest) -> ForecastResponse:
    now = datetime.utcnow()

    exp30, risk30, atrisk30 = project_collections(
        req.activeSubscriptions, 30,
        req.historicalChurnRateMonthly,
        req.expectedNewSubscriptionsPerMonth,
    )
    exp60, risk60, atrisk60 = project_collections(
        req.activeSubscriptions, 60,
        req.historicalChurnRateMonthly,
        req.expectedNewSubscriptionsPerMonth,
    )
    exp90, risk90, atrisk90 = project_collections(
        req.activeSubscriptions, 90,
        req.historicalChurnRateMonthly,
        req.expectedNewSubscriptionsPerMonth,
    )

    chart_data = []
    for month_offset in range(4):
        date = now + timedelta(days=30 * month_offset)
        exp, risk, _ = project_collections(
            req.activeSubscriptions,
            30 * (month_offset + 1),
            req.historicalChurnRateMonthly,
            req.expectedNewSubscriptionsPerMonth,
        )
        chart_data.append(ChartDataPoint(
            date=date.strftime("%Y-%m-%d"),
            expected=exp,
            collected=exp * 0.92 if month_offset == 0 else None,
        ))

    return ForecastResponse(
        merchantId=req.merchantId,
        generatedAt=now.isoformat() + "Z",
        next30Days=ForecastPeriod(expected=exp30, riskAdjusted=risk30, atRisk=atrisk30),
        next60Days=ForecastPeriod(expected=exp60, riskAdjusted=risk60, atRisk=atrisk60),
        next90Days=ForecastPeriod(expected=exp90, riskAdjusted=risk90, atRisk=atrisk90),
        chartData=chart_data,
    )
