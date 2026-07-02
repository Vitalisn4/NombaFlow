"""
Smart retry prediction for failed payments.
Uses payment history patterns to recommend optimal retry time.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="")


class PaymentHistoryItem(BaseModel):
    chargedAt: str
    status: str


class DunningRequest(BaseModel):
    customerId: str
    subscriptionId: str
    failureCode: str
    failedAt: str
    paymentHistory: list[PaymentHistoryItem]


class DunningResponse(BaseModel):
    recommendedRetryAt: str
    confidenceScore: float
    reasoning: str


def parse_hour(dt_str: str) -> Optional[int]:
    try:
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        return dt.hour
    except Exception:
        return None


def parse_day_of_month(dt_str: str) -> Optional[int]:
    try:
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        return dt.day
    except Exception:
        return None


@router.post("/predict-retry", response_model=DunningResponse)
def recommend_retry(req: DunningRequest) -> DunningResponse:
    successful = [p for p in req.paymentHistory if p.status == "SUCCESS"]
    now = datetime.utcnow()

    if len(successful) < 2:
        retry_at = now + timedelta(hours=72)
        return DunningResponse(
            recommendedRetryAt=retry_at.isoformat() + "Z",
            confidenceScore=0.30,
            reasoning=(
                "Insufficient payment history for this customer. "
                "Using default 72-hour retry window."
            ),
        )

    hours = [parse_hour(p.chargedAt) for p in successful if parse_hour(p.chargedAt) is not None]
    days = [parse_day_of_month(p.chargedAt) for p in successful if parse_day_of_month(p.chargedAt) is not None]

    avg_hour = int(sum(hours) / len(hours)) if hours else 10
    avg_day = int(sum(days) / len(days)) if days else 1

    if req.failureCode == "insufficient_funds":
        days_until_retry = 2 if avg_day <= 5 else 1
        retry_at = now + timedelta(days=days_until_retry)
        retry_at = retry_at.replace(hour=avg_hour, minute=0, second=0, microsecond=0)
        confidence = 0.71
        suffix = "st" if avg_day == 1 else "nd" if avg_day == 2 else "rd" if avg_day == 3 else "th"
        reasoning = (
            f"Customer's previous successful charges cluster around the "
            f"{avg_day}{suffix} of the month at approximately {avg_hour:02d}:00. "
            f"Retrying in {days_until_retry} day(s) to align with likely salary credit window."
        )
    elif req.failureCode in ["card_declined", "do_not_honour"]:
        retry_at = now + timedelta(hours=24)
        retry_at = retry_at.replace(hour=avg_hour, minute=0, second=0, microsecond=0)
        confidence = 0.55
        reasoning = (
            "Card was declined — possibly a temporary bank hold. "
            "Retrying after 24 hours at the customer's usual payment time."
        )
    elif req.failureCode == "expired_card":
        retry_at = now + timedelta(hours=168)
        confidence = 0.20
        reasoning = (
            "Card has expired. Customer must update their card details via the payment portal."
        )
    else:
        retry_at = now + timedelta(hours=48)
        retry_at = retry_at.replace(hour=avg_hour, minute=0, second=0, microsecond=0)
        confidence = 0.50
        reasoning = (
            f"Generic payment failure. Retrying in 48 hours at "
            f"{avg_hour:02d}:00, aligned with customer's historical payment time."
        )

    return DunningResponse(
        recommendedRetryAt=retry_at.isoformat() + "Z",
        confidenceScore=confidence,
        reasoning=reasoning,
    )
