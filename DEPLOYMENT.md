# Railway部署指南

## 部署架构简化

我们已经简化了部署流程：
- 使用 `requirements.txt` 替代 Poetry
- 直接使用 Procfile 启动应用
- 使用构建脚本处理前端

## 部署前准备

### 1. 设置环境变量

在Railway项目中设置以下环境变量：

```env
# AI模型API密钥（至少需要一个）
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# 金融数据API（可选）
FINANCIAL_DATASETS_API_KEY=your_financial_datasets_api_key_here

# Ollama配置（如果使用本地模型）
OLLAMA_BASE_URL=http://localhost:11434
```

## 部署步骤

### 1. 推送代码到GitHub

```bash
git add .
git commit -m "简化Railway部署配置"
git push origin main
```

### 2. 在Railway创建项目

1. 登录Railway (https://railway.app)
2. 创建新项目
3. 选择"Deploy from GitHub repo"
4. 选择您的仓库

### 3. Railway会自动：

1. 检测到 `requirements.txt` 并安装Python依赖
2. 检测到 `package.json` 并构建前端
3. 使用 `Procfile` 启动应用

## 文件结构说明

```
ai-hedge-fund-x/
├── requirements.txt      # Python依赖
├── package.json         # 前端构建脚本
├── build.sh            # 前端构建脚本
├── Procfile            # 启动命令
├── railway.toml        # Railway配置
├── app/
│   ├── backend/        # FastAPI后端
│   └── frontend/       # React前端
└── src/                # AI交易逻辑
```

## 验证部署

### 1. 检查健康端点

访问 `https://your-app.railway.app/api/health`

应该返回：
```json
{
  "status": "healthy",
  "service": "ai-hedge-fund-api",
  "version": "0.1.0"
}
```

### 2. 访问前端

访问 `https://your-app.railway.app`

应该看到AI对冲基金的前端界面。

## 故障排查

### 日志查看

在Railway控制台查看：
- **Build Logs**：构建过程日志
- **Deploy Logs**：运行时日志

### 常见问题

1. **构建失败**
   - 检查 `requirements.txt` 中的依赖版本
   - 确保Python版本为3.11

2. **前端无法加载**
   - 检查 `build.sh` 是否成功执行
   - 查看 `app/frontend/dist` 目录是否存在

3. **API密钥错误**
   - 确保在Railway中设置了环境变量
   - 至少需要一个AI模型的API密钥

## 本地测试

```bash
# 安装依赖
pip install -r requirements.txt

# 构建前端
chmod +x build.sh
./build.sh

# 启动应用
uvicorn app.backend.main:app --host 0.0.0.0 --port 8000
```

访问 http://localhost:8000 