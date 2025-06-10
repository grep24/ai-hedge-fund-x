import requests
import json
from datetime import datetime, timedelta

# API基础URL（替换为您的Railway URL）
BASE_URL = "YOUR_RAILWAY_URL"  # 例如：https://ai-hedge-fund-x-production.up.railway.app

def test_health():
    """测试健康检查端点"""
    response = requests.get(f"{BASE_URL}/health")
    print("\n健康检查结果:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))

def run_backtest():
    """运行回测"""
    # 计算日期范围（最近一个月）
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # 准备请求数据
    data = {
        "tickers": ["AAPL", "MSFT", "NVDA"],
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "initial_cash": 100000.0,
        "margin_requirement": 0.0,
        "use_ollama": False
    }
    
    # 发送请求
    response = requests.post(
        f"{BASE_URL}/api/trading/backtest",
        json=data
    )
    
    print("\n回测结果:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    print("开始测试AI对冲基金API...")
    
    # 测试健康检查
    test_health()
    
    # 运行回测
    run_backtest() 