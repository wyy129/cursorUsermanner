# 🚀 部署和测试指南

## 问题分析

从日志发现问题：
```
"Cookie": "WorkosCursorSessionToken=user_01K64SXMZ70RYAHKA688T4DYDZ%3A%3A..."
```

Cookie中的`%3A%3A`（URL编码）应该是`::`（已解码）。

## 修复内容

### ✅ API函数 (`api/auth/stripe.js`)
- 自动检测并解码URL编码的Token
- 添加详细日志输出Token处理过程
- 验证Token格式（必须包含`::`分隔符）

### ✅ 前端 (`index.html`)
- 发送前确保Token已解码
- 添加控制台日志便于调试
- 改进错误提示信息

## 部署步骤

### 方式1: 重新部署（推荐）

```bash
# 提交更改
git add .
git commit -m "fix: 修复Token URL编码问题"
git push

# 重新部署
vercel --prod
```

### 方式2: 直接部署

```bash
vercel --prod
```

## 测试步骤

### 1. 查看日志

部署后，在Vercel Dashboard中查看Function Logs，应该看到：

```
[API] 收到Token（原始）: user_01K64SXMZ70RYAHKA688T4DYDZ%3A%3A...
[API] Token已解码: user_01K64SXMZ70RYAHKA688T4DYDZ::...
[API] 最终Token: user_01K64SXMZ70RYAHKA688T4DYDZ::...
[API] Cursor API响应: 200
```

### 2. 浏览器控制台

打开浏览器F12控制台，应该看到：

```
[前端] Token已解码
[前端] 发送Token: user_01K64SXMZ70RYAHKA688T4DYDZ::...
```

### 3. 成功标志

- ✅ API返回200状态码
- ✅ 前端显示"✅ 查询成功"
- ✅ 表格行变成绿色背景
- ✅ 会员类型和剩余天数更新

## 验证Token格式

正确的Token应该包含`::`分隔符：
```
user_xxxxxxxx::eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
           ↑↑
         必须是两个冒号，不是%3A%3A
```

## 故障排除

### 问题1: 仍然返回401
**原因**: Token本身无效或已过期  
**解决**: 获取新的Token重新导入数据

### 问题2: 看不到日志中的"Token已解码"
**原因**: Token在JSON中已经是解码状态  
**解决**: 这是好事！说明Token格式正确

### 问题3: CORS错误
**原因**: 浏览器缓存了旧的API响应  
**解决**: 
```bash
# 清除浏览器缓存，或者使用无痕模式
# 或者强制刷新（Ctrl+Shift+R）
```

## 调试命令

### 检查Token格式
```javascript
// 在浏览器Console中运行
const token = "your_token_here";
console.log("包含URL编码:", token.includes('%'));
console.log("包含分隔符:", token.includes('::'));
console.log("解码后:", decodeURIComponent(token));
```

### 手动测试API
```bash
# 使用curl测试
curl -X GET https://your-domain.vercel.app/api/auth/stripe \
  -H "X-Cursor-Token: user_xxx::eyJhbGci..." \
  -v
```

## 预期结果

### 成功响应 (200)
```json
{
  "membershipType": "pro",
  "daysRemainingOnTrial": null,
  "subscriptionStatus": "active",
  "individualMembershipType": "pro"
}
```

### 失败响应 (401)
```json
{
  "error": "not_authenticated",
  "description": "The user does not have an active session or is not authenticated"
}
```

如果仍然返回401，说明Token本身无效，需要获取新Token。

## 快速验证

1. 部署后访问你的Vercel URL
2. 导入包含Token的JSON数据  
3. 点击任意"🔍"按钮
4. 打开浏览器F12查看Console和Network
5. 检查API响应状态和返回数据

**如果看到200状态码和数据返回，说明修复成功！** 🎉

