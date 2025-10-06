# 🔍 调试模式使用指南

## 为什么需要调试模式？

您提到想要看到发送给 `https://www.cursor.com/api/auth/stripe` 的实际请求，特别是 Cookie 头部的 `WorkosCursorSessionToken` 值。

**问题是**：这个请求是在服务器端（Vercel Function）发出的，浏览器的 Network 面板**看不到**！

**解决方案**：我添加了一个**调试模式**，可以在响应中返回完整的请求详情！

---

## 🚀 如何使用调试模式

### 方法1：使用 Token 测试工具（最简单）

1. **部署代码后，访问网站**
   ```
   https://cursor-usermanner.vercel.app
   ```

2. **点击顶部按钮**
   ```
   🔬 显示Token测试工具
   ```

3. **粘贴您的 Token**

4. **点击橙色按钮**
   ```
   🔍 调试模式测试
   ```

5. **查看结果** 🎉

   成功后会显示：
   
   ```
   ✅ Token 有效！
   
   🔍 请求详情（调试模式）
   
   1️⃣ 前端 → Vercel Function
   {
     "method": "GET",
     "url": "https://cursor-usermanner.vercel.app/api/auth/stripe?debug=true",
     "headers": {
       "X-Cursor-Token": "user_2XXXXXXXXXX...",
       "Origin": "https://cursor-usermanner.vercel.app"
     }
   }
   
   2️⃣ Vercel Function → Cursor API  👈 这是您想看的！
   👇 这就是实际发送给 Cursor 的请求！
   {
     "method": "GET",
     "url": "https://www.cursor.com/api/auth/stripe",
     "headers": {
       "Cookie": "WorkosCursorSessionToken=user_2XXXXXXXXXX...",  👈 这里！
       "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
       "Accept": "application/json, text/plain, */*",
       "Origin": "https://www.cursor.com",
       "Referer": "https://www.cursor.com/"
     }
   }
   
   Cookie 头部内容：
   WorkosCursorSessionToken=user_2XXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

---

### 方法2：使用浏览器控制台

如果使用调试模式测试，浏览器控制台会显示更详细的信息：

1. **按 F12 打开开发者工具**

2. **切换到 Console 标签**

3. **点击 "🔍 调试模式测试"**

4. **在控制台查看**：

   ```javascript
   🔍 Token 测试 - 调试模式
     完整响应数据: {...}
     发送到 Cursor 的 Cookie: WorkosCursorSessionToken=user_2XXXXXXXXXX...
   ```

---

### 方法3：直接在 API 请求中启用

如果您在代码中调用 API，可以这样启用调试模式：

```javascript
// 普通模式
const result = await queryUserStripeInfo(token);

// 调试模式（第二个参数设为 true）
const result = await queryUserStripeInfo(token, true);

// 响应会包含 _debug 字段
if (result.success && result.data._debug) {
  console.log('发送到 Cursor 的请求:', result.data._debug.requestToCursor);
  console.log('Cookie 头:', result.data._debug.requestToCursor.headers.Cookie);
}
```

---

## 📊 调试模式返回的信息

### 完整的响应结构

```json
{
  "membershipType": "free_trial",
  "daysRemainingOnTrial": 6,
  "subscriptionStatus": "trialing",
  "paymentId": "cus_XXX",
  // ... 其他正常字段
  
  "_debug": {
    "note": "这是调试信息，仅在添加 ?debug=true 或 X-Debug: true 时显示",
    
    "requestToVercel": {
      "method": "GET",
      "url": "https://cursor-usermanner.vercel.app/api/auth/stripe?debug=true",
      "headers": {
        "X-Cursor-Token": "user_2XXXXXXXXXX...",
        "Origin": "https://cursor-usermanner.vercel.app",
        "User-Agent": "Mozilla/5.0..."
      }
    },
    
    "requestToCursor": {  👈 这是您最想看的部分
      "method": "GET",
      "url": "https://www.cursor.com/api/auth/stripe",
      "headers": {
        "Cookie": "WorkosCursorSessionToken=user_2XXXXXXXXXX...",  👈 Cookie 头！
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://www.cursor.com",
        "Referer": "https://www.cursor.com/"
      }
    },
    
    "tokenInfo": {
      "length": 45,
      "prefix": "user_2XXXXXXXXXX",
      "startsWithUser": true
    },
    
    "cursorResponse": {
      "status": 200,
      "statusText": "OK",
      "contentLength": 285
    }
  }
}
```

---

## 🎯 实际应用场景

### 场景1：验证 Token 是否正确发送

**问题**：不确定 Token 是否正确传递给 Cursor API

**解决**：
1. 使用调试模式测试
2. 查看 `_debug.requestToCursor.headers.Cookie`
3. 确认完整的 Token 值

### 场景2：诊断 401 错误

**问题**：收到 401 错误，不知道是 Token 问题还是请求问题

**解决**：
1. 使用调试模式测试
2. 查看 `_debug.tokenInfo` 确认 Token 格式
3. 查看 `_debug.requestToCursor` 确认请求格式
4. 查看 `_debug.cursorResponse.status` 了解 Cursor 的实际响应

### 场景3：对比工作和不工作的请求

**问题**：某些 Token 能用，某些不能，不知道差异在哪

**解决**：
1. 对两个 Token 都使用调试模式
2. 对比 `_debug.requestToCursor` 的差异
3. 对比 `_debug.tokenInfo` 的差异
4. 找出问题所在

---

## 🔐 安全说明

### 调试信息的安全性

1. **Token 脱敏**：
   - 调试信息中的 Token 只显示前 20 个字符
   - 完整 Token 不会暴露在响应中（只在服务器端日志）

2. **仅在需要时启用**：
   - 必须明确添加 `?debug=true` 或 `X-Debug: true`
   - 不会默认开启

3. **生产环境建议**：
   - 仅在诊断问题时使用
   - 问题解决后移除调试参数

---

## 📋 完整的测试流程

### 步骤1：部署代码

```bash
git add .
git commit -m "feat: 添加调试模式，可查看完整请求详情"
git push origin main
```

### 步骤2：访问网站并测试

1. 访问 https://cursor-usermanner.vercel.app
2. 点击 `🔬 显示Token测试工具`
3. 粘贴 Token
4. 点击 `🔍 调试模式测试`（橙色按钮）

### 步骤3：查看结果

✅ **成功时**：
- 绿色框显示会员信息
- 下方显示完整的请求详情
- Cookie 头部清晰可见

❌ **失败时**：
- 红色框显示错误信息
- 根据错误提示采取相应措施

---

## 🆚 普通模式 vs 调试模式

| 特性 | 普通模式 | 调试模式 |
|------|---------|----------|
| 响应大小 | 小（仅业务数据） | 大（包含调试信息） |
| 请求详情 | ❌ 不显示 | ✅ 完整显示 |
| Cookie 头 | ❌ 看不到 | ✅ 清晰可见 |
| Token 信息 | ❌ 不显示 | ✅ 长度、格式检查 |
| 适用场景 | 正常使用 | 调试诊断 |
| 性能 | 更快 | 略慢（更多处理） |

---

## 💡 常见问题

### Q1: 为什么浏览器 Network 面板看不到发送给 Cursor 的请求？

**A**: 因为这是服务器端请求！

```
用户浏览器
  ↓ (你能看到)
Vercel Function
  ↓ (你看不到，这是服务器端)
Cursor API
```

浏览器只能看到用户发出的请求，看不到服务器端发出的请求。

### Q2: 调试模式会影响正常功能吗？

**A**: 不会！调试模式只是在响应中添加 `_debug` 字段，不影响业务数据。

### Q3: Token 会泄露吗？

**A**: 不会！调试信息中的 Token 已脱敏，只显示前 20 个字符。

### Q4: 生产环境可以用吗？

**A**: 可以，但建议只在诊断问题时使用，问题解决后移除调试参数。

---

## 🎉 总结

现在您可以：

1. ✅ **看到完整的请求流程**
   - 前端 → Vercel
   - Vercel → Cursor

2. ✅ **查看实际的 Cookie 头**
   - `WorkosCursorSessionToken=具体的值`

3. ✅ **验证 Token 正确性**
   - 长度、格式、前缀

4. ✅ **诊断 401 错误**
   - Token 信息
   - 请求格式
   - Cursor 响应

**立即部署并使用调试模式测试吧！** 🚀

点击 `🔍 调试模式测试` 按钮，您将看到所有您想要的信息！

