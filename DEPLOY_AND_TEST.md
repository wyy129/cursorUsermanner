# 🚀 部署并测试指南

## 📦 立即部署

### 1. 提交代码到 Git

```bash
# 添加所有修改
git add .

# 提交（带详细说明）
git commit -m "fix: 修复401错误，添加详细调试日志和Token测试工具

- 添加详细的Vercel Function日志
- 增强前端错误显示（含调试信息）
- 新增TokenTester组件快速测试Token
- 创建TROUBLESHOOTING_401.md诊断指南
- CORS问题已解决（401不是跨域问题）"

# 推送到远程仓库（触发Vercel自动部署）
git push origin main
```

### 2. 等待 Vercel 部署

- 部署通常需要 **1-3 分钟**
- 访问 [Vercel Dashboard](https://vercel.com/dashboard) 查看部署状态
- 看到 ✅ "Deployment Ready" 后继续

---

## 🧪 测试步骤

### 第一步：使用 Token 测试工具

1. **访问网站**：https://cursor-usermanner.vercel.app

2. **点击顶部按钮**：`🔬 显示Token测试工具`

3. **粘贴您的 Token**（从 Cursor 应用获取）

4. **点击**：`🧪 测试 Token`

5. **查看结果**：
   - ✅ **成功**：显示绿色框，Token 有效，可以正常使用
   - ❌ **失败**：显示红色框，Token 无效，需要重新获取

**这是最快的测试方法！可以立即知道 Token 是否有效。**

---

### 第二步：查看 Vercel 日志（如果测试失败）

1. **访问** [Vercel Dashboard](https://vercel.com/dashboard)

2. **选择项目** `cursor-usermanner`

3. **点击** "Deployments" → 最新部署

4. **点击** "Functions" 标签

5. **找到** `/api/auth/stripe` 函数

6. **查看日志**，会显示详细信息：

```log
[API] === 开始处理请求 ===
[API] 请求方法: GET
[API] Origin: https://cursor-usermanner.vercel.app
[API] 从 X-Cursor-Token header 获取: 存在，长度45
[API] ✅ Token获取成功！
[API] Token长度: 45
[API] Token前缀: user_2XXXXXXXXXX...
[API] Token格式检查: ✅ 正确
[API] 准备转发请求到 Cursor API...
[API] ⬅️ Cursor API响应状态: 401 Unauthorized  👈 关键信息
[API] ❌ Cursor API返回错误: 401
```

**关键点**：如果日志显示 `401 Unauthorized`，说明：
- ✅ 代码工作正常
- ✅ Token 成功发送到 Cursor
- ❌ Cursor 拒绝了这个 Token（已过期或无效）

---

### 第三步：浏览器开发者工具

1. **按 F12** 打开开发者工具

2. **切换到 Network 标签**

3. **点击"查询Stripe"按钮**

4. **查看请求详情**：

```
Request URL: https://cursor-usermanner.vercel.app/api/auth/stripe
Request Method: GET
Status Code: 401 Unauthorized

Request Headers:
  X-Cursor-Token: user_2XXXXXXXXXX...
  Origin: https://cursor-usermanner.vercel.app
  Content-Type: application/json

Response Headers:
  Access-Control-Allow-Origin: https://cursor-usermanner.vercel.app ✅
  Access-Control-Allow-Credentials: true ✅
  Access-Control-Allow-Headers: X-Cursor-Token, Content-Type ✅
```

**✅ 如果看到上述 CORS 响应头，说明跨域问题已解决！**

---

## 🔍 问题诊断流程图

```
401 错误
  ↓
是否看到 CORS 响应头？
  │
  ├─ 是 → ✅ 跨域已解决
  │        ↓
  │      Token 是问题根源
  │        ↓
  │      使用 Token 测试工具
  │        ↓
  │      ├─ 成功 → Token 有效，但为何查询失败？
  │      │           → 查看 Vercel 日志找原因
  │      │
  │      └─ 失败 → Token 无效
  │                → 从 Cursor 重新获取最新 Token
  │
  └─ 否 → ❌ 仍有跨域问题
           → 检查 vercel.json 配置
           → 检查 api/auth/stripe.js CORS 设置
```

---

## ✅ 成功标志

### 1. Token 测试工具显示成功

```
✅ Token 有效！

会员类型：🆓 免费试用
剩余天数：6 天
订阅状态：trialing

✅ 此 Token 可以正常使用！
```

### 2. Vercel 日志显示成功

```log
[API] ✅ Token获取成功！
[API] ⬅️ Cursor API响应状态: 200 OK
[API] ✅ 请求成功！
```

### 3. 查询后弹出美观的订阅信息窗口

- 显示会员类型、剩余天数、订阅状态
- 界面美观，使用渐变色和徽章
- 包含完整的用户信息

### 4. Network 面板显示

```
Status Code: 200 OK
Response Headers:
  Access-Control-Allow-Origin: https://cursor-usermanner.vercel.app
  Access-Control-Allow-Credentials: true

Response Body:
{
  "membershipType": "free_trial",
  "daysRemainingOnTrial": 6,
  ...
}
```

---

## ❌ 401 错误 = Token 问题（不是跨域！）

### 重要概念

| 错误类型 | 现象 | 原因 |
|---------|------|------|
| **跨域错误** | 状态码：`(failed)` 或 `CORS error`<br>Console 红色：`blocked by CORS policy` | CORS 配置错误 |
| **401 错误** | 状态码：`401 Unauthorized`<br>有 CORS 响应头 | Token 无效或已过期 |

**您现在看到的 401 = Token 问题，不是跨域问题！** ✅

---

## 🔧 快速解决 401 的方法

### 方案1：使用测试工具（推荐）

1. 点击 `🔬 显示Token测试工具`
2. 粘贴 Token
3. 点击测试
4. 如果失败，按提示重新获取 Token

### 方案2：重新获取 Token

1. **打开 Cursor 应用**

2. **打开开发者工具**（F12）

3. **进入存储**：
   - Chrome: `Application` → `Cookies` → `https://www.cursor.com`
   - Firefox: `Storage` → `Cookies` → `https://www.cursor.com`

4. **复制 WorkosCursorSessionToken 的值**
   - 确保复制完整
   - 不要包含空格或换行

5. **更新您的数据并重新导入**

### 方案3：使用 curl 直接测试

```bash
# 替换 YOUR_TOKEN 为您的实际 Token
curl -X GET \
  -H "Cookie: WorkosCursorSessionToken=YOUR_TOKEN" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Accept: application/json" \
  -H "Origin: https://www.cursor.com" \
  -H "Referer: https://www.cursor.com/" \
  https://www.cursor.com/api/auth/stripe
```

**如果 curl 返回 401**：说明 Token 确实无效，需要重新获取

**如果 curl 返回 200**：说明 Token 有效，但在网站上无法使用，需要进一步诊断

---

## 📊 新增功能

### 1. Token 测试工具 (TokenTester.vue)

- 🧪 快速测试 Token 是否有效
- ✅ 显示会员信息（如果成功）
- 📊 详细的错误诊断和解决建议
- 🔍 调试信息（Token 长度、格式检查等）

### 2. 增强的错误显示

当查询失败时，弹窗会显示：
- 📋 服务器返回的完整错误信息
- 🔍 调试信息（Token 前缀、长度、完整响应）
- ⚠️ 可能的原因分析
- 💡 解决方法步骤
- 📝 如何重新获取 Token 的指南

### 3. 详细的 Vercel 日志

后端现在记录：
- 请求方法和来源
- 所有请求头
- Token 获取过程
- Token 格式验证
- 发送给 Cursor 的请求头
- Cursor 的响应状态和内容

### 4. 完整的诊断文档

- `TROUBLESHOOTING_401.md`：401 错误完整诊断指南
- `API_REQUEST_FLOW.md`：API 请求流程说明
- `DEPLOY_AND_TEST.md`（本文件）：部署和测试指南

---

## 🎯 最终确认清单

部署后，按此清单确认一切正常：

- [ ] ✅ 代码已推送到 GitHub
- [ ] ✅ Vercel 部署成功（显示绿色勾）
- [ ] ✅ 访问网站能正常加载
- [ ] ✅ Token 测试工具显示并可用
- [ ] ✅ 粘贴测试 Token 能得到结果
- [ ] ✅ 如果 401，错误信息详细清晰
- [ ] ✅ Vercel 日志可查看且有详细信息
- [ ] ✅ Network 面板显示 CORS 响应头

**如果所有勾选完成，说明部署成功！** 🎉

**如果仍然有 401**，那是 Token 的问题，不是代码问题！使用测试工具快速诊断。

---

## 💡 关键要点

1. **401 ≠ 跨域问题**
   - 401 说明请求成功了，只是 Token 验证失败
   - 跨域错误会显示完全不同的错误信息

2. **使用测试工具快速诊断**
   - 不用导入完整数据
   - 直接粘贴 Token 即可测试
   - 立即知道 Token 是否有效

3. **查看 Vercel 日志获取详情**
   - 日志会显示完整的请求和响应过程
   - 能看到 Token 是否正确传递
   - 能看到 Cursor API 的实际返回

4. **Token 可能会过期**
   - Cursor Token 有时效性
   - 登出重登后 Token 会变化
   - 修改密码后旧 Token 失效

---

## 🆘 需要帮助？

如果按照本指南仍然无法解决，请提供：

1. **Token 测试工具的截图**（显示测试结果）
2. **Vercel Function 日志**（完整的日志输出）
3. **浏览器 Network 面板截图**（显示请求和响应头）
4. **Token 前缀**（前 20 个字符）
5. **Token 长度**（字符数）

这些信息能帮助快速定位问题！🎯

---

## 🎉 最后

部署后，先用 Token 测试工具快速测试！这是最快的方法！

祝您部署顺利！🚀

