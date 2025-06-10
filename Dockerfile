# 使用官方Python运行时作为基础镜像
FROM python:3.11-slim

# 安装Node.js
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制Python依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制package.json和build脚本
COPY package.json build.sh ./

# 复制前端源代码
COPY app/frontend ./app/frontend

# 构建前端
RUN chmod +x build.sh && ./build.sh

# 复制后端和其他源代码
COPY . .

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 启动命令
CMD ["python", "start_server.py"] 