import os
from fastapi import FastAPI

app = FastAPI(title="NombaFlow AI Service")

AI_SERVICE_SECRET = os.getenv("AI_SERVICE_SECRET", "").strip()
if not AI_SERVICE_SECRET:
    raise RuntimeError("AI_SERVICE_SECRET environment variable is missing or empty!")

@app.get("/health")
def health_check():
    return {"status": "healthy"}
