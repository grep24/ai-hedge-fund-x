from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json
import sys
import os
import datetime

router = APIRouter()


@router.get("/")
async def health_check():
    """
    详细的健康检查端点
    """
    return {
        "status": "healthy",
        "service": "ai-hedge-fund-api",
        "version": "0.1.0",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "python_version": sys.version,
        "environment": os.getenv("ENVIRONMENT", "production")
    }


@router.get("/ping")
async def ping():
    async def event_generator():
        for i in range(5):
            # Create a JSON object for each ping
            data = {"ping": f"ping {i+1}/5", "timestamp": i + 1}

            # Format as SSE
            yield f"data: {json.dumps(data)}\n\n"

            # Wait 1 second
            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
