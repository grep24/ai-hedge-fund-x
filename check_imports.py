#!/usr/bin/env python3
"""检查所有导入是否正常工作"""

import sys
import os

# 设置PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Python version:", sys.version)
print("Python path:", sys.path)
print("\n检查导入...")

try:
    print("1. 导入FastAPI...")
    from fastapi import FastAPI
    print("   ✓ FastAPI导入成功")
except Exception as e:
    print(f"   ✗ FastAPI导入失败: {e}")

try:
    print("\n2. 导入app.backend.main...")
    from app.backend.main import app
    print("   ✓ main.py导入成功")
except Exception as e:
    print(f"   ✗ main.py导入失败: {e}")

try:
    print("\n3. 导入路由模块...")
    from app.backend.routes import trading, hedge_fund, monitoring, health
    print("   ✓ 路由模块导入成功")
except Exception as e:
    print(f"   ✗ 路由模块导入失败: {e}")

try:
    print("\n4. 导入服务模块...")
    from app.backend.services.hedge_fund import HedgeFundService
    print("   ✓ 服务模块导入成功")
except Exception as e:
    print(f"   ✗ 服务模块导入失败: {e}")

try:
    print("\n5. 导入src模块...")
    from src.graph.graph import HedgeFundGraph
    print("   ✓ src模块导入成功")
except Exception as e:
    print(f"   ✗ src模块导入失败: {e}")

print("\n检查完成！") 