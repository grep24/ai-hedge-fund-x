from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
    return {"message": "Welcome to AI Hedge Fund API"}
