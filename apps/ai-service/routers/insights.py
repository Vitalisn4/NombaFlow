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


@router.post("/insights/ask", response_model=InsightResponse)
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
        ctx = req.context or {}
        mrr = ctx.get('mrr', 'N/A')
        failed_count = ctx.get('failedPaymentsCount', 0)
        failed_amount = ctx.get('failedPaymentsAmount', 0)
        churned = ctx.get('churnedThisMonth', 0)
        q = req.question.lower()
        if "revenue" in q or "drop" in q or "grow" in q:
            answer = f"[demo mode] Your current MRR is ₦{mrr}. You have {failed_count} failed payment(s) totalling ₦{failed_amount} at risk this cycle."
        elif "churn" in q or "cancel" in q or "lost" in q:
            answer = f"[demo mode] {churned} subscriber(s) churned this month. Monitor dunning closely to reduce future churn."
        else:
            answer = f"[demo mode] MRR: ₦{mrr} | Failed payments: {failed_count} | Churned: {churned}."
        return InsightResponse(answer=answer, generatedAt=datetime.utcnow().isoformat() + "Z")

    try:
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
        message = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            system=(
                "You are a financial analyst assistant for NombaFlow, a Nigerian subscription "
                "billing platform. Always respond in 2-4 sentences. Use ₦ for Naira. Be direct."
            ),
            messages=[{"role": "user", "content": f"{context_str}\n\nMerchant question: {req.question}"}],
        )
        answer = message.content[0].text
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI insight generation failed: {str(e)}")

    return InsightResponse(answer=answer, generatedAt=datetime.utcnow().isoformat() + "Z")
