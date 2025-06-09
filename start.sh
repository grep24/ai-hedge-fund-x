#!/bin/bash

# 设置Python路径
export PYTHONPATH=/app

# 等待数据库和其他服务（如果有的话）
echo "Waiting for services to be ready..."
sleep 5

# 启动应用
echo "Starting application..."
poetry run uvicorn app.backend.main:app --host 0.0.0.0 --port $PORT 