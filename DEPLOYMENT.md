# Railway部署指南

## 部署前准备

### 1. 创建环境变量文件

在项目根目录创建 `.env` 文件，包含以下内容：

```env
# AI模型API密钥（至少需要一个）
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# 金融数据API（可选，用于获取股票数据）
FINANCIAL_DATASETS_API_KEY=your_financial_datasets_api_key_here

# Ollama配置（如果使用本地模型）
OLLAMA_BASE_URL=http://localhost:11434
```

### 2. 在Railway中设置环境变量

在Railway项目设置中添加相同的环境变量。

## 部署步骤

### 1. 推送代码到GitHub

```bash
git add .
git commit -m "准备Railway部署"
git push origin main
```

### 2. 在Railway创建项目

1. 登录Railway (https://railway.app)
2. 创建新项目
3. 选择"Deploy from GitHub repo"
4. 选择您的仓库
5. Railway会自动检测到 `railway.toml` 配置文件

### 3. 配置环境变量

在Railway项目的Variables设置中添加所有必需的环境变量。

### 4. 部署

Railway会自动开始部署流程：
- 安装Python依赖（使用Poetry）
- 安装Node.js和前端依赖
- 构建前端应用
- 启动FastAPI后端服务

## 验证部署

### 1. 检查健康端点

访问 `https://your-app.railway.app/api/health`

应该返回：
```json
{
  "status": "healthy",
  "service": "ai-hedge-fund-api",
  "version": "0.1.0",
  ...
}
```

### 2. 访问前端

访问 `https://your-app.railway.app`

应该看到AI对冲基金的前端界面。

## 故障排查

### 常见问题

1. **前端无法加载**
   - 检查前端是否成功构建
   - 查看Railway构建日志

2. **API请求失败**
   - 检查环境变量是否正确设置
   - 查看Railway运行日志

3. **AI模型无法使用**
   - 确保至少设置了一个AI模型的API密钥
   - 检查API密钥是否有效

### 日志查看

在Railway控制台中可以查看：
- 构建日志
- 部署日志
- 应用运行日志

## 注意事项

1. **API密钥安全**：不要将API密钥提交到Git仓库
2. **资源限制**：注意Railway的免费层限制
3. **并发请求**：生产环境可能需要调整worker数量 