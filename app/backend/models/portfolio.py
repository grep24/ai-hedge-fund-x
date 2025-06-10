from typing import List, Dict, Any
from decimal import Decimal
from datetime import datetime

class Position:
    def __init__(
        self,
        ticker: str,
        quantity: int = 0,
        average_price: float = 0.0,
        current_price: float = 0.0
    ):
        self.ticker = ticker
        self.quantity = quantity
        self.average_price = Decimal(str(average_price))
        self.current_price = Decimal(str(current_price))

    @property
    def market_value(self) -> Decimal:
        return Decimal(str(self.quantity)) * self.current_price

    @property
    def unrealized_pnl(self) -> Decimal:
        return self.market_value - (Decimal(str(self.quantity)) * self.average_price)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ticker": self.ticker,
            "quantity": self.quantity,
            "average_price": float(self.average_price),
            "current_price": float(self.current_price),
            "market_value": float(self.market_value),
            "unrealized_pnl": float(self.unrealized_pnl)
        }

class Portfolio:
    def __init__(
        self,
        initial_cash: float,
        margin_requirement: float,
        tickers: List[str]
    ):
        self.cash = Decimal(str(initial_cash))
        self.margin_requirement = Decimal(str(margin_requirement))
        self.positions: Dict[str, Position] = {
            ticker: Position(ticker=ticker)
            for ticker in tickers
        }
        self.trades: List[Dict[str, Any]] = []
        self.created_at = datetime.now()
        self.last_updated = datetime.now()

    @property
    def total_market_value(self) -> Decimal:
        return sum(position.market_value for position in self.positions.values())

    @property
    def total_unrealized_pnl(self) -> Decimal:
        return sum(position.unrealized_pnl for position in self.positions.values())

    @property
    def total_value(self) -> Decimal:
        return self.cash + self.total_market_value

    @property
    def margin_used(self) -> Decimal:
        return self.total_market_value * self.margin_requirement

    @property
    def available_margin(self) -> Decimal:
        return self.cash - self.margin_used

    def can_trade(self, ticker: str, quantity: int, price: float) -> bool:
        """检查是否可以执行交易"""
        cost = Decimal(str(quantity)) * Decimal(str(price))
        
        if quantity > 0:  # 买入
            return cost <= self.available_margin
        else:  # 卖出
            position = self.positions.get(ticker)
            return position and abs(quantity) <= position.quantity

    def execute_trade(
        self,
        ticker: str,
        quantity: int,
        price: float,
        timestamp: datetime = None
    ) -> None:
        """执行交易"""
        if not self.can_trade(ticker, quantity, price):
            raise ValueError("Insufficient funds or position for trade")

        position = self.positions[ticker]
        trade_cost = Decimal(str(quantity)) * Decimal(str(price))

        # 更新持仓
        if quantity > 0:  # 买入
            new_total = position.quantity + quantity
            position.average_price = (
                (position.average_price * Decimal(str(position.quantity)) + trade_cost)
                / Decimal(str(new_total))
            )
            position.quantity = new_total
        else:  # 卖出
            position.quantity += quantity

        # 更新现金
        self.cash -= trade_cost

        # 记录交易
        self.trades.append({
            "ticker": ticker,
            "quantity": quantity,
            "price": float(price),
            "timestamp": timestamp or datetime.now(),
            "value": float(trade_cost)
        })

        self.last_updated = datetime.now()

    def update_prices(self, price_updates: Dict[str, float]) -> None:
        """更新当前价格"""
        for ticker, price in price_updates.items():
            if ticker in self.positions:
                self.positions[ticker].current_price = Decimal(str(price))
        self.last_updated = datetime.now()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "cash": float(self.cash),
            "total_value": float(self.total_value),
            "total_market_value": float(self.total_market_value),
            "total_unrealized_pnl": float(self.total_unrealized_pnl),
            "margin_used": float(self.margin_used),
            "available_margin": float(self.available_margin),
            "positions": {
                ticker: position.to_dict()
                for ticker, position in self.positions.items()
            },
            "trades": self.trades,
            "created_at": self.created_at.isoformat(),
            "last_updated": self.last_updated.isoformat()
        } 