# Railway部署内存问题解决方案

## 问题描述
Docker构建时出现错误代码137，这通常是因为Railway免费层的内存限制（512MB）。

## 解决方案

### 方案1: 使用Nixpacks（推荐）
我们已经配置了nixpacks.toml，它比Docker使用更少的内存。

### 方案2: 本地构建前端
如果Railway构建仍然失败，可以在本地构建前端后提交：

```bash
# 本地构建前端
cd app/frontend
npm install
npm run build
cd ../..

# 提交构建结果
git add app/frontend/dist
git commit -m "添加预构建的前端文件"
git push
```

### 方案3: 分离部署
1. 先部署后端API
2. 前端部署到Vercel或Netlify

### 方案4: 升级Railway计划
考虑升级到付费计划以获得更多内存。

## 当前配置
- 使用nixpacks.toml而不是Dockerfile
- 分步安装依赖
- 使用railway-build.sh脚本控制构建过程

## 验证步骤
1. 检查Railway构建日志
2. 确认Python依赖安装成功
3. 检查前端构建状态 