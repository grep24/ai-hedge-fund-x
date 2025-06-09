#!/bin/bash

# 启用错误时退出和调试输出
set -ex

echo "Starting application setup..."

# 显示环境变量
echo "Environment variables:"
env

# 设置Python路径
export PYTHONPATH=/app
echo "PYTHONPATH set to: $PYTHONPATH"

# 显示当前目录结构
echo "Current directory structure:"
pwd
ls -la

# 检查必要的文件是否存在
echo "Checking required files..."
if [ ! -f "pyproject.toml" ]; then
    echo "Error: pyproject.toml not found!"
    exit 1
fi

# 检查Python环境
echo "Python environment:"
python --version
poetry --version

# 检查依赖安装
echo "Checking dependencies..."
poetry show

# 等待数据库和其他服务（如果有的话）
echo "Waiting for services to be ready..."
sleep 15

# 启动应用
echo "Starting application..."
cd /app
exec poetry run uvicorn app.backend.main:app --host 0.0.0.0 --port $PORT --log-level debug --reload 