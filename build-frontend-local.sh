#!/bin/bash
set -e

echo "=== 本地构建前端 ==="
echo "这将在本地构建前端并准备提交到Git"

# 进入前端目录
cd app/frontend

# 安装依赖
echo "安装前端依赖..."
npm install

# 构建
echo "构建前端..."
npm run build

# 返回根目录
cd ../..

# 检查构建结果
if [ -d "app/frontend/dist" ]; then
    echo "✓ 前端构建成功！"
    echo ""
    echo "现在可以提交构建结果："
    echo "  git add app/frontend/dist"
    echo "  git commit -m '添加预构建的前端文件'"
    echo "  git push"
else
    echo "❌ 前端构建失败"
    exit 1
fi 