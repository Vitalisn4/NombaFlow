"""
Churn probability scoring.
POST /churn-score — called by NestJS subscription service.
"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChurnRequest(BaseModel):
    subscriptionId: str
    customerId: str
    subscriptionAgeDays: int
    consecutiveFailedCharges: int
    daysSinceLastSuccess: int
    planPriceTier: str  # LOW, MID, HIGH
    portalLoginsLast30Days: int
    paymentMethodUpdatedRecently: bool
    totalCyclesCompleted: int


class ChurnResponse(BaseModel):
    subscriptionId: str
    customerId: str
    churnProbability: float  # 0.0 - 1.0
    riskLevel: str  # LOW, MEDIUM, HIGH, CRITICAL
    topRiskFactors: list[str]
    recommendedAction: str


@router.post("/churn-score", response_model=ChurnResponse)
def score_churn(req: ChurnRequest) -> ChurnResponse:
    score = 0.0
    risk_factors = []

    if req.consecutiveFailedCharges >= 3:
        score += 0.40
        risk_factors.append(f"{req.consecutiveFailedCharges} consecutive failed charges")
    elif req.consecutiveFailedCharges == 2:
        score += 0.25
        risk_factors.append("2 consecutive failed charges")
    elif req.consecutiveFailedCharges == 1:
        score += 0.10
        risk_factors.append("1 recent failed charge")

    if req.daysSinceLastSuccess > 60:
        score += 0.25
        risk_factors.append(f"No successful payment in {req.daysSinceLastSuccess} days")
    elif req.daysSinceLastSuccess > 30:
        score += 0.15
        risk_factors.append(f"Last successful payment was {req.daysSinceLastSuccess} days ago")

    if req.portalLoginsLast30Days == 0 and req.subscriptionAgeDays > 30:
        score += 0.10
        risk_factors.append("No portal activity in 30 days")

    if req.subscriptionAgeDays < 60 and req.consecutiveFailedCharges >= 1:
        score += 0.15
        risk_factors.append("Early-stage subscription with payment failure")

    if req.consecutiveFailedCharges >= 2 and not req.paymentMethodUpdatedRecently:
        score += 0.10
        risk_factors.append("Card not updated despite recent failures")
    elif req.paymentMethodUpdatedRecently:
        score -= 0.10

    if req.planPriceTier == "HIGH" and req.consecutiveFailedCharges >= 1:
        score += 0.05
        risk_factors.append("High-value plan with payment difficulty")

    if req.totalCyclesCompleted >= 6:
        score -= 0.08
    if req.totalCyclesCompleted >= 12:
        score -= 0.05

    score = max(0.0, min(1.0, score))

    if score >= 0.75:
        risk_level = "CRITICAL"
        action = "Immediate intervention required. Contact customer directly, offer a payment plan or temporary pause."
    elif score >= 0.50:
        risk_level = "HIGH"
        action = "Send a personalised payment reminder with a direct link to update card details."
    elif score >= 0.25:
        risk_level = "MEDIUM"
        action = "Monitor closely. Send a soft reminder about the upcoming charge."
    else:
        risk_level = "LOW"
        action = "No action needed. Customer is in good standing."

    return ChurnResponse(
        subscriptionId=req.subscriptionId,
        customerId=req.customerId,
        churnProbability=round(score, 2),
        riskLevel=risk_level,
        topRiskFactors=risk_factors[:3],
        recommendedAction=action,
    )
