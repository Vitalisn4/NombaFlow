import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import dunning, churn, forecast, insights

AI_SERVICE_SECRET = os.getenv("AI_SERVICE_SECRET", "dev-secret-change-me")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("NombaFlow AI Service starting up...")
    yield
    print("NombaFlow AI Service shutting down...")


app = FastAPI(
    title="NombaFlow AI Service",
    description="Smart dunning, churn prediction, cash flow forecasting, and NL insights",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def verify_internal_secret(request: Request, call_next):
    if request.url.path in ["/health", "/docs", "/openapi.json"]:
        return await call_next(request)
    secret = request.headers.get("X-Internal-Secret")
    if secret != AI_SERVICE_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return await call_next(request)


@app.get("/health")
def health():
    return {"status": "ok", "service": "nombaflow-ai"}


app.include_router(dunning.router, prefix="/ai/dunning", tags=["Dunning"])
app.include_router(churn.router, prefix="/ai/churn", tags=["Churn"])
app.include_router(forecast.router, prefix="/ai/forecast", tags=["Forecast"])
app.include_router(insights.router, prefix="/ai/insights", tags=["Insights"])
