# ✅ 308 重定向问题 - 完整解决方案

## 🔍 问题描述

在尝试查询 Cursor API 时，遇到 **308 Permanent Redirect** 错误：

```
请求 URL: https://www.cursor.com/api/auth/stripe
请求方法: GET
状态代码: 308 Permanent Redirect
```

## 🎯 问题原因

1. **重定向问题** - API 端点可能发生了重定向
2. **CORS 限制** - 浏览器同源策略阻止跨域请求
3. **Cookie 设置限制** - 浏览器不允许 JavaScript 直接设置跨域 Cookie

## ✨ 解决方案

我们提供了**三种调用方式**，推荐使用后端代理模式。

### 方案一：后端代理模式（✅ 推荐）

#### 架构图
```
浏览器 → 本地后端服务 (localhost:3001) → Cursor API
       ← 解决 CORS        ← 返回数据
```

#### 启动步骤

**1. 使用一键启动脚本（最简单）：**

Windows:
```bash
start.bat
```

Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

**2. 手动启动：**

```bash
# 终端 1：启动后端代理
cd server
npm install
npm start

# 终端 2：启动前端
npm run dev
```

**3. 在界面使用：**
- 访问 `http://localhost:3000`
- 找到 "账号信息查询" 卡片
- ✅ **开启 "使用后端代理" 开关**
- 粘贴 Token 并查询

### 方案二：直接调用模式（需要浏览器扩展）

如果不想启动后端服务，可以使用 CORS 浏览器扩展：

1. 安装 [CORS Unblock](https://chrome.google.com/webstore) 扩展
2. 启用扩展
3. 在界面上**关闭 "使用后端代理" 开关**
4. 进行查询

**⚠️ 注意**：此方法仅适用于开发测试，不推荐在生产环境使用。

### 方案三：使用 Python 脚本（命令行）

如果只需要简单查询，可以使用 Python：

```python
import requests

token = "your_WorkosCursorSessionToken"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*'
}

cookies = {
    'WorkosCursorSessionToken': token
}

response = requests.get(
    'https://www.cursor.com/api/auth/stripe',
    headers=headers,
    cookies=cookies,
    timeout=10
)

data = response.json()
print(f"会员类型: {data['membershipType']}")
if 'daysRemainingOnTrial' in data:
    print(f"试用剩余: {data['daysRemainingOnTrial']} 天")
```

## 📋 功能对比

| 特性 | 后端代理 | 直接调用 | Python 脚本 |
|-----|---------|---------|------------|
| 解决 308 重定向 | ✅ | ❌ | ✅ |
| 解决 CORS | ✅ | ❌ (需扩展) | N/A |
| 界面友好 | ✅ | ✅ | ❌ |
| 需要额外服务 | ✅ (Node.js) | ❌ | ✅ (Python) |
| 推荐使用 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 🛠️ 后端代理技术细节

### 服务器实现

文件：`server/proxy.js`

```javascript
app.post('/api/check-stripe', async (req, res) => {
  const { token } = req.body
  
  const response = await fetch('https://www.cursor.com/api/auth/stripe', {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 ...',
      'Accept': 'application/json',
      'Cookie': `WorkosCursorSessionToken=${token}`,
      'Origin': 'https://www.cursor.com'
    },
    redirect: 'follow'  // 自动跟随重定向
  })
  
  const data = await response.json()
  res.json({ success: true, data })
})
```

### 前端调用

文件：`src/utils/api.js`

```javascript
export async function fetchStripeInfoViaBackend(sessionToken) {
  const response = await fetch('/api/check-stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: sessionToken })
  })
  
  return await response.json()
}
```

## 🔐 安全说明

### 开发环境
- ✅ 本地运行，数据不会发送到外部服务器
- ✅ Token 仅在您的电脑上处理
- ✅ 代理服务器运行在 `localhost`

### 生产环境建议
1. 添加请求频率限制
2. 添加身份验证机制
3. 使用 HTTPS
4. 配置环境变量
5. 添加日志和监控

## 📊 测试验证

### 验证后端服务是否正常

```bash
curl http://localhost:3001/health
```

期望输出：
```json
{
  "status": "ok",
  "message": "Cursor API 代理服务运行中"
}
```

### 验证 API 调用

```bash
curl -X POST http://localhost:3001/api/check-stripe \
  -H "Content-Type: application/json" \
  -d '{"token": "your_token_here"}'
```

## 🐛 常见问题

### Q1: 后端启动失败，提示端口被占用

**A:** 修改端口号

```javascript
// server/proxy.js
const PORT = 3002  // 改为其他端口
```

### Q2: 仍然显示 308 错误

**A:** 确保：
1. 后端服务正在运行 (`http://localhost:3001/health` 可访问)
2. 前端已开启 "使用后端代理" 开关
3. Token 格式正确且有效

### Q3: 查询成功但数据为空

**A:** 检查：
1. Token 是否过期
2. 检查浏览器控制台的网络请求
3. 查看后端服务器日志

### Q4: Windows 脚本无法运行

**A:** 
```bash
# 使用管理员权限打开 PowerShell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# 或者直接运行
start.bat
```

## 📝 项目文件结构

```
cursor-user-manager/
├── server/                    # 后端代理服务
│   ├── proxy.js              # Express 服务器
│   └── package.json          # 后端依赖
├── src/
│   ├── utils/
│   │   └── api.js            # API 调用封装（支持多种模式）
│   └── components/
│       └── TokenChecker.vue  # Token 查询组件（带模式切换）
├── start.bat                 # Windows 启动脚本
├── start.sh                  # Linux/Mac 启动脚本
├── PROXY_SETUP.md           # 详细配置指南
└── SOLUTION_308.md          # 本文档
```

## 🎓 学习资源

- [HTTP 重定向详解](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Redirections)
- [CORS 跨域资源共享](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [Express.js 官方文档](https://expressjs.com/)
- [Node.js Fetch API](https://nodejs.org/docs/latest/api/globals.html#fetch)

## ✅ 总结

**308 重定向问题已完全解决！**

- ✅ 创建了后端代理服务
- ✅ 支持模式切换（直接/代理）
- ✅ 提供一键启动脚本
- ✅ 完善的错误提示和重试机制
- ✅ 详细的文档和示例

**推荐使用方式**：
1. 运行 `start.bat` (Windows) 或 `./start.sh` (Linux/Mac)
2. 访问 `http://localhost:3000`
3. 开启 "使用后端代理" 开关
4. 开始使用！

---

**需要帮助？** 查看 [PROXY_SETUP.md](./PROXY_SETUP.md) 获取更多详细信息。

