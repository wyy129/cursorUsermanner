# 🎯 Cursor 账号管理器

**精简版 Vue 3 应用** - 查询 Cursor 账号订阅状态和用量详情

## ✨ 核心特性

- 🔐 **Token 查询** - 查询订阅状态（会员类型、试用天数）
- 💰 **用量查询** - 查询最近30天的费用详情
- 📊 **批量管理** - 导入 JSON 批量管理多个账号
- 🎨 **现代界面** - 渐变设计 + 响应式布局

## 🚀 快速开始

### 一键启动（推荐）

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh && ./start.sh
```

自动启动后端（3001端口）+ 前端（5173端口）

### 手动启动

```bash
# 1. 启动后端（终端1）
cd server && npm install && npm start

# 2. 启动前端（终端2）
npm install && npm run dev
```

访问：`http://localhost:5173`

## 📖 使用说明

### 1. Token 查询（核心功能）

**获取 Token：**
1. 登录 https://cursor.com
2. 按 `F12` 打开开发者工具 → Application → Cookies
3. 复制 `WorkosCursorSessionToken` 的值

**查询信息：**
1. 在界面输入 Token
2. 点击"🚀 查询信息"
3. 查看订阅状态 + 用量费用

### 2. 批量管理（可选）

导入 JSON 文件（参考 `sample-data.json`）批量管理多个账号。

格式示例：
```json
[
  {
    "email": "user@example.com",
    "auth_info": {
      "WorkosCursorSessionToken": "user_xxxxx"
    }
  }
]
```

## 🔧 技术栈

- **前端**：Vue 3 + Vite
- **后端**：Node.js + Express
- **API**：参考 Python `cursor_account_manager.py` 实现

## 📡 API 接口

### 订阅接口
```bash
curl -X POST http://localhost:3001/api/check-stripe \
  -H "Content-Type: application/json" \
  -d '{"token": "your_token_here"}'
```

### 用量接口
```bash
curl -X POST http://localhost:3001/api/check-usage \
  -H "Content-Type: application/json" \
  -d '{"token": "your_token_here"}'
```

详细文档：[USAGE.md](./USAGE.md)

## 📁 项目结构

```
.
├── server/              # 后端代理
│   └── proxy.js         # 核心逻辑（参考 Python 实现）
├── src/
│   ├── App.vue          # 主应用
│   ├── components/
│   │   └── TokenChecker.vue  # Token 查询（核心）
│   └── utils/
│       └── api.js       # API 封装
├── USAGE.md             # 详细使用文档
└── sample-data.json     # 示例数据
```

## 🔄 更新日志

**v2.0.0 - 精简版 (2025-10-07)**
- ✅ 完全重构：参考 Python 实现
- ✅ 精简代码：移除冗余逻辑
- ✅ 双接口支持：订阅 + 用量
- ✅ 统一后端代理：解决 CORS

## 📄 许可证

MIT License

---

💡 **提示**：参考 [USAGE.md](./USAGE.md) 查看完整使用指南

