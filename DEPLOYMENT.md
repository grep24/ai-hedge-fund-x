# Railway部署指南

## 🚨 最新更新

我们现在使用Dockerfile来确保构建的可靠性和一致性。这解决了nixpacks在处理Python + Node.js混合项目时的问题。

## 部署架构

- **构建方式**: Dockerfile
- **后端**: FastAPI (Python 3.11)
- **前端**: React + TypeScript (Node.js 20)
- **部署平台**: Railway

## 文件结构

```
ai-hedge-fund-x/
├── Dockerfile          # Docker构建配置
├── .dockerignore       # Docker忽略文件
├── requirements.txt    # Python依赖
├── package.json       # 前端构建脚本
├── build.sh          # 前端构建脚本
├── start_server.py   # Python启动脚本
├── railway.toml      # Railway配置
├── app/
│   ├── backend/      # FastAPI后端
│   └── frontend/     # React前端
└── src/              # AI交易逻辑
```

## 构建流程

1. **基础镜像**: Python 3.11-slim
2. **安装Node.js**: 通过apt-get安装Node.js 20
3. **安装Python依赖**: pip install requirements.txt
4. **构建前端**: npm install && npm run build
5. **启动服务**: 使用start_server.py动态绑定端口

## 部署前准备

### 设置环境变量

在Railway项目中设置以下环境变量：

```env
# AI模型API密钥（至少需要一个）
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here

# 金融数据API（可选）
FINANCIAL_DATASETS_API_KEY=your_key_here

# Railway会自动设置
PORT=<动态分配>
```

## 部署步骤

### 1. 提交代码

```bash
git add .
git commit -m "使用Dockerfile部署：解决nixpacks构建问题"
git push origin main
```

### 2. Railway会自动：

1. 检测到Dockerfile
2. 构建Docker镜像
3. 运行容器
4. 执行健康检查

## 验证部署

### 1. 健康检查

```bash
curl https://your-app.railway.app/api/health
```

预期响应：
```json
{
  "status": "healthy",
  "service": "ai-hedge-fund-api",
  "version": "0.1.0"
}
```

### 2. 访问前端

浏览器访问: `https://your-app.railway.app`

### 3. API文档

访问: `https://your-app.railway.app/docs`

## 故障排查

### Docker构建日志

在Railway控制台查看详细的构建步骤：
- 每个RUN命令的输出
- 依赖安装情况
- 前端构建结果

### 常见问题

#### 1. 构建超时
**解决方案**: 
- 检查网络连接
- 简化构建步骤
- 使用更小的基础镜像

#### 2. 内存不足
**解决方案**:
- 升级Railway计划
- 优化依赖
- 减少构建时的并发

#### 3. 端口绑定失败
**解决方案**:
- 确保使用环境变量$PORT
- 检查start_server.py是否正确

## 本地测试

### 使用Docker测试

```bash
# 构建镜像
docker build -t ai-hedge-fund .

# 运行容器
docker run -p 8000:8080 -e PORT=8080 ai-hedge-fund

# 访问应用
open http://localhost:8000
```

### 不使用Docker测试

```bash
# 安装依赖
pip install -r requirements.txt

# 构建前端
chmod +x build.sh
./build.sh

# 启动应用
python start_server.py
```

## 性能优化建议

1. **Docker镜像优化**
   - 使用多阶段构建
   - 清理不必要的文件
   - 使用.dockerignore

2. **缓存优化**
   - 先复制依赖文件
   - 利用Docker层缓存
   - 最后复制源代码

3. **运行时优化**
   - 使用生产级WSGI服务器
   - 配置适当的worker数量
   - 启用响应压缩

## 安全建议

1. 定期更新基础镜像
2. 扫描安全漏洞
3. 最小化镜像大小
4. 不在镜像中包含敏感信息

## 监控和日志

- **构建日志**: Railway Build Logs
- **运行日志**: Railway Deploy Logs
- **性能监控**: Railway Metrics
- **错误追踪**: 查看uvicorn日志

如有问题，请检查Railway控制台的详细日志输出。 