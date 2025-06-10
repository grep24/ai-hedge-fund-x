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

# 1. 先挂载前端静态文件到根路径
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

# 2. 再注册API路由到 /api 前缀
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(trading.router, prefix="/api/trading", tags=["trading"])
app.include_router(hedge_fund.router, prefix="/api/hedge-fund", tags=["hedge-fund"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["monitoring"])

# 3. 移除 / 路由的JSON返回，确保访问根路径时优先返回前端页面
# （如需API健康检查，请访问 /api/health ）
