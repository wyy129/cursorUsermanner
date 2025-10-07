# ⚙️ Vercel 配置说明

## 🎯 在 Vercel UI 中的正确设置

### 项目设置（Project Settings）

当你在 Vercel 导入项目时，请按以下方式配置：

---

## 📋 必须的配置

### 1️⃣ Framework Preset（框架预设）

```
选择：Other
```

> ❌ 不要选择 Next.js、Vue、React 等
> ✅ 选择 "Other" 因为这是纯静态 + Serverless 项目

---

### 2️⃣ Root Directory（根目录）

```
保持：./
```

> ✅ 不需要修改，使用默认值

---

### 3️⃣ Build Command（构建命令）

```
留空（或填写：echo "No build required"）
```

> ❌ 不要填：npm run build
> ❌ 不要填：npm run dev  
> ✅ 本项目无需构建，直接部署

---

### 4️⃣ Output Directory（输出目录）

```
留空
```

> ❌ 不要填：dist
> ❌ 不要填：build  
> ✅ 保持为空

---

### 5️⃣ Install Command（安装命令）

```
留空（Vercel 自动处理）
```

> ✅ Vercel 会自动运行 `npm install`（如果需要）

---

## 📁 项目文件结构要求

Vercel 会自动识别以下结构：

```
项目根目录/
├── index.html          ✅ 主页面（必须在根目录）
├── api/                ✅ Serverless Functions
│   ├── stripe.js       ✅ 自动识别为 API 路由
│   └── usage.js        ✅ 自动识别为 API 路由
├── public/             ✅ 静态资源
│   ├── style.css       
│   └── script.js       
├── vercel.json         ✅ Vercel 配置
└── package.json        ✅ 项目配置
```

---

## 🔧 vercel.json 配置详解

```json
{
  "rewrites": [
    {
      "source": "/style.css",
      "destination": "/public/style.css"
    },
    {
      "source": "/script.js",
      "destination": "/public/script.js"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### 配置说明：

1. **rewrites（路径重写）**
   - 将 `/style.css` 映射到 `/public/style.css`
   - 将 `/script.js` 映射到 `/public/script.js`
   - 这样 HTML 中可以直接引用 `/style.css`

2. **headers（响应头）**
   - 为所有 API 路由添加 CORS 头
   - 允许跨域访问

---

## 🚀 Vercel 自动识别规则

### API Routes（API 路由）

Vercel 会自动将 `api/` 目录下的 `.js` 文件识别为 Serverless Functions：

| 文件路径 | API 端点 |
|---------|---------|
| `api/stripe.js` | `https://your-domain.vercel.app/api/stripe` |
| `api/usage.js` | `https://your-domain.vercel.app/api/usage` |

### 静态文件

| 文件路径 | 访问路径 |
|---------|---------|
| `index.html` | `https://your-domain.vercel.app/` |
| `public/style.css` | `https://your-domain.vercel.app/style.css` |
| `public/script.js` | `https://your-domain.vercel.app/script.js` |

---

## ✅ 部署检查清单

### 在 GitHub 上检查：

- [ ] 所有文件都已提交
- [ ] 文件结构正确
- [ ] `vercel.json` 存在且格式正确

### 在 Vercel Dashboard 检查：

- [ ] Framework Preset = "Other"
- [ ] Build Command = 留空
- [ ] Output Directory = 留空
- [ ] 项目已连接到 GitHub 仓库

### 部署后检查：

- [ ] 访问首页能看到 UI 界面
- [ ] CSS 样式正常加载
- [ ] JavaScript 功能正常
- [ ] 测试 API 调用成功

---

## 🔍 如何查看部署日志

1. 在 Vercel Dashboard
2. 点击你的项目
3. 进入 **Deployments** 标签
4. 点击最新的部署
5. 查看 **Building** 和 **Logs** 部分

### 成功的日志示例：

```
✓ Uploading files
✓ Deploying build
✓ Serverless Functions deployed
  - api/stripe.js
  - api/usage.js
✓ Static files deployed
  - index.html
  - public/style.css
  - public/script.js

✅ Deployment completed
```

---

## ❌ 常见错误和解决方法

### 错误 1：Build failed

**错误信息**：
```
Error: Build command "npm run build" failed
```

**原因**：配置了不必要的构建命令

**解决**：
1. 进入 **Settings** → **General**
2. 找到 **Build & Development Settings**
3. 将 **Build Command** 改为留空
4. 保存并重新部署

---

### 错误 2：404 on API routes

**错误信息**：访问 `/api/stripe` 返回 404

**原因**：API 文件未正确识别

**检查**：
1. 确认 `api/stripe.js` 文件存在
2. 确认文件导出了 `export default` 函数
3. 查看 Vercel Dashboard → **Functions** 确认函数已部署

**修复**：
```javascript
// api/stripe.js 必须这样导出
export default async function handler(req, res) {
  // 你的代码
}
```

---

### 错误 3：CSS/JS 404

**错误信息**：浏览器控制台显示 404

**原因**：路径配置问题

**检查**：
1. 确认 `public/style.css` 和 `public/script.js` 存在
2. 确认 `vercel.json` 有正确的 rewrites 配置
3. 确认 `index.html` 中引用路径为 `/style.css` 和 `/script.js`

---

### 错误 4：CORS 错误

**错误信息**：
```
Access to fetch at ... has been blocked by CORS policy
```

**原因**：API 未设置 CORS 头

**检查**：
1. 确认 `api/*.js` 文件中有 CORS 头设置
2. 确认 `vercel.json` 中有 headers 配置

**修复**：在每个 API 文件开头添加：
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
```

---

## 🎯 推荐的部署流程

### 首次部署：

```bash
# 1. 确保所有文件已保存
git status

# 2. 提交所有更改
git add .
git commit -m "准备部署到 Vercel"
git push

# 3. 访问 Vercel Dashboard
# 4. 导入项目
# 5. 按上述配置设置
# 6. 点击 Deploy
```

### 后续更新：

```bash
# 修改代码后
git add .
git commit -m "更新描述"
git push

# Vercel 会自动重新部署
```

---

## 📊 性能优化建议

### 1. 启用边缘缓存

在 `vercel.json` 中添加：

```json
{
  "headers": [
    {
      "source": "/public/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. 压缩响应

Vercel 自动启用 Gzip/Brotli 压缩，无需配置。

### 3. CDN

Vercel 自动通过全球 CDN 分发，无需配置。

---

## 🆘 需要帮助？

### 官方资源

- 📖 [Vercel 文档](https://vercel.com/docs)
- 🎥 [视频教程](https://vercel.com/docs/video)
- 💬 [社区讨论](https://github.com/vercel/vercel/discussions)

### 项目文档

- [README.md](./README.md) - 项目说明
- [VERCEL部署图文教程.md](./VERCEL部署图文教程.md) - 图文教程
- [快速开始.md](./快速开始.md) - 快速入门

---

**配置正确后，部署应该在 1 分钟内完成！** 🚀

