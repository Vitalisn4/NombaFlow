import os
import logging
from fastapi import APIRouter, HTTPException
from anthropic import AsyncAnthropic

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate")
async def generate_insight():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Anthropic API key not configured")
        
    client = AsyncAnthropic(api_key=api_key)
    
    try:
        response = await client.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=1024,
            messages=[{"role": "user", "content": "Generate system performance insights."}]
        )
        return {"insight": response.content[0].text}
    except Exception as e:
        logger.exception("Anthropic insight generation failed")
        raise HTTPException(status_code=502, detail="Failed to generate insight")
