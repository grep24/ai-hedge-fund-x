from typing import List, Optional, Dict, Any, AsyncGenerator
import asyncio
import logging
from datetime import datetime, timedelta
from ..utils.errors import ValidationError, ServiceError
from ..models.portfolio import Portfolio
from ..models.agent import Agent
from src.tools.api import (
    get_prices,
    get_financial_metrics,
    get_market_cap,
    get_insider_trades,
    get_company_news
)

logger = logging.getLogger(__name__)

class HedgeFundService:
    def __init__(self):
        self._running = False
        self._portfolio: Optional[Portfolio] = None
        self._agents: List[Agent] = []
        self._last_update: Optional[datetime] = None
        self._performance_metrics: Dict[str, float] = {}

    async def run(
        self,
        tickers: List[str],
        selected_agents: List[str],
        agent_models: Optional[List[Dict[str, Any]]] = None,
        initial_cash: float = 100000.0,
        margin_requirement: float = 0.0
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """运行对冲基金策略"""
        try:
            # 验证输入
            if not tickers:
                raise ValidationError("No tickers provided")
            if not selected_agents:
                raise ValidationError("No agents selected")

            # 初始化组合
            self._portfolio = Portfolio(
                initial_cash=initial_cash,
                margin_requirement=margin_requirement,
                tickers=tickers
            )

            # 初始化代理
            self._agents = [
                Agent(agent_id=agent_id, model_config=self._get_agent_model_config(agent_id, agent_models))
                for agent_id in selected_agents
            ]

            # 标记为运行状态
            self._running = True
            self._last_update = datetime.now()

            # 开始运行策略
            while self._running:
                try:
                    # 获取市场数据
                    market_data = await self._fetch_market_data(tickers)

                    # 每个代理分析市场
                    for agent in self._agents:
                        analysis = await agent.analyze_market(market_data)
                        
                        # 生成事件
                        yield {
                            "type": "analysis",
                            "agent_id": agent.id,
                            "analysis": analysis
                        }

                    # 更新组合
                    portfolio_update = await self._update_portfolio(market_data)
                    
                    # 生成事件
                    yield {
                        "type": "portfolio_update",
                        "portfolio": portfolio_update
                    }

                    # 更新性能指标
                    self._update_performance_metrics()

                    # 更新时间戳
                    self._last_update = datetime.now()

                    # 等待下一个周期
                    await asyncio.sleep(5)  # 可配置的更新间隔

                except Exception as e:
                    logger.error(f"Error in hedge fund run loop: {str(e)}")
                    yield {
                        "type": "error",
                        "error": str(e)
                    }

        except Exception as e:
            logger.error(f"Error in hedge fund run: {str(e)}")
            raise ServiceError(str(e))
        finally:
            self._running = False

    async def stop(self) -> None:
        """停止对冲基金策略"""
        self._running = False

    async def get_status(self) -> Dict[str, Any]:
        """获取当前状态"""
        return {
            "is_running": self._running,
            "current_portfolio": self._portfolio.to_dict() if self._portfolio else {},
            "last_update": self._last_update.isoformat() if self._last_update else None,
            "active_agents": [agent.id for agent in self._agents],
            "performance_metrics": self._performance_metrics
        }

    def _get_agent_model_config(
        self,
        agent_id: str,
        agent_models: Optional[List[Dict[str, Any]]]
    ) -> Optional[Dict[str, Any]]:
        """获取代理的模型配置"""
        if not agent_models:
            return None
        
        for config in agent_models:
            if config["agent_id"] == agent_id:
                return {
                    "model_name": config.get("model_name"),
                    "model_provider": config.get("model_provider")
                }
        return None

    async def _fetch_market_data(self, tickers: List[str]) -> Dict[str, Any]:
        """获取市场数据"""
        try:
            # 获取当前日期和一年前的日期
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            
            # 格式化日期
            end_date_str = end_date.strftime("%Y-%m-%d")
            start_date_str = start_date.strftime("%Y-%m-%d")

            market_data = {}
            for ticker in tickers:
                # 获取价格数据
                prices = get_prices(ticker, start_date_str, end_date_str)
                
                # 获取财务指标
                metrics = get_financial_metrics(ticker, end_date_str, period="ttm", limit=4)
                
                # 获取市值
                market_cap = get_market_cap(ticker, end_date_str)
                
                # 获取内部交易数据
                insider_trades = get_insider_trades(
                    ticker, 
                    end_date=end_date_str, 
                    start_date=start_date_str
                )
                
                # 获取公司新闻
                news = get_company_news(
                    ticker, 
                    end_date=end_date_str, 
                    start_date=start_date_str
                )

                # 整合数据
                market_data[ticker] = {
                    "prices": [p.model_dump() for p in prices],
                    "metrics": [m.model_dump() for m in metrics] if metrics else [],
                    "market_cap": market_cap,
                    "insider_trades": [t.model_dump() for t in insider_trades],
                    "news": [n.model_dump() for n in news],
                    "last_update": end_date.isoformat()
                }

            return market_data

        except Exception as e:
            logger.error(f"Error fetching market data: {str(e)}")
            raise ServiceError(f"Failed to fetch market data: {str(e)}")

    async def _update_portfolio(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """更新投资组合"""
        if not self._portfolio:
            raise ServiceError("Portfolio not initialized")
        
        try:
            # 更新每个股票的当前价格
            price_updates = {}
            for ticker, data in market_data.items():
                if data["prices"]:
                    latest_price = data["prices"][-1]["close"]
                    price_updates[ticker] = latest_price

            # 更新投资组合价格
            self._portfolio.update_prices(price_updates)
            
            return self._portfolio.to_dict()

        except Exception as e:
            logger.error(f"Error updating portfolio: {str(e)}")
            raise ServiceError(f"Failed to update portfolio: {str(e)}")

    def _update_performance_metrics(self) -> None:
        """更新性能指标"""
        if not self._portfolio:
            return

        try:
            # 计算性能指标
            total_value = self._portfolio.total_value
            initial_value = self._portfolio.cash  # 初始资金

            # 计算总收益率
            total_return = (total_value - initial_value) / initial_value

            # 计算夏普比率（简化版本，使用无风险利率 = 0.02）
            risk_free_rate = 0.02
            if len(self._portfolio.trades) > 1:
                returns = []
                for i in range(1, len(self._portfolio.trades)):
                    prev_trade = self._portfolio.trades[i-1]
                    curr_trade = self._portfolio.trades[i]
                    returns.append(
                        (float(curr_trade["value"]) - float(prev_trade["value"])) 
                        / float(prev_trade["value"])
                    )
                if returns:
                    import statistics
                    avg_return = statistics.mean(returns)
                    std_dev = statistics.stdev(returns) if len(returns) > 1 else 0
                    sharpe_ratio = (avg_return - risk_free_rate) / std_dev if std_dev > 0 else 0
                else:
                    sharpe_ratio = 0
            else:
                sharpe_ratio = 0

            # 计算最大回撤
            max_drawdown = 0
            peak_value = initial_value
            for trade in self._portfolio.trades:
                trade_value = float(trade["value"])
                if trade_value > peak_value:
                    peak_value = trade_value
                else:
                    drawdown = (peak_value - trade_value) / peak_value
                    max_drawdown = max(max_drawdown, drawdown)

            # 更新指标
            self._performance_metrics = {
                "total_return": float(total_return),
                "sharpe_ratio": float(sharpe_ratio),
                "max_drawdown": float(max_drawdown)
            }
        except Exception as e:
            logger.error(f"Error updating performance metrics: {str(e)}")
            raise ServiceError(f"Failed to update performance metrics: {str(e)}") 