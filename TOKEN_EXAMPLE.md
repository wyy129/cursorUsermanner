# Token 查询功能使用示例

## 📋 功能说明

通过 `WorkosCursorSessionToken` 查询 Cursor 账号的订阅信息，包括会员类型、试用剩余天数等。

## 🔑 获取 WorkosCursorSessionToken

### 方法一：从浏览器获取

1. 打开 Chrome 浏览器
2. 访问 `https://www.cursor.com`
3. 按 `F12` 打开开发者工具
4. 切换到 `Application` 标签
5. 左侧选择 `Cookies` > `https://www.cursor.com`
6. 找到 `WorkosCursorSessionToken` 并复制其值

### 方法二：从导入的 JSON 数据中提取

如果您导入的 JSON 数据包含 `auth_info` 字段：

```json
{
  "email": "user@example.com",
  "auth_info": {
    "WorkosCursorSessionToken": "user_xxx%3A%3Aeyxxx..."
  }
}
```

直接复制 `WorkosCursorSessionToken` 的值即可。

## 🚀 使用步骤

### 1. 在界面上操作

1. 找到 "账号信息查询" 卡片
2. 在文本框中粘贴您的 `WorkosCursorSessionToken`
3. 点击 "查询账号信息" 按钮
4. 等待查询结果

### 2. 查询结果示例

#### 免费试用账号
```
✓ 查询成功

会员类型: 免费试用
试用剩余天数: 6 天
订阅状态: 试用中
个人会员类型: 免费试用
```

#### Pro 账号
```
✓ 查询成功

会员类型: Pro 会员
订阅状态: 激活
个人会员类型: Pro 会员
```

## 📊 API 返回数据结构

### 试用账号响应示例

```json
{
  "membershipType": "free_trial",
  "paymentId": "cus_T7qZdIqmE8gjZw",
  "daysRemainingOnTrial": 6,
  "subscriptionStatus": "trialing",
  "verifiedStudent": false,
  "trialEligible": false,
  "isOnStudentPlan": false,
  "isOnBillableAuto": false,
  "customerBalance": 0,
  "trialWasCancelled": false,
  "isTeamMember": false,
  "teamMembershipType": null,
  "individualMembershipType": "free_trial"
}
```

### Pro 账号响应示例

```json
{
  "membershipType": "pro",
  "paymentId": "cus_XYZ123456789",
  "subscriptionStatus": "active",
  "verifiedStudent": false,
  "trialEligible": false,
  "isOnStudentPlan": false,
  "isOnBillableAuto": true,
  "customerBalance": 0,
  "isTeamMember": false,
  "teamMembershipType": null,
  "individualMembershipType": "pro"
}
```

**注意**：Pro 账号没有 `daysRemainingOnTrial` 字段。

## 🔧 技术实现

### API 调用方式

```javascript
// 使用 fetch API
const response = await fetch('https://www.cursor.com/api/auth/stripe', {
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*',
    'Cookie': `WorkosCursorSessionToken=${sessionToken}`
  },
  credentials: 'include'
})

const data = await response.json()
```

### Python 实现参考

```python
import requests

# 请求头
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': '*/*'
}

# Cookies
cookies = {
    'WorkosCursorSessionToken': 'your_token_here'
}

# 发送请求
response = requests.get(
    'https://www.cursor.com/api/auth/stripe',
    headers=headers,
    cookies=cookies,
    timeout=10
)

# 获取数据
data = response.json()
print(f"会员类型: {data['membershipType']}")
if 'daysRemainingOnTrial' in data:
    print(f"试用剩余: {data['daysRemainingOnTrial']} 天")
```

## ⚠️ 注意事项

### CORS 问题

由于浏览器的同源策略限制，直接从前端调用可能遇到 CORS 错误：

```
Access to fetch at 'https://www.cursor.com/api/auth/stripe' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**解决方案**：

1. **使用浏览器扩展**（开发环境）
   - 安装 CORS Unblock 扩展
   - 仅在开发时使用

2. **配置代理**（推荐）
   ```javascript
   // vite.config.js
   export default defineConfig({
     server: {
       proxy: {
         '/api': {
           target: 'https://www.cursor.com',
           changeOrigin: true
         }
       }
     }
   })
   ```

3. **使用后端代理**（生产环境）
   - 在后端服务器上创建代理接口
   - 前端调用后端接口，后端转发到 Cursor API

### Token 有效性

- Token 可能会过期，需要重新获取
- 无效的 Token 会返回 401 或 403 错误
- 建议添加错误处理和重试机制

### 请求频率

- 避免频繁请求导致被限流
- 建议添加请求间隔（如 1 秒）
- 批量查询时注意控制并发数

## 🎯 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `membershipType` | string | 会员类型（pro / free_trial / free） |
| `daysRemainingOnTrial` | number | 试用剩余天数（Pro 账号无此字段） |
| `subscriptionStatus` | string | 订阅状态（active / trialing / canceled 等） |
| `paymentId` | string | Stripe 客户 ID |
| `verifiedStudent` | boolean | 是否学生认证 |
| `trialEligible` | boolean | 是否有试用资格 |
| `isOnStudentPlan` | boolean | 是否学生计划 |
| `isTeamMember` | boolean | 是否团队成员 |
| `individualMembershipType` | string | 个人会员类型 |

## 🔍 常见问题

### Q: 查询失败，提示 HTTP 401

**A**: Token 无效或已过期，请重新获取。

### Q: 查询失败，提示 CORS 错误

**A**: 参考上面的 CORS 问题解决方案。

### Q: Pro 账号为什么没有试用天数？

**A**: Pro 正式会员已经不在试用期，因此没有 `daysRemainingOnTrial` 字段。

### Q: 可以批量查询吗？

**A**: 可以，但需要注意：
- 控制请求频率，避免被限流
- 添加适当的延迟（建议 1 秒间隔）
- 实现错误处理和重试逻辑

## 📚 更多资源

- [Cursor 官网](https://www.cursor.com)
- [Stripe API 文档](https://stripe.com/docs/api)
- [项目 README](./README.md)

---

**提示**：请妥善保管您的 WorkosCursorSessionToken，不要泄露给他人！

