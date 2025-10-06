# 🔐 Cursor用户数据管理系统

一个现代化的Web应用，用于管理和查询Cursor用户数据，**完美解决跨域问题**。

## ✨ 特性

- 📊 **数据管理** - 导入、搜索、展示用户数据
- 🔍 **API查询** - 实时查询账号信息（会员类型、剩余天数）
- 🎨 **美观界面** - Vue 3 + 现代化UI设计
- 🚀 **零配置** - 无需安装任何扩展或配置
- ✅ **无跨域问题** - 使用Vercel Serverless Function代理

## 🚀 部署到Vercel（推荐）

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/cursor-usermanner)

### 手动部署

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署
vercel
```

部署成功后，直接访问你的Vercel URL即可使用！

## 💻 本地运行

```bash
# 1. 克隆项目
git clone <your-repo>
cd cursor-usermanner

# 2. 安装Vercel CLI
npm install -g vercel

# 3. 本地运行
vercel dev
```

访问 `http://localhost:3000`

## 📖 使用方法

### 1. 导入数据

- 点击 **"📁 导入JSON"** 选择文件
- 或点击 **"📝 粘贴JSON"** 直接粘贴数据

### 2. 查询API

- **单个查询**: 点击某行的 **"🔍"** 按钮
- **批量查询**: 点击顶部 **"🔄 批量查询"** 按钮

### 3. 查看结果

- 会员类型和剩余天数自动更新
- 已查询的账号显示绿色背景

## 📝 数据格式

```json
[
  {
    "email": "user@example.com",
    "auth_info": {
      "WorkosCursorSessionToken": "user_xxx..."
    },
    "membershipType": "pro",
    "daysRemainingOnTrial": null,
    "tokenValidity": true,
    "register_time": "2025-01-01 12:00:00"
  }
]
```

## 🔧 API说明

### 端点
```
GET /api/auth/stripe
```

### 请求头
```
X-Cursor-Token: <your-token>
```

### 响应
```json
{
  "membershipType": "pro",
  "daysRemainingOnTrial": null,
  "subscriptionStatus": "active",
  "individualMembershipType": "pro"
}
```

## 🎯 关键问题解决

### ✅ Token解码
Token中的URL编码（如`%3A%3A`）会自动解码为`::`

### ✅ CORS跨域
使用Vercel Serverless Function代理，完全避免CORS问题

### ✅ 无需扩展
不需要安装任何浏览器CORS扩展

## 📁 项目结构

```
cursor-usermanner/
├── index.html              # 前端页面（Vue 3）
├── api/
│   └── auth/
│       └── stripe.js       # Vercel API函数
├── vercel.json             # Vercel配置
└── README.md               # 说明文档
```

## 🔒 安全说明

- ⚠️ Token为敏感信息，请勿泄露
- ✅ API函数仅转发请求，不存储任何数据
- ✅ 所有数据在浏览器本地处理

## 📱 浏览器支持

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

## 🐛 故障排除

### 查询失败: Token无效
- Token可能已过期
- 请获取最新的Token重新导入

### 查询失败: 401错误
- 检查Token格式是否正确
- 确保Token未被截断

### 本地开发无法连接API
- 确保运行 `vercel dev` 而不是直接打开HTML
- 检查3000端口是否被占用

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**提示**: 这个项目完美解决了跨域问题，无需任何浏览器扩展或复杂配置！
