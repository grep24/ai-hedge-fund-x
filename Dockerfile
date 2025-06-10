# 阶段1: 构建前端
FROM node:20-slim AS frontend-builder

WORKDIR /app

# 复制前端相关文件
COPY package.json build.sh ./
COPY app/frontend ./app/frontend

# 构建前端
RUN chmod +x build.sh && ./build.sh

# 阶段2: 最终镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 复制Python依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 从构建阶段复制前端构建结果
COPY --from=frontend-builder /app/app/frontend/dist ./app/frontend/dist

# 复制应用代码
COPY . .

# 设置环境变量
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 启动命令
CMD ["python", "start_server.py"] 