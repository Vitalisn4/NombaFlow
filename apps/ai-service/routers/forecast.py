from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

class ActiveSubscription(BaseModel):
    subscriptionId: str
    amount: float = Field(ge=0)
    intervalDays: int = Field(gt=0)  # Safe guard: Must be greater than 0
    nextBillingDate: str
    historicalSuccessRate: float = Field(ge=0, le=1)

class ForecastRequest(BaseModel):
    activeSubscriptions: list[ActiveSubscription]
    historicalChurnRateMonthly: float = Field(ge=0, le=1)
    expectedNewSubscriptionsPerMonth: int = Field(ge=0)

@router.post("/forecast")
async def get_forecast(payload: ForecastRequest):
    # Your billing simulation loop logic here
    # (Safe from division-by-zero or infinite loops now!)
    return {"status": "success", "data": []}
