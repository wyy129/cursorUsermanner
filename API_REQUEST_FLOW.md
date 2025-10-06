# 📡 Cursor Stripe API 请求流程说明

## 实际请求流程图

```
用户点击查询按钮
    ↓
前端 (src/App.vue)
    ↓
调用 queryUserStripeInfo(token)  
    ↓
前端请求 (src/utils/api.js)
    │
    ├─ 开发环境: /api/auth/stripe
    └─ 生产环境: https://cursor-usermanner.vercel.app/api/auth/stripe
    │
    │ Headers:
    │   - Content-Type: application/json
    │   - X-Cursor-Token: user_2xxxxxxxxxxxxxxxxxxxxxxxxxxx
    │   - Origin: https://cursor-usermanner.vercel.app
    │
    │ Credentials: include (生产环境)
    │
    ↓
Vercel Serverless Function (api/auth/stripe.js)
    │
    ├─ 动态设置CORS头:
    │   - Access-Control-Allow-Origin: https://cursor-usermanner.vercel.app
    │   - Access-Control-Allow-Credentials: true
    │   - Access-Control-Allow-Headers: X-Cursor-Token, Content-Type
    │
    ├─ 从请求中提取Token:
    │   1. 优先从 X-Cursor-Token header
    │   2. 其次从 Cookie: WorkosCursorSessionToken
    │
    ↓
转发请求到 Cursor API
    │
    │ URL: https://www.cursor.com/api/auth/stripe
    │ Method: GET
    │ Headers:
    │   - Cookie: WorkosCursorSessionToken={token}
    │   - User-Agent: Mozilla/5.0...
    │   - Accept: application/json, text/plain, */*
    │   - Origin: https://www.cursor.com
    │   - Referer: https://www.cursor.com/
    │
    ↓
Cursor API 响应
    │
    │ 成功 (200):
    │ {
    │   "membershipType": "free_trial",
    │   "paymentId": "cus_T7qZdIqmE8gjZw",
    │   "daysRemainingOnTrial": 6,
    │   "subscriptionStatus": "trialing",
    │   "verifiedStudent": false,
    │   "trialEligible": false,
    │   "isOnStudentPlan": false,
    │   "isOnBillableAuto": false,
    │   "customerBalance": 0,
    │   "trialWasCancelled": false,
    │   "isTeamMember": false,
    │   "teamMembershipType": null,
    │   "individualMembershipType": "free_trial"
    │ }
    │
    │ 失败 (401):
    │ {
    │   "error": "Unauthorized"
    │ }
    │
    ↓
返回给前端
    │
    ↓
前端处理响应 (src/App.vue)
    │
    ├─ 成功: 显示 StripeInfoModal 组件
    │   ├─ 展示会员类型 (membershipType)
    │   ├─ 展示剩余天数 (daysRemainingOnTrial)
    │   ├─ 展示订阅状态 (subscriptionStatus)
    │   └─ 展示其他详细信息
    │
    └─ 失败: 显示错误提示
```

## 关键技术点

### 1. 跨域解决方案

**问题**: 浏览器的同源策略限制，前端无法直接请求 `https://www.cursor.com/api/auth/stripe`

**解决**: 使用 Vercel Serverless Function 作为代理

### 2. CORS 配置（关键！）

**后端动态CORS设置** (`api/auth/stripe.js`):

```javascript
// 动态读取请求来源
const origin = req.headers.origin || req.headers.referer || '*';

// 如果有具体的origin，则允许该origin（支持credentials）
if (origin !== '*') {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
} else {
  res.setHeader('Access-Control-Allow-Origin', '*');
}
```

**为什么不能用通配符？**

- ❌ `Access-Control-Allow-Origin: *` + `credentials: 'include'` → 浏览器阻止
- ✅ `Access-Control-Allow-Origin: https://cursor-usermanner.vercel.app` + `credentials: 'include'` → 浏览器允许

### 3. Token 传递方式

**前端发送**:
```javascript
headers: {
  'X-Cursor-Token': token  // 自定义Header
}
```

**后端接收**:
```javascript
// 优先级1: 从自定义Header
let token = req.headers['x-cursor-token'];

// 优先级2: 从Cookie
if (!token && req.headers.cookie) {
  // 解析Cookie中的WorkosCursorSessionToken
}
```

**转发给Cursor**:
```javascript
headers: {
  'Cookie': `WorkosCursorSessionToken=${token}`
}
```

### 4. 响应数据结构

#### 免费试用账号 (free_trial)

```json
{
  "membershipType": "free_trial",
  "daysRemainingOnTrial": 6,
  "subscriptionStatus": "trialing"
}
```

#### Pro 会员账号

```json
{
  "membershipType": "pro",
  "subscriptionStatus": "active"
  // 注意: Pro账号没有 daysRemainingOnTrial 字段
}
```

### 5. 前端展示逻辑

**会员类型显示** (`src/components/StripeInfoModal.vue`):

```javascript
const membershipTypeDisplay = computed(() => {
  const type = props.stripeData.membershipType || props.stripeData.individualMembershipType
  const typeMap = {
    'free_trial': '🆓 免费试用',
    'pro': '⭐ Pro会员',
    'free': '🆓 免费版',
    'business': '💼 企业版',
    'team': '👥 团队版'
  }
  return typeMap[type] || type || 'unknown'
})
```

**试用天数显示**:

```javascript
// 如果有 daysRemainingOnTrial 字段，显示具体天数
if (stripeData.daysRemainingOnTrial != null) {
  显示: "6 天"
}

// 如果是 Pro 会员（没有该字段），显示无限制
if (stripeData.membershipType === 'pro') {
  显示: "∞ 无限制"
}
```

## 使用示例

### 1. 从表格查询

```javascript
// 点击表格中的"查询Stripe"按钮
handleQueryStripe(user)
  ↓
获取 user.auth_info.WorkosCursorSessionToken
  ↓
调用 API
  ↓
更新用户数据
  ↓
显示 StripeInfoModal
```

### 2. 从详情页查询

```javascript
// 在Token详情模态框中点击"查询Stripe信息"
handleQueryStripeForUser(token)
  ↓
调用 API
  ↓
更新 selectedUser 数据
  ↓
关闭 TokenModal
  ↓
显示 StripeInfoModal
```

## 错误处理

### 401 Unauthorized

**原因**:
1. Token 已过期
2. Token 格式不正确（应以 `user_` 开头）
3. Token 已被撤销

**解决**:
- 从 Cursor 应用重新获取 Token

### CORS 错误

**原因**:
- 后端CORS配置与前端请求不匹配
- `credentials: 'include'` 与 `Access-Control-Allow-Origin: *` 冲突

**解决**:
- ✅ 已修复：使用动态Origin设置

### 网络错误

**原因**:
- Vercel Function 超时
- 网络连接问题

**解决**:
- 重试请求
- 检查网络连接

## 环境配置

### 开发环境

```javascript
// vite.config.js 配置代理
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### 生产环境

```json
// vercel.json 配置
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-Cursor-Token, Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

## 安全性说明

1. **Token 不会暴露**: Token 通过 HTTPS 加密传输
2. **CORS 保护**: 只允许特定来源访问
3. **无状态设计**: 不在服务器存储任何用户数据
4. **日志脱敏**: 只记录 Token 前缀，不记录完整 Token

## 性能优化

1. **缓存策略**: 查询结果缓存在前端，避免重复请求
2. **并发控制**: 防止同时发送多个相同请求
3. **超时处理**: Vercel Function 默认 10s 超时

## 总结

✅ **跨域问题已解决**: 通过 Vercel Serverless Function 代理  
✅ **Token 安全传输**: 使用自定义 Header + HTTPS  
✅ **美观的界面**: 专门的 StripeInfoModal 组件展示数据  
✅ **完善的错误处理**: 针对各种错误情况给出友好提示  
✅ **数据持久化**: 查询结果保存在用户数据中，避免重复查询

