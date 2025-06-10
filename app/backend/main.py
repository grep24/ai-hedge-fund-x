from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# 注册API路由
app.include_router(trading.router, prefix="/api/trading", tags=["trading"])

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

@app.get("/api")
async def root():
    """
    API根端点 - 返回服务状态和版本信息
    """
    return {
        "status": "healthy",
        "service": "ai-hedge-fund-api",
        "version": "0.1.0",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# 配置静态文件服务 - 放在所有API路由之后
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
