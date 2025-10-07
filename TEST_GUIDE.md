# 🧪 API 测试指南

## 测试 Cursor API 的正确调用方式

### 使用 Python 测试脚本

我们提供了一个完整的测试脚本，会自动尝试所有可能的调用方式。

#### 安装依赖

```bash
pip install requests
```

#### 运行测试

```bash
python test_api.py "your_WorkosCursorSessionToken"
```

#### 示例输出

```
╔════════════════════════════════════════╗
║   Cursor API 测试脚本                 ║
╚════════════════════════════════════════╝

🔑 Token (前20字符): user_01K5E7682E8N...

==================================================
方式1：Cookie Header
==================================================
状态码: 200
✅ 成功!
会员类型: free_trial
试用剩余: 6 天

==================================================
方式2：POST with Body (Form Data)
==================================================
状态码: 200
✅ 成功!
会员类型: free_trial
试用剩余: 6 天

==================================================
测试总结
==================================================
Cookie Header (标准): ✅ 成功
POST Form Data: ✅ 成功
POST JSON: ❌ 失败
GET Query Param: ❌ 失败

🎉 推荐使用: Cookie Header (标准)
```

## 🔍 四种测试方法

### 方法 1：Cookie Header（标准方式）

```python
import requests

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
    timeout=10,
    allow_redirects=True
)
```

### 方法 2：POST 请求体（表单格式）

```python
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*',
    'Content-Type': 'application/x-www-form-urlencoded'
}

data = {
    'WorkosCursorSessionToken': token
}

response = requests.post(
    'https://www.cursor.com/api/auth/stripe',
    headers=headers,
    data=data,  # 表单格式：WorkosCursorSessionToken=<token>
    timeout=10,
    allow_redirects=True
)
```

**请求体格式**：
```
WorkosCursorSessionToken=user_01K5E7682E8NEAYPHE34PD8JKK%3A%3Aeyxxx...
```

### 方法 3：POST 请求体（JSON 格式）

```python
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

payload = {
    'WorkosCursorSessionToken': token
}

response = requests.post(
    'https://www.cursor.com/api/auth/stripe',
    headers=headers,
    json=payload,
    timeout=10,
    allow_redirects=True
)
```

### 方法 4：GET 查询参数

```python
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*'
}

params = {
    'WorkosCursorSessionToken': token
}

response = requests.get(
    'https://www.cursor.com/api/auth/stripe',
    headers=headers,
    params=params,
    timeout=10,
    allow_redirects=True
)
```

**请求 URL**：
```
https://www.cursor.com/api/auth/stripe?WorkosCursorSessionToken=user_xxx...
```

## 🔧 使用 curl 测试

### 方式 1：Cookie Header

```bash
curl -X GET 'https://www.cursor.com/api/auth/stripe' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' \
  -H 'Accept: */*' \
  -b 'WorkosCursorSessionToken=your_token_here' \
  -L
```

### 方式 2：POST 表单数据

```bash
curl -X POST 'https://www.cursor.com/api/auth/stripe' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' \
  -H 'Accept: */*' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'WorkosCursorSessionToken=your_token_here' \
  -L
```

### 方式 3：POST JSON

```bash
curl -X POST 'https://www.cursor.com/api/auth/stripe' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"WorkosCursorSessionToken":"your_token_here"}' \
  -L
```

## 📊 后端代理服务器实现

我们的后端服务会自动尝试多种方式：

```javascript
// server/proxy.js

// 方式1：Cookie Header
let response = await fetch('https://www.cursor.com/api/auth/stripe', {
  method: 'GET',
  headers: {
    'Cookie': `WorkosCursorSessionToken=${token}`
  }
})

// 如果失败，尝试方式2：POST with Body
if (response.status === 308 || !response.ok) {
  const formData = new URLSearchParams()
  formData.append('WorkosCursorSessionToken', token)
  
  response = await fetch('https://www.cursor.com/api/auth/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()  // WorkosCursorSessionToken=<token>
  })
}
```

## 🎯 推荐方案

根据测试结果，推荐按以下优先级尝试：

1. **Cookie Header** (GET 请求) - 最标准的方式
2. **POST Form Data** - 如果遇到 308 重定向
3. **后端代理** - 通过我们的 Node.js 服务自动处理

## 🔍 调试技巧

### 查看实际请求

**Python:**
```python
import requests
import logging

# 开启调试日志
logging.basicConfig(level=logging.DEBUG)

response = requests.get(...)
```

**Node.js:**
```javascript
// 查看响应头
console.log('Status:', response.status)
console.log('Headers:', response.headers)
console.log('Redirected:', response.redirected)
```

### 检查重定向

```python
response = requests.get(..., allow_redirects=False)
print('Status:', response.status_code)
if response.status_code in [301, 302, 308]:
    print('Redirect to:', response.headers.get('Location'))
```

## ⚠️ 常见问题

### 308 Permanent Redirect

**原因**：API 端点可能要求特定的请求格式

**解决**：
1. 使用 `allow_redirects=True` 自动跟随
2. 尝试 POST 方法
3. 使用后端代理服务

### CORS 错误

**原因**：浏览器同源策略限制

**解决**：
1. 使用后端代理服务
2. 安装 CORS 浏览器扩展（仅开发）

### 401/403 错误

**原因**：Token 无效或过期

**解决**：
1. 重新获取 Token
2. 检查 Token 格式是否完整
3. 确认 Token 未被 URL 编码破坏

## 📝 测试清单

- [ ] Python 测试脚本运行成功
- [ ] 确认哪种方法有效
- [ ] 后端代理服务正常
- [ ] 前端界面查询成功
- [ ] 查看后端日志确认使用的方法

## 🚀 快速测试

```bash
# 1. 运行 Python 测试脚本
python test_api.py "your_token"

# 2. 如果 Python 测试成功，启动完整服务
start.bat  # Windows
./start.sh # Linux/Mac

# 3. 在浏览器访问 http://localhost:3000
# 4. 开启"使用后端代理"开关并测试
```

---

通过这个测试指南，您可以准确判断哪种方法最适合调用 Cursor API！





