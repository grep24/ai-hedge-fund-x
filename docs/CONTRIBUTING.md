# 贡献指南

感谢您对 AI Hedge Fund 项目的关注！我们欢迎任何形式的贡献，包括但不限于：

- 报告问题
- 提交功能请求
- 提交代码修复
- 改进文档
- 添加测试用例

## 目录

- [行为准则](#行为准则)
- [开始贡献](#开始贡献)
- [开发流程](#开发流程)
- [提交指南](#提交指南)
- [代码风格](#代码风格)
- [测试指南](#测试指南)
- [文档指南](#文档指南)
- [分支策略](#分支策略)

## 行为准则

本项目采用 [Contributor Covenant](https://www.contributor-covenant.org/zh-cn/version/2/0/code_of_conduct/) 行为准则。参与本项目即表示您同意遵守该准则。

## 开始贡献

1. Fork 本仓库
2. 克隆您的 Fork
```bash
git clone https://github.com/your-username/ai-hedge-fund.git
```

3. 添加上游仓库
```bash
git remote add upstream https://github.com/virattt/ai-hedge-fund.git
```

4. 创建新分支
```bash
git checkout -b feature/your-feature-name
```

## 开发流程

1. 确保您的分支是最新的
```bash
git fetch upstream
git rebase upstream/main
```

2. 安装依赖
```bash
# 后端依赖
poetry install

# 前端依赖
cd app/frontend
npm install
```

3. 运行测试
```bash
# 后端测试
poetry run pytest

# 前端测试
cd app/frontend
npm test
```

4. 启动开发服务器
```bash
# 后端服务器
cd app/backend
poetry run uvicorn main:app --reload

# 前端开发服务器
cd app/frontend
npm run dev
```

## 提交指南

1. 提交消息格式
```
<类型>(<范围>): <描述>

[可选的正文]

[可选的脚注]
```

类型包括：
- feat: 新功能
- fix: 修复
- docs: 文档更改
- style: 代码格式（不影响代码运行的变动）
- refactor: 重构（既不是新增功能，也不是修改bug的代码变动）
- test: 增加测试
- chore: 构建过程或辅助工具的变动

示例：
```
feat(agents): 添加 Charlie Munger 投资代理

- 实现基本的投资逻辑
- 添加市场分析功能
- 集成到代理网络中

Closes #123
```

2. 保持提交小而集中
- 每个提交应该代表一个逻辑变更
- 避免在一个提交中混合多个不相关的变更
- 使用 `git add -p` 来分阶段提交更改

3. 创建拉取请求
- 填写完整的描述
- 引用相关的问题
- 添加必要的测试
- 更新相关文档

## 代码风格

### Python

- 使用 Black 进行代码格式化
- 遵循 PEP 8 规范
- 使用类型注解
- 文档字符串使用 Google 风格

配置示例：
```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py38']
include = '\.pyi?$'

[tool.isort]
profile = "black"
multi_line_output = 3
```

### TypeScript/JavaScript

- 使用 ESLint 和 Prettier
- 遵循 Airbnb 风格指南
- 使用 TypeScript 类型

配置示例：
```json
// .eslintrc.json
{
  "extends": [
    "airbnb",
    "airbnb-typescript",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-function-return-type": "off"
  }
}
```

## 测试指南

### 后端测试

1. 单元测试
```bash
poetry run pytest tests/unit
```

2. 集成测试
```bash
poetry run pytest tests/integration
```

3. 端到端测试
```bash
poetry run pytest tests/e2e
```

测试文件结构：
```
tests/
├── unit/
│   ├── test_agents.py
│   ├── test_portfolio.py
│   └── test_market_data.py
├── integration/
│   ├── test_api.py
│   └── test_database.py
└── e2e/
    └── test_trading.py
```

### 前端测试

1. 单元测试
```bash
npm test
```

2. 端到端测试
```bash
npm run test:e2e
```

## 文档指南

1. API 文档
- 使用 OpenAPI/Swagger 规范
- 包含请求/响应示例
- 说明认证要求
- 列出可能的错误

2. 组件文档
- 使用 Storybook
- 包含使用示例
- 说明 props 和事件
- 添加交互演示

3. 架构文档
- 使用 Mermaid 图表
- 说明组件关系
- 描述数据流
- 列出技术选择

## 分支策略

- main: 主分支，保持稳定
- develop: 开发分支，集成新功能
- feature/*: 功能分支
- bugfix/*: 修复分支
- release/*: 发布分支
- hotfix/*: 紧急修复分支

工作流程：
1. 从 develop 创建功能分支
2. 开发完成后提交拉取请求到 develop
3. 代码审查通过后合并
4. 定期从 develop 合并到 main 发布新版本

## 发布流程

1. 版本号管理
- 遵循语义化版本
- 使用 git tag 标记版本
- 更新 CHANGELOG.md

2. 发布检查清单
- 所有测试通过
- 文档已更新
- CHANGELOG.md 已更新
- 版本号已更新
- 性能测试通过
- 安全检查通过

3. 发布步骤
```bash
# 更新版本号
poetry version patch  # 或 minor 或 major

# 创建发布分支
git checkout -b release/v1.0.0

# 运行测试
poetry run pytest

# 构建文档
mkdocs build

# 创建标签
git tag -a v1.0.0 -m "Release v1.0.0"

# 推送到远程
git push origin v1.0.0
```

## 问题报告

创建问题时请包含：

1. 问题描述
- 清晰的标题
- 详细的描述
- 重现步骤
- 预期行为
- 实际行为

2. 环境信息
- 操作系统
- Python 版本
- Node.js 版本
- 相关依赖版本

3. 其他信息
- 错误日志
- 截图
- 相关配置

## 功能请求

提交功能请求时请包含：

1. 功能描述
- 解决什么问题
- 预期行为
- 可能的实现方案

2. 其他信息
- 使用场景
- 替代方案
- 参考资料 