import os
from fastapi import FastAPI, Header, HTTPException

app = FastAPI(title="NombaFlow AI Service")

AI_SERVICE_SECRET = os.getenv("AI_SERVICE_SECRET", "dev-secret-change-me")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.middleware("http")
async def verify_internal_secret(request, call_next):
    if request.url.path == "/health":
        return await call_next(request)
    secret = request.headers.get("X-Internal-Secret")
    if secret != AI_SERVICE_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return await call_next(request)
