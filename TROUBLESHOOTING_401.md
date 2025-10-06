# 🔧 401 错误诊断指南

## 重要说明

**401 状态码 ≠ 跨域问题** ✅

如果看到 `401 Unauthorized`，说明：
- ✅ 跨域问题已经解决
- ✅ 请求成功到达服务器
- ❌ Token 验证失败

如果是跨域问题，您会看到：
- ❌ 状态码：`(failed)` 或 `CORS error`
- ❌ Console 红色错误：`Access to fetch at ... has been blocked by CORS policy`

---

## 🔍 诊断步骤

### 步骤1：查看 Vercel Function 日志

Vercel 的日志会显示详细的调试信息。

**如何查看日志：**

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目 `cursor-usermanner`
3. 点击顶部 **"Deployments"** 标签
4. 点击最新的部署
5. 点击 **"Functions"** 标签
6. 找到 `/api/auth/stripe` 函数
7. 点击查看实时日志

**日志会显示：**

```
[API] === 开始处理请求 ===
[API] 请求方法: GET
[API] Origin: https://cursor-usermanner.vercel.app
[API] 所有请求头: { ... }
[API] 从 X-Cursor-Token header 获取: 存在，长度XXX
[API] ✅ Token获取成功！
[API] Token长度: XXX
[API] Token前缀: user_2XXXXXXXXXX...
[API] Token格式检查: ✅ 正确
[API] 准备转发请求到 Cursor API...
[API] ⬅️ Cursor API响应状态: 401 Unauthorized
[API] ❌ Cursor API返回错误: 401
[API] 错误响应内容: { ... }
```

### 步骤2：检查 Token 是否有效

**在浏览器控制台查看：**

打开浏览器开发者工具（F12），在点击"查询Stripe"按钮后，查看 Console 输出：

```javascript
// 前端日志
请求地址: https://cursor-usermanner.vercel.app/api/auth/stripe
Token长度: XXX 
Token前缀: user_2XXXXXXXXXX

// 响应日志
响应状态: 401 Unauthorized
API错误响应: {
  error: "Cursor API返回 401",
  details: "...",
  debug: {
    tokenPrefix: "user_2XXXXXXXXXX",
    tokenLength: XXX,
    fullResponse: "..."
  }
}
```

### 步骤3：验证 Token 格式

**正确的 Token 格式：**

```
user_2XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**特征：**
- ✅ 以 `user_` 开头
- ✅ 长度通常在 40-50 字符左右
- ✅ 只包含字母、数字、下划线

**常见错误：**
- ❌ 复制时多了空格或换行
- ❌ 只复制了部分Token
- ❌ Token 已过期

---

## 🔧 解决方法

### 方法1：重新获取 Token（推荐）

Token 可能已过期，需要重新获取最新的：

1. **打开 Cursor 应用**

2. **打开开发者工具**
   - Windows/Linux: `F12` 或 `Ctrl+Shift+I`
   - macOS: `Cmd+Option+I`

3. **进入存储/Cookie**
   - Chrome: `Application` → `Cookies` → `https://www.cursor.com`
   - Firefox: `Storage` → `Cookies` → `https://www.cursor.com`

4. **找到 WorkosCursorSessionToken**
   - 点击复制整个值
   - 确保没有多余的空格

5. **在网站中重新导入包含新Token的数据**

### 方法2：直接在 Cursor 应用测试

确认 Token 是否有效：

```bash
# 在终端运行（替换成您的真实Token）
curl -X GET \
  -H "Cookie: WorkosCursorSessionToken=user_2XXXXXXXXXX" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Accept: application/json" \
  -H "Origin: https://www.cursor.com" \
  -H "Referer: https://www.cursor.com/" \
  https://www.cursor.com/api/auth/stripe
```

**如果返回 200 和数据**：Token 有效，问题可能在传递过程中
**如果返回 401**：Token 无效或已过期，需要重新获取

### 方法3：检查数据格式

确保导入的 JSON 数据格式正确：

```json
[
  {
    "email": "user@example.com",
    "auth_info": {
      "WorkosCursorSessionToken": "user_2XXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  }
]
```

**常见错误：**
```json
// ❌ 错误：Token 字段名不对
{
  "auth_info": {
    "token": "user_2XXX"  // 应该是 WorkosCursorSessionToken
  }
}

// ❌ 错误：Token 有多余的引号或空格
{
  "auth_info": {
    "WorkosCursorSessionToken": " user_2XXX "  // 前后有空格
  }
}
```

---

## 📊 调试清单

部署后测试时，按此清单逐项检查：

- [ ] **1. 验证跨域已解决**
  - 打开浏览器 DevTools → Network
  - 查看 `/api/auth/stripe` 请求
  - Response Headers 应包含 `Access-Control-Allow-Origin`
  - 没有 CORS 错误信息

- [ ] **2. 验证 Token 正确发送**
  - Network → 选中请求 → Headers 标签
  - Request Headers 应包含 `X-Cursor-Token: user_2XXX...`
  - Token 长度和格式正确

- [ ] **3. 查看 Vercel 日志**
  - Vercel Dashboard → Functions 日志
  - 确认 `[API] ✅ Token获取成功！`
  - 查看 Cursor API 返回的具体错误

- [ ] **4. 验证 Token 有效性**
  - 使用 curl 直接测试 Cursor API
  - 如果 curl 也返回 401，说明 Token 已失效
  - 重新从 Cursor 应用获取最新 Token

- [ ] **5. 检查数据格式**
  - JSON 格式正确
  - Token 字段名正确
  - 没有多余空格或特殊字符

---

## 🎯 快速解决方案

### 最常见的原因：Token 过期

**症状：**
- 之前能用，现在不能用
- 返回 401 错误
- Vercel 日志显示 Token 格式正确

**解决：**
```
重新从 Cursor 应用获取最新的 Token
↓
更新您的用户数据 JSON 文件
↓
重新导入数据
↓
再次尝试查询
```

### Token 可能失效的情况

1. **时间过期**：Token 有有效期限制
2. **登出重登**：在 Cursor 应用中登出后重新登录
3. **修改密码**：修改账号密码后，旧Token失效
4. **账号异常**：Cursor 检测到异常活动，撤销Token

---

## 📱 实时查看调试信息

现在当查询失败时，弹窗会显示详细的调试信息：

```
查询失败 (HTTP 401: Cursor API返回 401)

📋 服务器返回:
{
  "error": "Cursor API返回 401",
  "details": "...",
  "hint": "Token可能无效或已过期，请检查Token是否正确",
  "debug": {
    "status": 401,
    "statusText": "Unauthorized",
    "fullResponse": "...",
    "tokenPrefix": "user_2XXXXXXXXXX",
    "tokenLength": 45
  }
}

🔍 调试信息:
Token前缀: user_2XXXXXXXXXX
Token长度: 45
完整响应: ...

⚠️ 可能原因：
1. Token已过期或无效
2. Token格式不正确（应以user_开头）
3. 该Token已被撤销

💡 解决方法：
从Cursor应用重新获取最新的Token

📝 如何获取Token：
1. 打开Cursor应用
2. 按F12打开开发者工具
3. 点击Application/存储
4. 找到Cookies > WorkosCursorSessionToken
```

---

## 🆘 还是无法解决？

如果按照上述步骤仍然无法解决，请提供以下信息：

1. **Vercel Function 日志截图**（包含完整的调试信息）
2. **浏览器 Console 截图**（包含错误信息）
3. **Token 前缀**（前20个字符，如 `user_2XXXXXXXXXX`）
4. **Token 长度**（字符数）
5. **是否是新获取的 Token**（多久前获取的）

---

## ✅ 成功标志

当问题解决后，您会看到：

**Vercel 日志：**
```
[API] ✅ Token获取成功！
[API] ⬅️ Cursor API响应状态: 200 OK
[API] ✅ 请求成功！
```

**浏览器弹窗：**
- 显示美观的订阅信息界面
- 包含会员类型、剩余天数等详细信息

**Network 面板：**
- 状态码：`200 OK`
- Response 包含完整的订阅数据

---

## 📝 总结

**401 错误的本质**：
- ✅ 不是跨域问题
- ✅ 不是代码问题
- ✅ 不是配置问题
- ❌ 是 Token 验证失败

**最快的解决方法**：
重新获取最新的 Token，然后重新导入数据！🎯

