# Railway部署指南

## 🚨 重要说明

Railway需要特殊配置来处理Python + Node.js混合项目。我们使用`nixpacks.toml`来明确指定构建步骤。

## 部署架构

- **后端**: FastAPI (Python 3.11)
- **前端**: React + TypeScript (Node.js 20)
- **构建系统**: Nixpacks
- **部署平台**: Railway

## 文件结构

```
ai-hedge-fund-x/
├── requirements.txt      # Python依赖
├── package.json         # 前端构建脚本
├── build.sh            # 前端构建脚本
├── Procfile            # 启动命令
├── railway.toml        # Railway配置
├── nixpacks.toml       # Nixpacks构建配置
├── runtime.txt         # Python版本
├── app/
│   ├── backend/        # FastAPI后端
│   └── frontend/       # React前端
└── src/                # AI交易逻辑
```

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
```

## 部署步骤

### 1. 提交代码

```bash
git add .
git commit -m "配置Railway部署：Python + Node.js混合项目"
git push origin main
```

### 2. 在Railway部署

1. 登录 [Railway](https://railway.app)
2. 创建新项目或选择现有项目
3. 连接GitHub仓库
4. Railway会自动检测`nixpacks.toml`并开始构建

### 3. 监控部署

在Railway控制台查看：
- **Build Logs**: 确认Python和Node.js依赖都安装成功
- **Deploy Logs**: 确认应用启动成功

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

## 故障排查

### 常见问题

#### 1. "uvicorn: command not found"
**原因**: Python依赖未正确安装
**解决方案**: 
- 确保`nixpacks.toml`存在且配置正确
- 检查`requirements.txt`包含`uvicorn[standard]`
- 使用`python -m uvicorn`而不是直接`uvicorn`

#### 2. 前端404错误
**原因**: 前端未构建或路径配置错误
**解决方案**:
- 检查Build Logs中是否有`npm run build`成功执行
- 确认`app/frontend/dist`目录存在

#### 3. 健康检查失败
**原因**: 应用启动失败或端口配置错误
**解决方案**:
- 查看Deploy Logs中的错误信息
- 确保使用`$PORT`环境变量
- 增加健康检查超时时间

### 调试技巧

1. **查看详细日志**
   ```bash
   # 在Railway控制台查看实时日志
   ```

2. **本地测试**
   ```bash
   # 安装依赖
   pip install -r requirements.txt
   
   # 构建前端
   chmod +x build.sh
   ./build.sh
   
   # 启动应用
   PORT=8000 python -m uvicorn app.backend.main:app --host 0.0.0.0 --port 8000
   ```

3. **环境变量检查**
   - 确保所有必需的API密钥都已设置
   - Railway会自动设置`PORT`环境变量

## 性能优化

1. **前端优化**
   - 代码分割以减小包大小
   - 启用gzip压缩

2. **后端优化**
   - 调整worker数量
   - 配置适当的超时时间

## 安全建议

1. 不要在代码中硬编码API密钥
2. 使用Railway的环境变量管理
3. 定期更新依赖包

## 支持

如遇到问题：
1. 查看Railway文档: https://docs.railway.app
2. 检查应用日志
3. 确认所有配置文件格式正确 