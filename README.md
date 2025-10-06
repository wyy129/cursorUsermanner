# 🔐 Cursor用户数据管理系统

一个用于管理和查询Cursor用户数据的现代化Web应用。

**技术栈：** Vue 3 + Vite + Vercel Serverless Functions

**在线演示：** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/cursor-user-manager)

---

## ✨ 功能特性

- 📁 **本地数据导入** - 支持JSON文件上传和文本粘贴
- 🔍 **实时搜索** - 快速搜索用户邮箱
- 📊 **数据统计** - 显示总账户数和有效Token数量
- 🔌 **Cursor API查询** - 查询用户的Stripe订阅信息
- 📋 **Token管理** - 查看和复制Token
- 🎨 **现代UI** - 美观的渐变紫色主题

---

## 🚀 快速开始

### 方式1：部署到Vercel（推荐）⭐

一键部署，完整功能：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/cursor-user-manager)

或使用CLI：
```bash
npm i -g vercel
vercel --prod
```

**详细步骤：** [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

### 方式2：本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000`

---

## 📖 使用说明

### 1. 导入数据

**方式一：文件导入**
1. 点击 "📁 导入JSON文件"
2. 选择包含用户数据的JSON文件

**方式二：文本导入**
1. 点击 "📝 粘贴JSON文本"
2. 粘贴JSON数据
3. 点击 "导入"

**数据格式：**
```json
[
  {
    "email": "user@example.com",
    "auth_info": {
      "WorkosCursorSessionToken": "user_xxx...",
      "cursorAuth/accessToken": "eyJhbGci...",
      "cursorAuth/refreshToken": "eyJhbGci..."
    },
    "membershipType": "pro",
    "daysRemainingOnTrial": null,
    "tokenValidity": true,
    "register_time": "2025-08-28 15:22:46"
  }
]
```

### 2. 查询Cursor Stripe信息

导入数据后，对于有`WorkosCursorSessionToken`的用户：

**在表格中：**
- 点击 "🔍 查询Stripe" 按钮

**在详情页：**
- 点击 "👁️ 查看详情"
- 点击 "🔍 查询Stripe信息" 按钮

系统会调用Cursor官方API获取用户的订阅信息。

---

## 🌐 Cursor API说明

### API接口

**地址：** `https://www.cursor.com/api/auth/stripe`  
**方法：** `GET`  
**认证：** Cookie中的 `WorkosCursorSessionToken`

### 环境配置

#### 开发环境

使用Vite代理自动转发请求，避免CORS问题：

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'https://www.cursor.com',
    changeOrigin: true,
    secure: false
  }
}
```

#### 生产环境

**⚠️ 重要提示：** 生产环境直接从浏览器请求Cursor API会遇到CORS问题，因为Cursor API不允许跨域请求。

**解决方案：**

1. **使用开发环境**（推荐用于测试）
   ```bash
   npm run dev
   ```

2. **部署后端代理**（生产环境推荐）
   
   创建一个简单的后端服务来代理请求：
   
   ```javascript
   // server.js (Node.js示例)
   const express = require('express');
   const fetch = require('node-fetch');
   const app = express();
   
   app.get('/api/auth/stripe', async (req, res) => {
     const token = req.headers.cookie?.match(/WorkosCursorSessionToken=([^;]+)/)?.[1];
     
     const response = await fetch('https://www.cursor.com/api/auth/stripe', {
       headers: {
         'Cookie': `WorkosCursorSessionToken=${token}`
       }
     });
     
     const data = await response.json();
     res.json(data);
   });
   
   app.listen(3001);
   ```

3. **本地使用**（最简单）
   
   仅在本地开发环境使用此功能。

---

## 🛠️ 项目结构

```
cursor-user-manager/
├── index.html                 # HTML入口
├── package.json               # 项目配置
├── vite.config.js            # Vite配置（含代理）
├── src/
│   ├── main.js               # Vue应用入口
│   ├── App.vue               # 根组件
│   ├── assets/
│   │   └── style.css         # 全局样式
│   ├── components/           # Vue组件
│   │   ├── AppHeader.vue
│   │   ├── ImportControls.vue
│   │   ├── SearchBox.vue
│   │   ├── StatsDisplay.vue
│   │   ├── DataTable.vue
│   │   ├── EmptyState.vue
│   │   ├── TokenModal.vue
│   │   └── TextImportModal.vue
│   └── utils/
│       ├── api.js            # API调用
│       └── message.js        # 消息提示
└── README.md
```

---

## 🔍 功能详解

### 数据表格

显示所有导入的用户信息：
- 序号
- Email
- WorkosCursorSessionToken（折叠显示）
- 会员类型（Pro/Free/试用）
- 剩余天数
- Token状态
- 注册时间
- 操作按钮

### Token状态

| 状态 | 显示 | 说明 |
|------|------|------|
| 有Token且有效 | ✅ 有效 | 正常显示 |
| 有Token但失效 | ⚠️ Token失效 | 橙色背景 |
| 无Token | ❌ 无Token | 红色淡化背景 |

### Stripe查询功能

点击"查询Stripe"按钮后，系统会：
1. 获取用户的`WorkosCursorSessionToken`
2. 调用Cursor API
3. 返回订阅信息（以弹窗形式显示）

**返回信息可能包含：**
- 订阅状态
- 订阅类型
- 订阅有效期
- 支付信息等

---

## ⚠️ 注意事项

### 1. 在线查询功能

- **本地开发**：通过Vite代理实现
- **Vercel部署**：通过Serverless Functions实现，完整功能可用 ✅
- **其他平台**：需要配置后端代理

### 2. Token安全

- Token是敏感信息，请勿在公网暴露
- 建议仅在本地或内部网络使用
- 不要将含有真实Token的JSON文件提交到代码仓库

### 3. API限制

- Cursor API可能有请求频率限制
- 请勿频繁查询
- 仅用于合法目的

---

## 🐛 常见问题

### Q: 点击"查询Stripe"后显示504超时

**A:** 可能的原因：
1. **Token无效或过期** - 获取新的Token
2. **Cursor API响应慢** - 等待30秒，已自动增加超时时间
3. **网络问题** - 检查HF Spaces日志

**测试Token是否有效：**
```bash
# 本地测试
python test_api.py "你的Token"

# 或使用curl
curl "https://www.cursor.com/api/auth/stripe" \
  -H "Cookie: WorkosCursorSessionToken=你的Token"
```

详细调试步骤请查看 [DEBUG.md](./DEBUG.md)

### Q: 如何获取WorkosCursorSessionToken？

**A:** 从Cursor应用存储中获取：
- **Windows**: `%APPDATA%\Cursor\User\globalStorage\`
- **Mac**: `~/Library/Application Support/Cursor/User/globalStorage/`
- **Linux**: `~/.config/Cursor/User/globalStorage/`

查找包含 `WorkosCursorSessionToken` 的文件。

### Q: 推荐的部署方式？

**A:** 强烈推荐 **Vercel部署**：

```bash
npm i -g vercel
vercel --prod
```

**优势：**
- ✅ 完全免费
- ✅ API查询功能完美支持
- ✅ 自动HTTPS和全球CDN
- ✅ 秒级部署
- ✅ 零配置

**详细指南：** [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

### Q: 本地开发？

**A:** 
```bash
npm install
npm run dev
```
访问 `http://localhost:3000`

---

## 📚 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **Vite 5** - 下一代前端构建工具
- **Vercel** - Serverless部署平台
- **Node.js** - Serverless Functions
- **现代CSS** - CSS变量、渐变、动画

---

## 📄 许可证

本项目仅供学习和个人使用。

---

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [Cursor 官网](https://www.cursor.com/)

---

**💡 提示：** 如需生产环境部署，建议配置后端代理服务来处理API请求。

