# 📝 更新日志 v2.0 - 精简版

## 🎯 更新概述

**日期**：2025-10-07  
**版本**：v2.0.0 - 精简重构版  
**参考**：Python `cursor_account_manager.py` 的 API 实现

---

## 🔥 主要变更

### 1. API 调用精简 (`src/utils/api.js`)

#### 变更前（v1.x）
```javascript
// 复杂的多方式调用逻辑
export async function fetchStripeInfo(sessionToken) {
  // 尝试直接调用
  // 尝试代理调用
  // 智能切换...
}

export async function fetchStripeInfoViaBackend(sessionToken)
export async function fetchStripeInfoSmart(sessionToken)
export async function fetchBatchStripeInfo(sessionTokens, onProgress)
```
**问题**：
- 代码冗余，函数太多
- 直接调用会遇到 CORS 问题
- 用户需要手动切换模式

#### 变更后（v2.0）
```javascript
// 精简的三个核心函数
export async function checkSubscription(sessionToken)  // 订阅接口
export async function checkUsage(sessionToken)          // 用量接口
export async function checkAll(sessionToken)            // 同时查询
```
**优化**：
- ✅ 统一使用后端代理，无需模式切换
- ✅ 函数职责单一，逻辑清晰
- ✅ 完全参考 Python 实现

---

### 2. TokenChecker 组件精简 (`src/components/TokenChecker.vue`)

#### 变更前（v1.x）
```vue
<!-- 复杂的模式切换界面 -->
<div class="mode-switch">
  <input type="checkbox" v-model="useBackend">
  <span>使用后端代理</span>
</div>

<!-- 复杂的错误处理和重试逻辑 -->
<div v-if="!useBackend" class="error-action">
  <button @click="useBackend = true; checkToken()">
    切换到后端代理模式重试
  </button>
</div>
```
**代码行数**：~536 行

#### 变更后（v2.0）
```vue
<!-- 简洁的输入界面 -->
<textarea v-model="sessionToken"></textarea>
<button @click="checkToken">🚀 查询信息</button>

<!-- 简洁的结果展示 -->
<div class="info-grid">
  <div class="info-item">会员类型</div>
  <div class="info-item">剩余试用天数</div>
  <div class="info-item">用量费用</div>
</div>
```
**代码行数**：~326 行

**优化**：
- ✅ 移除模式切换开关
- ✅ 统一使用 `checkAll()` 同时查询订阅和用量
- ✅ 精简样式，保留核心功能
- ✅ 代码减少 39%

---

### 3. 后端代理重构 (`server/proxy.js`)

#### 变更前（v1.x）
```javascript
// 复杂的多方式尝试逻辑
async function checkStripe(token) {
  // 方式1：Cookie Header
  let response = await fetch('...', { headers: { Cookie: ... }})
  
  // 方式2：POST with Form Data
  if (!response.ok) {
    response = await fetch('...', { method: 'POST', body: formData })
  }
  
  // 方式3：Query Parameter
  if (!response.ok) {
    response = await fetch('...?token=...')
  }
}
```
**问题**：
- 三种方式依次尝试，逻辑复杂
- 只支持订阅接口，不支持用量接口

#### 变更后（v2.0）
```javascript
// 精简的单一方式（参考 Python）
app.post('/api/check-stripe', async (req, res) => {
  const response = await fetch('https://www.cursor.com/api/auth/stripe', {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0...',
      'Cookie': `WorkosCursorSessionToken=${token}`
    }
  })
  res.json(await response.json())
})

// 新增用量接口
app.post('/api/check-usage', async (req, res) => {
  const payload = {
    teamId: -1,
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
    endDate: Date.now()
  }
  
  const response = await fetch('https://cursor.com/api/dashboard/get-aggregated-usage-events', {
    method: 'POST',
    headers: { 'Cookie': `WorkosCursorSessionToken=${token}` },
    body: JSON.stringify(payload)
  })
  res.json(await response.json())
})
```

**优化**：
- ✅ 完全参考 Python 的请求头和参数
- ✅ 新增用量接口支持
- ✅ 代码更清晰，易维护

---

## 📊 对比总结

| 项目 | v1.x | v2.0 | 改进 |
|------|------|------|------|
| **API 函数** | 4个 | 3个 | 精简 25% |
| **TokenChecker.vue** | 536行 | 326行 | 精简 39% |
| **支持接口** | 1个（订阅） | 2个（订阅+用量） | 功能增强 |
| **模式切换** | 需要手动 | 自动 | 用户体验提升 |
| **代码风格** | 复杂 | 简洁 | 可维护性提升 |

---

## 🎯 核心设计思想

### Python 实现的精华
```python
# cursor_account_manager.py (第62-173行)
def run(self):
    # 根据API类型选择URL和方法
    if self.api_type == "aggregated":
        url = "https://cursor.com/api/dashboard/get-aggregated-usage-events"
        method = "POST"
    else:  # stripe
        url = "https://www.cursor.com/api/auth/stripe"
        method = "GET"
    
    # 使用cookies字典传递session token
    cookies = {'WorkosCursorSessionToken': self.token}
    
    # 根据方法类型发送请求
    if method == "POST":
        response = requests.post(url, headers=headers, cookies=cookies, 
                                data=payload, timeout=15, verify=False)
    else:
        response = requests.get(url, headers=headers, cookies=cookies, 
                               timeout=10, verify=False)
```

### Vue 实现的对应
```javascript
// src/utils/api.js - 订阅接口
export async function checkSubscription(sessionToken) {
  const response = await fetch('/api/check-stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: sessionToken })
  })
  return await response.json()
}

// src/utils/api.js - 用量接口
export async function checkUsage(sessionToken) {
  const response = await fetch('/api/check-usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: sessionToken })
  })
  return await response.json()
}

// src/utils/api.js - 同时查询
export async function checkAll(sessionToken) {
  const [sub, usage] = await Promise.all([
    checkSubscription(sessionToken),
    checkUsage(sessionToken)
  ])
  return { subscription: sub, usage: usage }
}
```

---

## 🚀 迁移指南

### 从 v1.x 升级到 v2.0

**1. 更新依赖**
```bash
# 拉取最新代码
git pull

# 重新安装依赖
npm install
cd server && npm install
```

**2. 代码修改（如果有自定义）**
```javascript
// 旧代码（v1.x）
import { fetchStripeInfoViaBackend } from './utils/api.js'
const result = await fetchStripeInfoViaBackend(token)

// 新代码（v2.0）
import { checkAll } from './utils/api.js'
const result = await checkAll(token)
// result.subscription - 订阅信息
// result.usage - 用量信息
```

**3. 重启服务**
```bash
# 使用一键启动脚本
./start.bat  # Windows
./start.sh   # Linux/Mac
```

---

## ✅ 测试清单

- [x] 订阅接口正常工作
- [x] 用量接口正常工作
- [x] 同时查询功能正常
- [x] 前端界面显示正确
- [x] 错误处理完善
- [x] 无 Lint 错误
- [x] 文档完整

---

## 📚 相关文档

- [USAGE.md](./USAGE.md) - 详细使用指南
- [README.md](./README.md) - 项目介绍
- [cursor_account_manager.py](./cursor_account_manager.py) - Python 参考实现

---

**更新完成！** 🎉

代码更精简、功能更强大、维护更容易！

