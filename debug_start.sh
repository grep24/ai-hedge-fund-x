#!/bin/bash

# 启用调试输出
set -x

echo "=== Debug Start Script ==="
echo "Current directory: $(pwd)"
echo "Python version: $(python --version)"
echo "PORT: ${PORT:-8080}"

# 设置环境变量
export PYTHONPATH=/app
export PORT=${PORT:-8080}

# 测试导入
echo "=== Testing imports ==="
python -c "
import sys
print('Python path:', sys.path)
try:
    from app.backend.main import app
    print('✓ Main app imported successfully')
except Exception as e:
    print('✗ Failed to import main app:', e)
    import traceback
    traceback.print_exc()
"

# 如果导入成功，尝试启动服务器
if [ $? -eq 0 ]; then
    echo "=== Starting server ==="
    exec poetry run uvicorn app.backend.main:app --host 0.0.0.0 --port $PORT --log-level debug
else
    echo "=== Import failed, not starting server ==="
    exit 1
fi 