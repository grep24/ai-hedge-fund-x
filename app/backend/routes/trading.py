from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import sys
import os

# 添加项目根目录到Python路径
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.append(root_dir)

from src.main import run_hedge_fund
from src.backtester import Backtester

router = APIRouter()

class TradingRequest(BaseModel):
    tickers: List[str]
    show_reasoning: bool = True

class BacktestRequest(BaseModel):
    tickers: List[str]
    start_date: str
    end_date: str
    initial_cash: float = 100000.0
    margin_requirement: float = 0.0
    use_ollama: bool = False

class AnalystSignal(BaseModel):
    name: str
    reasoning: str
    score: float
    recommendation: str

class TradingDecision(BaseModel):
    portfolio: Dict[str, Any]
    trades: List[Dict[str, Any]]

class TradingResponse(BaseModel):
    decisions: TradingDecision
    analyst_signals: Dict[str, AnalystSignal]

@router.post("/simulate", response_model=TradingResponse)
async def simulate_trading(request: TradingRequest):
    try:
        result = run_hedge_fund(
            tickers=request.tickers,
            portfolio={"cash": 100000.0, "margin_requirement": 0.0},
            show_reasoning=request.show_reasoning,
            model_name="gpt-4",
            model_provider="OpenAI"
        )
        
        # 转换结果格式
        formatted_result = {
            "decisions": {
                "portfolio": result["decisions"].get("portfolio", {}),
                "trades": result["decisions"].get("trades", [])
            },
            "analyst_signals": {}
        }
        
        # 格式化分析师信号
        for name, signal in result["analyst_signals"].items():
            formatted_result["analyst_signals"][name] = {
                "name": name,
                "reasoning": signal.get("reasoning", ""),
                "score": signal.get("score", 0.0),
                "recommendation": signal.get("recommendation", "HOLD")
            }
        
        return formatted_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/backtest")
async def run_backtest_endpoint(request: BacktestRequest):
    try:
        # 创建Backtester实例
        backtester = Backtester(
            agent=run_hedge_fund,
            tickers=request.tickers,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_capital=request.initial_cash,
            initial_margin_requirement=request.margin_requirement,
            model_name="gpt-4o" if not request.use_ollama else "llama2",
            model_provider="OpenAI" if not request.use_ollama else "Ollama"
        )
        
        # 运行回测
        backtester.prefetch_data()  # 预加载数据
        result = backtester.run_backtest()  # 执行回测
        
        # 分析性能
        performance = backtester.analyze_performance()
        
        # 合并结果
        return {
            "backtest_results": result,
            "performance_metrics": performance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 