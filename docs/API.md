# AI Hedge Fund API 文档

本文档详细说明了 AI Hedge Fund 项目的 API 端点、请求/响应格式和使用示例。

## 基础信息

- 基础 URL: `http://localhost:8000`
- API 版本: v1
- 响应格式: JSON
- 认证方式: API Key（在请求头中使用 `X-API-Key`）

## 目录

- [认证](#认证)
- [健康检查](#健康检查)
- [对冲基金操作](#对冲基金操作)
- [回测操作](#回测操作)
- [市场数据](#市场数据)
- [错误处理](#错误处理)

## 认证

所有 API 请求都需要在请求头中包含有效的 API Key。

```bash
curl -H "X-API-Key: your-api-key" http://localhost:8000/api/v1/health
```

## 健康检查

### GET /health

检查服务健康状态。

**响应示例：**
```json
{
  "status": "healthy",
  "service": "ai-hedge-fund",
  "version": "1.0.0",
  "timestamp": "2024-03-20T10:30:00Z",
  "python_version": "3.11.7",
  "environment": "production"
}
```

## 对冲基金操作

### POST /api/v1/hedge-fund/run

运行对冲基金交易系统。

**请求参数：**
```json
{
  "tickers": ["AAPL", "MSFT", "NVDA"],
  "initial_cash": 100000.0,
  "margin_requirement": 0.0,
  "start_date": "2024-01-01",
  "end_date": "2024-03-20",
  "show_reasoning": true
}
```

**响应示例：**
```json
{
  "status": "success",
  "portfolio": {
    "total_value": 125000.0,
    "cash": 25000.0,
    "positions": [
      {
        "ticker": "AAPL",
        "shares": 100,
        "value": 35000.0
      },
      {
        "ticker": "MSFT",
        "shares": 150,
        "value": 45000.0
      },
      {
        "ticker": "NVDA",
        "shares": 50,
        "value": 20000.0
      }
    ]
  },
  "performance": {
    "total_return": 0.25,
    "sharpe_ratio": 2.1,
    "max_drawdown": 0.15
  }
}
```

### GET /api/v1/hedge-fund/status

获取对冲基金当前状态。

**响应示例：**
```json
{
  "status": "running",
  "last_update": "2024-03-20T10:30:00Z",
  "portfolio_value": 125000.0,
  "daily_pnl": 2500.0,
  "positions_count": 3
}
```

## 回测操作

### POST /api/v1/backtest/run

运行回测系统。

**请求参数：**
```json
{
  "tickers": ["AAPL", "MSFT", "NVDA"],
  "initial_cash": 100000.0,
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "strategy": {
    "name": "multi_agent",
    "parameters": {
      "agents": ["warren_buffett", "peter_lynch", "michael_burry"],
      "rebalance_frequency": "daily"
    }
  }
}
```

**响应示例：**
```json
{
  "status": "success",
  "results": {
    "total_return": 0.35,
    "sharpe_ratio": 2.5,
    "max_drawdown": 0.20,
    "trades": [
      {
        "date": "2023-02-15",
        "ticker": "AAPL",
        "action": "buy",
        "shares": 100,
        "price": 150.0
      }
    ],
    "daily_returns": [
      {
        "date": "2023-02-15",
        "return": 0.02
      }
    ]
  }
}
```

### GET /api/v1/backtest/{backtest_id}

获取特定回测的结果。

**响应示例：**
```json
{
  "id": "bt_123456",
  "status": "completed",
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "results": {
    "total_return": 0.35,
    "sharpe_ratio": 2.5,
    "max_drawdown": 0.20
  }
}
```

## 市场数据

### GET /api/v1/market-data/price

获取股票价格数据。

**请求参数：**
- `ticker`: 股票代码（必需）
- `start_date`: 开始日期（可选）
- `end_date`: 结束日期（可选）
- `interval`: 数据间隔（可选，默认为 "1d"）

**响应示例：**
```json
{
  "ticker": "AAPL",
  "data": [
    {
      "date": "2024-03-20",
      "open": 170.0,
      "high": 175.0,
      "low": 169.0,
      "close": 172.5,
      "volume": 1000000
    }
  ]
}
```

### GET /api/v1/market-data/fundamentals

获取公司基本面数据。

**请求参数：**
- `ticker`: 股票代码（必需）

**响应示例：**
```json
{
  "ticker": "AAPL",
  "fundamentals": {
    "market_cap": 2800000000000,
    "pe_ratio": 28.5,
    "dividend_yield": 0.5,
    "revenue_growth": 0.15
  }
}
```

## 错误处理

API 使用标准的 HTTP 状态码表示请求状态：

- 200: 成功
- 400: 请求参数错误
- 401: 未认证
- 403: 未授权
- 404: 资源不存在
- 429: 请求过于频繁
- 500: 服务器内部错误

错误响应格式：
```json
{
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid ticker symbol provided",
    "details": {
      "field": "ticker",
      "reason": "AAPL1 is not a valid ticker symbol"
    }
  }
}
```

## 速率限制

API 实施了以下速率限制：

- 认证用户：100 请求/分钟
- 未认证用户：10 请求/分钟

超过限制时会返回 429 状态码，并在响应头中包含：
- `X-RateLimit-Limit`: 速率限制
- `X-RateLimit-Remaining`: 剩余请求次数
- `X-RateLimit-Reset`: 限制重置时间

## WebSocket API

### /ws/portfolio-updates

订阅实时投资组合更新。

**连接示例：**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/portfolio-updates');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Portfolio update:', update);
};
```

**消息格式：**
```json
{
  "type": "portfolio_update",
  "timestamp": "2024-03-20T10:30:00Z",
  "data": {
    "total_value": 125000.0,
    "daily_pnl": 2500.0,
    "positions": [
      {
        "ticker": "AAPL",
        "shares": 100,
        "current_price": 172.5,
        "market_value": 17250.0
      }
    ]
  }
}
```

## 代码示例

### Python

```python
import requests

API_KEY = "your-api-key"
BASE_URL = "http://localhost:8000/api/v1"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# 运行对冲基金
response = requests.post(
    f"{BASE_URL}/hedge-fund/run",
    headers=headers,
    json={
        "tickers": ["AAPL", "MSFT", "NVDA"],
        "initial_cash": 100000.0
    }
)

print(response.json())
```

### JavaScript

```javascript
const API_KEY = "your-api-key";
const BASE_URL = "http://localhost:8000/api/v1";

// 运行回测
async function runBacktest() {
  const response = await fetch(`${BASE_URL}/backtest/run`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tickers: ["AAPL", "MSFT", "NVDA"],
      initial_cash: 100000.0,
      start_date: "2023-01-01",
      end_date: "2023-12-31"
    })
  });

  const data = await response.json();
  console.log(data);
}

runBacktest();
``` 