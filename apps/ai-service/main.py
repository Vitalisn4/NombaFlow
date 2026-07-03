import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from starlette.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from routers import dunning, churn, forecast, insights

AI_SERVICE_SECRET = os.environ["AI_SERVICE_SECRET"]
IS_PRODUCTION = os.getenv("ENVIRONMENT", "development") == "production"


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("NombaFlow AI Service starting up...")
    yield
    print("NombaFlow AI Service shutting down...")


app = FastAPI(
    title="NombaFlow AI Service",
    description="Internal AI service — smart dunning, churn, forecasting, insights",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if IS_PRODUCTION else "/docs",
    redoc_url=None if IS_PRODUCTION else "/redoc",
    openapi_url=None if IS_PRODUCTION else "/openapi.json",
)


@app.middleware("http")
async def verify_internal_secret(request: Request, call_next):
    if request.url.path == "/health":
        return await call_next(request)
    secret = request.headers.get("X-Internal-Secret")
    if secret != AI_SERVICE_SECRET:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
    return await call_next(request)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(dunning.router, tags=["Dunning"])
app.include_router(churn.router, tags=["Churn"])
app.include_router(forecast.router, tags=["Forecast"])
app.include_router(insights.router, tags=["Insights"])
