# 🚀 Vercel 部署指南

本项目已优化为Vercel部署，使用Serverless Functions实现API代理。

---

## ✨ 为什么选择Vercel？

- ✅ **完全免费** - 个人项目永久免费
- ✅ **无请求限制** - 可以正常访问Cursor API
- ✅ **极速部署** - 自动构建，秒级部署
- ✅ **全球CDN** - 访问速度快
- ✅ **自动HTTPS** - 免费SSL证书
- ✅ **零配置** - 开箱即用

---

## 🚀 快速部署

### 方法1：通过Vercel网站（推荐）

1. **访问** https://vercel.com
2. **注册/登录** （可用GitHub账号）
3. **点击** "Add New" → "Project"
4. **导入** 你的Git仓库
5. **部署** - Vercel自动检测配置并构建
6. **完成** - 获得 `https://your-app.vercel.app` 地址

### 方法2：通过Vercel CLI

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 生产部署
vercel --prod
```

就这么简单！🎉

---

## 📁 项目结构

```
cursor-user-manager/
├── api/
│   ├── stripe.js          # Serverless函数：代理Cursor API
│   └── health.js          # 健康检查端点
├── src/                   # Vue源代码
├── dist/                  # 构建产物（自动生成）
├── vercel.json           # Vercel配置
├── package.json          # 依赖配置
└── vite.config.js        # Vite配置
```

---

## 🔧 工作原理

### API代理流程

```
浏览器 
  ↓ (前端请求 /api/auth/stripe)
Vercel Serverless Function (api/stripe.js)
  ↓ (服务端请求，带Cookie)
Cursor API (https://www.cursor.com/api/auth/stripe)
  ↓ (返回数据)
浏览器
```

**关键点：**
- 前端请求自己的域名，无CORS问题
- Serverless函数在服务端发起请求，无浏览器限制
- 完美解决跨域问题！

---

## 🧪 验证部署

### 1. 检查健康状态

```bash
curl https://your-app.vercel.app/health
```

应返回：
```json
{
  "status": "ok",
  "message": "Cursor User Manager API is running on Vercel",
  "timestamp": "2025-10-06T...",
  "version": "2.0.0"
}
```

### 2. 测试API代理

```bash
curl https://your-app.vercel.app/api/auth/stripe \
  -H "X-Cursor-Token: YOUR_TOKEN"
```

### 3. 访问前端

直接访问 `https://your-app.vercel.app` 使用完整功能！

---

## ⚙️ 配置说明

### vercel.json

```json
{
  "routes": [
    {
      "src": "/api/auth/stripe",
      "dest": "/api/stripe.js"           // 路由到Serverless函数
    },
    {
      "src": "/health",
      "dest": "/api/health.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"              // SPA路由支持
    }
  ]
}
```

### 环境变量（可选）

如需配置环境变量：

1. Vercel项目页面 → Settings → Environment Variables
2. 添加变量（如API密钥等）
3. 在代码中通过 `process.env.VARIABLE_NAME` 访问

---

## 🔄 更新部署

### 自动部署（推荐）

连接Git仓库后，每次推送代码自动部署：

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel自动：
1. 检测到推送
2. 构建项目
3. 部署新版本
4. 更新域名

### 手动部署

```bash
vercel --prod
```

---

## 🌐 自定义域名

### 添加自定义域名

1. Vercel项目页面 → Settings → Domains
2. 添加你的域名（如 `cursor.yourdomain.com`）
3. 按提示配置DNS：
   ```
   Type: CNAME
   Name: cursor
   Value: cname.vercel-dns.com
   ```
4. 等待DNS生效（几分钟到几小时）
5. Vercel自动配置HTTPS

---

## 📊 监控和日志

### 查看日志

1. Vercel项目页面 → Deployments
2. 点击任一部署 → Logs
3. 查看实时日志和错误信息

### 查看分析

1. Vercel项目页面 → Analytics
2. 查看访问量、响应时间等指标

---

## 🎯 性能优化

### 已优化项

- ✅ **边缘缓存** - Vercel自动CDN缓存
- ✅ **代码分割** - Vite自动优化
- ✅ **Gzip压缩** - 自动启用
- ✅ **HTTP/2** - 默认支持
- ✅ **Serverless** - 按需执行，零成本

### 响应时间

- 静态资源：< 50ms（CDN）
- API代理：< 500ms（取决于Cursor API）
- 首次加载：< 1s

---

## 💰 费用说明

### 免费额度（个人）

- ✅ 无限项目
- ✅ 100GB带宽/月
- ✅ 100次Serverless函数调用/小时
- ✅ 自动HTTPS
- ✅ 自定义域名

**对于个人使用完全免费！** 💚

### Pro方案（$20/月）

- 更高带宽限制
- 更多团队功能
- 优先支持

**个人项目无需升级！**

---

## 🐛 常见问题

### Q: 部署失败？

**A:** 检查：
1. `package.json` 中的依赖是否完整
2. `vercel.json` 语法是否正确
3. 查看Vercel的构建日志

### Q: API返回404？

**A:** 确保：
1. `api/stripe.js` 文件存在
2. `vercel.json` 中的路由配置正确
3. 重新部署：`vercel --prod`

### Q: CORS错误？

**A:** Serverless函数已设置CORS头，不应该有问题。如果遇到：
1. 检查 `api/stripe.js` 中的CORS设置
2. 确保前端请求相对路径 `/api/auth/stripe`

### Q: 超时？

**A:** Vercel Serverless函数默认10秒超时（免费版）：
- 通常足够Cursor API响应
- 如超时，检查Token是否有效
- Pro版可配置更长超时

---

## 🔒 安全建议

### 1. 环境变量

敏感信息存储在Vercel环境变量中，不要提交到代码：

```javascript
// api/stripe.js
const API_KEY = process.env.API_KEY;
```

### 2. 速率限制

可添加速率限制防止滥用：

```javascript
// api/stripe.js
import rateLimit from 'express-rate-limit';
```

### 3. Token验证

在Serverless函数中验证Token格式：

```javascript
if (!token || !token.startsWith('user_')) {
  return res.status(400).json({ error: 'Invalid token format' });
}
```

---

## 🎉 部署完成清单

- [ ] Vercel账号已创建
- [ ] 项目已成功部署
- [ ] `/health` 端点返回正常
- [ ] API代理功能正常
- [ ] 前端页面可以访问
- [ ] 数据导入功能正常
- [ ] Cursor API查询成功
- [ ] （可选）自定义域名已配置

---

## 📚 相关资源

- [Vercel官方文档](https://vercel.com/docs)
- [Serverless Functions指南](https://vercel.com/docs/functions/serverless-functions)
- [Vercel CLI文档](https://vercel.com/docs/cli)

---

**现在就部署到Vercel，享受完整功能！** 🚀

```bash
vercel --prod
```

