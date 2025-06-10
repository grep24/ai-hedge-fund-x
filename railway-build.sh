#!/bin/bash
set -e

echo "=== Railway Build Script ==="

# 检查是否有预构建的前端
if [ -d "app/frontend/dist" ]; then
    echo "✓ Frontend dist already exists"
else
    echo "⚠️ Frontend dist not found. Building frontend..."
    
    # 检查Node.js
    if command -v node &> /dev/null; then
        echo "✓ Node.js found: $(node --version)"
        
        # 构建前端
        cd app/frontend
        echo "Installing frontend dependencies..."
        npm install --no-audit --no-fund --loglevel=error
        
        echo "Building frontend..."
        npm run build
        cd ../..
        
        echo "✓ Frontend build complete"
    else
        echo "❌ Node.js not found. Frontend will not be available."
    fi
fi

echo "=== Build complete ===" 