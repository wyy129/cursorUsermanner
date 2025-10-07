# Cursor 账号管理器 - 使用指南

## 🎯 功能说明

这是一个 Cursor 账号管理工具，可以查询账号的：
- ✅ 订阅状态（会员类型、试用天数）
- ✅ 用量详情（最近30天的费用）

**技术架构：**
- 前端：Vue 3
- 后端：Node.js + Express（解决 CORS 问题）
- API：完全参考 Python `cursor_account_manager.py` 的实现

---

## 🚀 快速开始

### 1️⃣ 启动后端服务

```bash
# 进入 server 目录
cd server

# 安装依赖（首次运行）
npm install

# 启动服务
npm start
```

**后端服务地址：** `http://localhost:3001`

### 2️⃣ 启动前端应用

```bash
# 在项目根目录
npm install   # 首次运行
npm run dev   # 启动开发服务器
```

**前端地址：** `http://localhost:5173`

---

## 📖 使用方法

### 方式 1：通过界面查询

1. 打开前端页面 `http://localhost:5173`
2. 在"账号信息查询"区域输入 `WorkosCursorSessionToken`
3. 点击"🚀 查询信息"
4. 查看订阅状态和用量费用

### 方式 2：导入 JSON 批量管理

1. 准备 JSON 文件（格式参考 `sample-data.json`）
2. 点击"导入 JSON 文件"
3. 查看所有账号列表
4. 使用搜索框过滤账号

---

## 🔑 如何获取 Token

### 方法 1：浏览器开发者工具

1. 登录 https://cursor.com
2. 按 `F12` 打开开发者工具
3. 切换到 **Application** 标签页（Chrome）或 **Storage** 标签页（Firefox）
4. 左侧找到 **Cookies** → `https://cursor.com`
5. 找到 `WorkosCursorSessionToken`，复制其值

### 方法 2：抓包工具

使用 Fiddler/Charles 抓包，查找请求头中的 Cookie。

---

## 📡 API 接口说明

### 订阅接口

**请求：**
```bash
curl -X POST http://localhost:3001/api/check-stripe \
  -H "Content-Type: application/json" \
  -d '{"token": "your_token_here"}'
```

**响应示例：**
```json
{
  "membershipType": "pro",
  "daysRemainingOnTrial": null,
  "subscriptionStatus": "active"
}
```

### 用量接口

**请求：**
```bash
curl -X POST http://localhost:3001/api/check-usage \
  -H "Content-Type: application/json" \
  -d '{"token": "your_token_here"}'
```

**响应示例：**
```json
{
  "totalCostCents": 1250,
  "events": [...],
  "dateRange": {
    "start": "2024-09-07",
    "end": "2024-10-07"
  }
}
```

---

## 🔧 技术细节

### 核心实现（参考 Python 代码）

**Python 版本：**
```python
response = requests.get(
    url='https://www.cursor.com/api/auth/stripe',
    headers={'User-Agent': '...'},
    cookies={'WorkosCursorSessionToken': token},
    verify=False
)
```

**Node.js 版本：**
```javascript
const response = await fetch('https://www.cursor.com/api/auth/stripe', {
  method: 'GET',
  headers: {
    'User-Agent': '...',
    'Cookie': `WorkosCursorSessionToken=${token}`
  }
})
```

### 关键特性

- ✅ **完全参考 Python 实现**：请求头、Cookie 处理方式与 Python 版本一致
- ✅ **后端代理**：解决浏览器 CORS 限制
- ✅ **双接口支持**：订阅信息 + 用量详情
- ✅ **精简代码**：移除冗余逻辑，保持简洁

---

## 📝 JSON 数据格式

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

导入后可以查看：
- 会员类型
- 剩余天数
- Token 状态
- 用量费用

---

## ⚠️ 注意事项

1. **Token 有效期**：Token 可能会过期，需要定期更新
2. **请求频率**：避免短时间内大量请求
3. **隐私安全**：Token 是敏感信息，请勿泄露
4. **后端必须运行**：前端调用需要后端代理服务

---

## 🐛 常见问题

### Q1: 提示"请确保 Token 有效且后端服务已启动"

**解决：**
- 检查后端是否运行（`http://localhost:3001/health`）
- 确认 Token 是否有效（可以先在浏览器中手动验证）

### Q2: 后端启动失败

**解决：**
```bash
cd server
npm install   # 重新安装依赖
npm start     # 重新启动
```

### Q3: 前端无法连接后端

**解决：**
- 确认后端端口是 `3001`
- 检查防火墙是否阻止
- 查看浏览器控制台错误信息

---

## 📦 项目结构

```
.
├── server/              # 后端代理服务
│   ├── proxy.js         # 核心代理逻辑
│   └── package.json
├── src/                 # 前端源码
│   ├── App.vue          # 主应用
│   ├── components/      # 组件
│   │   ├── TokenChecker.vue  # Token 查询（核心组件）
│   │   ├── DataTable.vue
│   │   └── ...
│   └── utils/
│       └── api.js       # API 调用封装
├── sample-data.json     # 示例数据
└── USAGE.md             # 本文件
```

---

## 💡 开发建议

1. **查看日志**：后端控制台会输出详细的请求日志
2. **参考 Python**：有问题时对比 `cursor_account_manager.py` 的实现
3. **简化优先**：保持代码简洁，避免过度设计

---

**祝使用愉快！** 🎉

