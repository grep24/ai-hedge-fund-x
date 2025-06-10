# AI Hedge Fund 部署指南

本文档提供了将 AI Hedge Fund 项目部署到生产环境的详细说明。

## 目录

- [部署选项](#部署选项)
  - [Railway 部署](#railway-部署)
  - [Docker 部署](#docker-部署)
  - [手动部署](#手动部署)
- [环境配置](#环境配置)
- [安全考虑](#安全考虑)
- [监控和日志](#监控和日志)
- [故障排除](#故障排除)

## 部署选项

### Railway 部署

Railway 是推荐的部署平台，提供了简单的部署流程和自动化的基础设施管理。

1. 准备工作
```bash
# 确保已安装 Railway CLI
npm install -g @railway/cli

# 登录到 Railway
railway login
```

2. 项目配置
- 已配置 `railway.toml` 文件，包含：
  - 构建配置：使用 nixpacks 构建器
  - 部署配置：启动命令、健康检查等
  - 环境变量配置

3. 部署步骤
```bash
# 初始化 Railway 项目
railway init

# 添加环境变量
railway vars set OPENAI_API_KEY=your-openai-api-key
railway vars set GROQ_API_KEY=your-groq-api-key
railway vars set FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key

# 部署项目
railway up
```

4. 验证部署
- 访问 `/health` 端点检查服务状态
- 检查日志确保无错误
- 测试主要功能点

### Docker 部署

使用 Docker 可以在任何支持 Docker 的环境中部署。

1. 构建镜像
```bash
# 在 docker 目录下
./run.sh build
```

2. 运行容器
```bash
# 使用 Docker Compose（推荐）
./run.sh compose

# 或直接运行容器
docker run -d \
  -p 8000:8000 \
  -e OPENAI_API_KEY=your-openai-api-key \
  -e GROQ_API_KEY=your-groq-api-key \
  -e FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key \
  ai-hedge-fund
```

3. 使用 Ollama（可选）
```bash
# 启动 Ollama 容器
./run.sh ollama

# 拉取模型
./run.sh pull llama3
```

### 手动部署

如果需要更多控制，可以选择手动部署。

1. 系统要求
- Python 3.8+
- Node.js 20.x
- Poetry
- PM2（用于进程管理）

2. 安装依赖
```bash
# 安装后端依赖
cd app/backend
poetry install --no-dev

# 安装前端依赖
cd ../frontend
npm install --production
```

3. 构建前端
```bash
npm run build
```

4. 配置进程管理
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js
```

## 环境配置

1. 必需的环境变量
```bash
# LLM API Keys
OPENAI_API_KEY=your-openai-api-key
GROQ_API_KEY=your-groq-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key

# 金融数据 API Key
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key

# 应用配置
PORT=8000
NODE_ENV=production
PYTHON_VERSION=3.11.7
NODE_VERSION=20.x
```

2. 可选配置
```bash
# 性能调优
WORKERS=4
TIMEOUT=100
MAX_REQUESTS=1000

# 缓存配置
CACHE_TTL=3600
REDIS_URL=redis://localhost:6379

# 监控配置
ENABLE_METRICS=true
SENTRY_DSN=your-sentry-dsn
```

## 安全考虑

1. API 安全
- 启用 HTTPS
- 配置 CORS
- 实现速率限制
- 添加 API 密钥认证

2. 数据安全
- 加密敏感数据
- 定期备份数据
- 实现审计日志

3. 系统安全
- 更新依赖包
- 配置防火墙
- 限制文件权限

## 监控和日志

1. 应用监控
- 使用 Prometheus 收集指标
- 配置 Grafana 仪表板
- 设置性能告警

2. 日志管理
- 配置结构化日志
- 使用 ELK Stack 或类似工具
- 设置日志轮转

3. 关键指标
- API 响应时间
- 错误率
- 资源使用率
- LLM API 调用统计

## 故障排除

1. 常见问题
- 服务无法启动
- API 超时
- 内存泄漏
- 数据库连接问题

2. 诊断工具
- 健康检查 API
- 日志分析
- 性能分析
- 网络诊断

3. 恢复流程
- 回滚部署
- 重启服务
- 清理缓存
- 重置连接池 