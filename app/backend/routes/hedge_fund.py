from fastapi import APIRouter, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from ..utils.errors import TradingError, ValidationError
from ..services.hedge_fund import HedgeFundService
import asyncio
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class AgentModelConfig(BaseModel):
    agent_id: str
    model_name: Optional[str] = None
    model_provider: Optional[str] = None

class HedgeFundRequest(BaseModel):
    tickers: List[str]
    selected_agents: List[str]
    agent_models: Optional[List[AgentModelConfig]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    initial_cash: float = 100000.0
    margin_requirement: float = 0.0

class HedgeFundStatus(BaseModel):
    is_running: bool
    current_portfolio: Dict[str, Any]
    last_update: Optional[str] = None
    active_agents: List[str]
    performance_metrics: Dict[str, float]

@router.post("/run")
async def run_hedge_fund(request: HedgeFundRequest):
    try:
        service = HedgeFundService()
        
        async def event_generator():
            try:
                async for event in service.run(
                    tickers=request.tickers,
                    selected_agents=request.selected_agents,
                    agent_models=request.agent_models,
                    initial_cash=request.initial_cash,
                    margin_requirement=request.margin_requirement
                ):
                    if isinstance(event, dict):
                        yield {
                            "event": "progress",
                            "data": event
                        }
                    else:
                        logger.warning(f"Unexpected event type: {type(event)}")
                
                yield {
                    "event": "complete",
                    "data": {"status": "completed"}
                }
                
            except Exception as e:
                logger.error(f"Error in event generator: {str(e)}")
                yield {
                    "event": "error",
                    "data": {"error": str(e)}
                }
                
        return EventSourceResponse(event_generator())
        
    except ValidationError as e:
        raise e
    except Exception as e:
        logger.error(f"Error running hedge fund: {str(e)}")
        raise TradingError(message=str(e))

@router.get("/status", response_model=HedgeFundStatus)
async def get_status():
    try:
        service = HedgeFundService()
        status = await service.get_status()
        return status
    except Exception as e:
        logger.error(f"Error getting status: {str(e)}")
        raise TradingError(message=str(e))

@router.post("/stop")
async def stop_hedge_fund():
    try:
        service = HedgeFundService()
        await service.stop()
        return {"status": "stopped"}
    except Exception as e:
        logger.error(f"Error stopping hedge fund: {str(e)}")
        raise TradingError(message=str(e))
