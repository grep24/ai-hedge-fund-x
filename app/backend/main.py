from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import sys
import os
import datetime
import logging

# 添加项目根目录到Python路径
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(root_dir)

from app.backend.routes import trading, hedge_fund, monitoring, health
from .middleware.error_handler import error_handler
from .middleware.monitoring import monitoring_middleware

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(
    title="AI Hedge Fund X",
    description="AI-driven hedge fund platform with multiple analyst agents",
    version="1.0.0"
)

# 添加中间件
app.middleware("http")(error_handler)
app.middleware("http")(monitoring_middleware)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该限制来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(trading.router, prefix="/api/trading", tags=["trading"])
app.include_router(hedge_fund.router, prefix="/api/hedge-fund", tags=["hedge-fund"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["monitoring"])

@app.get("/")
async def root():
    return {
        "name": "AI Hedge Fund X",
        "version": "1.0.0",
        "status": "running"
    }

# 配置静态文件服务 - 放在所有API路由之后
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
