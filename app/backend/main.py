from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import datetime

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

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
    return {"status": "ok"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
