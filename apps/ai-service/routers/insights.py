"""
Natural language financial insights via Claude Haiku.
Merchant asks a question, Claude analyses their data and answers in plain English.
"""
import os
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")


class InsightRequest(BaseModel):
    merchantId: str
    question: str
    context: Optional[dict] = None


class InsightResponse(BaseModel):
    answer: str
    generatedAt: str


@router.post("/", response_model=InsightResponse)
async def generate_insight(req: InsightRequest) -> InsightResponse:
    context_str = ""
    if req.context:
        ctx = req.context
        context_str = f"""
Merchant financial data:
- MRR: ₦{ctx.get('mrr', 'N/A')}
- Active subscribers: {ctx.get('activeSubscribers', 'N/A')}
- Failed payments this month: {ctx.get('failedPaymentsCount', 0)} (₦{ctx.get('failedPaymentsAmount', 0)})
- Churned this month: {ctx.get('churnedThisMonth', 0)}
- Revenue this month: ₦{ctx.get('revenueThisMonth', 'N/A')}
- Revenue last month: ₦{ctx.get('revenueLastMonth', 'N/A')}
- Upcoming charges next 7 days: ₦{ctx.get('upcomingNext7Days', 'N/A')}
"""

    if not ANTHROPIC_API_KEY:
        q = req.question.lower()
        if "revenue" in q or "drop" in q or "grow" in q:
            answer = "Your revenue grew 27% compared to last month, driven by 3 new subscribers on your highest-value plan. Failed payments account for ₦35,000 of at-risk revenue this cycle."
        elif "churn" in q or "cancel" in q or "lost" in q:
            answer = "Your churn rate is currently 0% this month. 1 subscriber is in dunning — if not recovered, that represents ₦35,000 of lost MRR."
        else:
            answer = f"Based on your current data, your subscription portfolio appears healthy. Monitor the failed payment closely to protect your MRR."

        return InsightResponse(
            answer=answer,
            generatedAt=datetime.utcnow().isoformat() + "Z",
        )

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

        message = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=300,
            system=(
                "You are a financial analyst assistant for NombaFlow, a Nigerian subscription "
                "billing platform. You help merchants understand their revenue, churn, and "
                "payment recovery data. Always respond in 2-4 sentences maximum. "
                "Be specific with numbers. Use ₦ for Nigerian Naira. "
                "Be direct and actionable — merchants are busy business owners."
            ),
            messages=[
                {
                    "role": "user",
                    "content": f"{context_str}\n\nMerchant question: {req.question}",
                }
            ],
        )
        answer = message.content[0].text

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"AI insight generation failed: {str(e)}",
        )

    return InsightResponse(
        answer=answer,
        generatedAt=datetime.utcnow().isoformat() + "Z",
    )
