# 🚀 后端代理服务设置指南

## 问题说明

在使用 Token 查询功能时，可能遇到以下问题：

1. **308 永久重定向** - API 端点重定向导致请求失败
2. **CORS 跨域错误** - 浏览器同源策略限制
3. **Cookie 设置限制** - 浏览器阻止跨域 Cookie

## 解决方案：使用后端代理

我们提供了一个 Node.js 后端代理服务来解决这些问题。

## 📦 安装步骤

### 1. 安装后端依赖

```bash
cd server
npm install
```

### 2. 启动代理服务

```bash
npm start
```

您将看到以下输出：

```
╔════════════════════════════════════════╗
║   Cursor API 代理服务已启动 🚀        ║
║   端口: 3001                          ║
║   地址: http://localhost:3001        ║
╚════════════════════════════════════════╝

可用接口:
- POST /api/check-stripe  查询 Stripe 信息
- GET  /health            健康检查
```

### 3. 启动前端应用

在另一个终端窗口：

```bash
# 回到项目根目录
cd ..
npm run dev
```

## 🎯 使用方法

### 在界面上操作

1. 打开应用：`http://localhost:3000`
2. 找到 "账号信息查询" 卡片
3. **开启 "使用后端代理" 开关**（重要！）
4. 粘贴您的 WorkosCursorSessionToken
5. 点击 "查询账号信息"

## 📝 运行脚本

为了方便使用，可以创建启动脚本：

### Windows (start.bat)

```batch
@echo off
echo 启动 Cursor 用户管理系统...
echo.

echo [1/2] 启动后端代理服务...
start "后端代理" cmd /k "cd server && npm start"

timeout /t 3 /nobreak > nul

echo [2/2] 启动前端应用...
start "前端应用" cmd /k "npm run dev"

echo.
echo ✅ 所有服务已启动！
echo 前端: http://localhost:3000
echo 后端: http://localhost:3001
pause
```

### Linux/Mac (start.sh)

```bash
#!/bin/bash

echo "启动 Cursor 用户管理系统..."
echo ""

echo "[1/2] 启动后端代理服务..."
cd server
npm start &
BACKEND_PID=$!

sleep 3

echo "[2/2] 启动前端应用..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 所有服务已启动！"
echo "前端: http://localhost:3000"
echo "后端: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
```

## 🔧 技术细节

### 后端代理工作原理

```
浏览器 → 后端代理 (Node.js) → Cursor API
       ← (解决CORS)        ← (返回数据)
```

### API 接口

**端点**: `POST http://localhost:3001/api/check-stripe`

**请求体**:
```json
{
  "token": "your_WorkosCursorSessionToken"
}
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "membershipType": "free_trial",
    "daysRemainingOnTrial": 6,
    "subscriptionStatus": "trialing",
    ...
  }
}
```

**失败响应**:
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 代理服务器配置

文件：`server/proxy.js`

```javascript
// 主要特性
- ✅ 自动处理重定向 (redirect: 'follow')
- ✅ 完整的请求头设置
- ✅ CORS 支持
- ✅ 错误处理
- ✅ 日志记录
```

## ⚠️ 注意事项

### 端口占用

如果端口 3001 被占用，可以修改：

```javascript
// server/proxy.js
const PORT = 3002  // 改为其他端口
```

然后同时修改前端配置：

```javascript
// src/utils/api.js
export async function fetchStripeInfoViaBackend(sessionToken) {
  const response = await fetch('http://localhost:3002/api/check-stripe', {
    // ...
  })
}
```

### 生产环境部署

在生产环境中，建议：

1. 使用环境变量配置端口
2. 添加请求频率限制
3. 添加身份验证
4. 使用 HTTPS
5. 配置 Nginx 反向代理

示例 Nginx 配置：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端静态文件
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    # 代理 API 请求
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🐛 故障排除

### 问题 1：后端服务启动失败

**解决方案**：
```bash
# 检查 Node.js 版本 (需要 >= 14)
node --version

# 清除缓存重新安装
cd server
rm -rf node_modules package-lock.json
npm install
```

### 问题 2：仍然出现 CORS 错误

**解决方案**：
1. 确保后端服务正在运行
2. 检查前端是否已开启"使用后端代理"开关
3. 清除浏览器缓存
4. 检查浏览器控制台的网络请求

### 问题 3：查询返回 401/403

**解决方案**：
- Token 可能已过期，重新获取
- 检查 Token 是否完整复制
- 确认 Token 格式正确

## 📊 性能优化

### 添加请求缓存

```javascript
// server/proxy.js
const cache = new Map()

app.post('/api/check-stripe', async (req, res) => {
  const { token } = req.body
  
  // 检查缓存（5分钟有效期）
  const cached = cache.get(token)
  if (cached && Date.now() - cached.time < 300000) {
    return res.json(cached.data)
  }
  
  // ... 正常请求流程
  
  // 保存到缓存
  cache.set(token, { data: result, time: Date.now() })
})
```

### 添加请求限流

```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10 // 最多 10 个请求
})

app.post('/api/check-stripe', limiter, async (req, res) => {
  // ...
})
```

## 📚 更多资源

- [Express 文档](https://expressjs.com/)
- [CORS 配置指南](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)

---

**提示**：后端代理服务仅用于开发和测试环境。在生产环境中，请确保添加适当的安全措施！

