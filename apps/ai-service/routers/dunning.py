"""
Smart retry prediction for failed payments.
Uses a trained LightGBM model to recommend optimal retry time.
Falls back to a rule-based 72-hour window for customers with <3 payment history events.
"""
import os
import joblib
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "dunning_model.pkl")

_model_bundle = None


def get_model_bundle():
    global _model_bundle
    if _model_bundle is None:
        _model_bundle = joblib.load(MODEL_PATH)
    return _model_bundle


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


FAILURE_REASON_LABELS = {
    "insufficient_funds": "insufficient funds",
    "card_declined": "a declined card",
    "do_not_honour": "the bank declining the transaction",
    "expired_card": "an expired card",
}


def parse_hour(dt_str: str) -> Optional[int]:
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00")).hour
    except Exception:
        return None


def parse_day_of_week(dt_str: str) -> Optional[int]:
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00")).weekday()
    except Exception:
        return None


def parse_day_of_month(dt_str: str) -> Optional[int]:
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00")).day
    except Exception:
        return None


@router.post("/predict-retry", response_model=DunningResponse)
def recommend_retry(req: DunningRequest) -> DunningResponse:
    successful = [p for p in req.paymentHistory if p.status == "SUCCESS"]
    now = datetime.utcnow()
    failure_label = FAILURE_REASON_LABELS.get(req.failureCode, "a payment failure")

    # Fallback: fewer than 3 historical payments -> default 72-hour retry
    if len(req.paymentHistory) < 3:
        retry_at = now + timedelta(hours=72)
        return DunningResponse(
            recommendedRetryAt=retry_at.isoformat() + "Z",
            confidenceScore=0.3,
            reasoning=(
                f"This customer has limited payment history, so we're using a standard "
                f"72-hour retry window following {failure_label}."
            ),
        )

    days_of_week = [parse_day_of_week(p.chargedAt) for p in successful if parse_day_of_week(p.chargedAt) is not None]
    days_of_month = [parse_day_of_month(p.chargedAt) for p in successful if parse_day_of_month(p.chargedAt) is not None]
    hours = [parse_hour(p.chargedAt) for p in successful if parse_hour(p.chargedAt) is not None]

    avg_day_of_week = round(sum(days_of_week) / len(days_of_week)) if days_of_week else 0
    avg_day_of_month = round(sum(days_of_month) / len(days_of_month)) if days_of_month else 1
    avg_hour = round(sum(hours) / len(hours)) if hours else 10

    total_attempts = len(req.paymentHistory)
    retry_success_history = round(len(successful) / total_attempts, 2) if total_attempts else 0.0

    last_success_dates = [
        datetime.fromisoformat(p.chargedAt.replace("Z", "+00:00")).replace(tzinfo=None)
        for p in successful
    ]
    time_since_last_success_days = (now - max(last_success_dates)).days if last_success_dates else 90

    bundle = get_model_bundle()
    model = bundle["model"]
    failure_reason_map = bundle["failure_reason_map"]
    failure_reason_encoded = failure_reason_map.get(req.failureCode, 1)

    features = [[
        avg_day_of_week,
        avg_day_of_month,
        failure_reason_encoded,
        retry_success_history,
        time_since_last_success_days,
    ]]

    predicted_offset_hours = float(model.predict(features)[0])
    predicted_offset_hours = max(6.0, predicted_offset_hours)

    retry_at = now + timedelta(hours=predicted_offset_hours)
    retry_at = retry_at.replace(hour=avg_hour, minute=0, second=0, microsecond=0)
    if retry_at <= now:
        retry_at += timedelta(days=1)

    confidence = round(0.5 + (retry_success_history * 0.4), 2)

    day_suffix = "th" if 4 <= avg_day_of_month % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(avg_day_of_month % 10, "th")
    reasoning = (
        f"Based on {total_attempts} past payment attempt(s) with a "
        f"{int(retry_success_history * 100)}% success rate, and prior successful charges "
        f"clustering around the {avg_day_of_month}{day_suffix} of the month at "
        f"approximately {avg_hour:02d}:00, we recommend retrying in about "
        f"{round(predicted_offset_hours)} hour(s) following {failure_label}."
    )

    return DunningResponse(
        recommendedRetryAt=retry_at.isoformat() + "Z",
        confidenceScore=confidence,
        reasoning=reasoning,
    )
