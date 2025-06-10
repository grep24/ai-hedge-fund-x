from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import datetime

# 添加项目根目录到Python路径
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(root_dir)

from app.backend.routes import trading

app = FastAPI(title="AI Hedge Fund API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(trading.router, prefix="/api/trading", tags=["trading"])

@app.get("/")
async def root():
    """
    健康检查端点 - 返回服务状态和版本信息
    """
    return {
        "status": "healthy",
        "service": "ai-hedge-fund-api",
        "version": "0.1.0",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@app.get("/health")
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
