# 🧪 快速测试指南

## 1️⃣ 启动服务（必须）

```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh && ./start.sh
```

等待服务启动完成（约5-10秒）。

---

## 2️⃣ 测试后端接口

### 测试健康检查
```bash
curl http://localhost:3001/health
```

**预期输出：**
```json
{
  "status": "ok",
  "time": "2025-10-07T12:00:00.000Z"
}
```

### 测试订阅接口
```bash
curl -X POST http://localhost:3001/api/check-stripe \
  -H "Content-Type: application/json" \
  -d '{"token": "你的WorkosCursorSessionToken"}'
```

**预期输出（成功）：**
```json
{
  "membershipType": "pro",
  "daysRemainingOnTrial": null,
  "subscriptionStatus": "active"
}
```

**预期输出（失败）：**
```json
{
  "error": "HTTP 401"
}
```

### 测试用量接口
```bash
curl -X POST http://localhost:3001/api/check-usage \
  -H "Content-Type: application/json" \
  -d '{"token": "你的WorkosCursorSessionToken"}'
```

**预期输出：**
```json
{
  "totalCostCents": 1250,
  "events": [...],
  ...
}
```

---

## 3️⃣ 测试前端界面

### 访问页面
打开浏览器：http://localhost:5173

### 测试查询功能
1. **获取测试 Token**
   - 登录 https://cursor.com
   - 按 F12 → Application → Cookies
   - 复制 `WorkosCursorSessionToken`

2. **执行查询**
   - 粘贴 Token 到输入框
   - 点击 "🚀 查询信息"
   - 等待 2-3 秒

3. **查看结果**
   - ✅ 会员类型显示正确
   - ✅ 剩余天数显示正确（如果是试用账号）
   - ✅ 用量费用显示正确

---

## 4️⃣ 常见问题排查

### ❌ 后端无法启动
```bash
# 检查端口是否被占用
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Linux/Mac

# 清理并重装
cd server
rm -rf node_modules package-lock.json
npm install
npm start
```

### ❌ 前端无法启动
```bash
# 清理并重装
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ 查询返回 401
**原因**：Token 已失效

**解决**：
1. 重新登录 cursor.com
2. 获取新的 Token
3. 再次查询

### ❌ 查询返回 500
**原因**：后端服务未启动或网络问题

**解决**：
1. 确认后端正在运行
2. 访问 http://localhost:3001/health
3. 检查防火墙设置

---

## 5️⃣ 快速验证命令

```bash
# 一键验证所有服务
# Windows (PowerShell)
echo "Testing backend health..."
curl http://localhost:3001/health

echo "Testing frontend..."
curl http://localhost:5173

# Linux/Mac
echo "Testing backend health..." && \
curl http://localhost:3001/health && \
echo "\nTesting frontend..." && \
curl -I http://localhost:5173
```

---

## 6️⃣ 性能测试

### 测试单次查询耗时
```bash
time curl -X POST http://localhost:3001/api/check-stripe \
  -H "Content-Type: application/json" \
  -d '{"token": "your_token"}'
```

**预期耗时**：< 2秒

### 测试并发查询（可选）
```bash
# 使用 Apache Bench (需要安装)
ab -n 10 -c 5 -p data.json -T application/json \
  http://localhost:3001/api/check-stripe
```

---

## ✅ 测试通过标准

- [x] 后端健康检查返回 200
- [x] 前端页面正常访问
- [x] 订阅接口返回正确数据
- [x] 用量接口返回正确数据
- [x] 前端查询功能正常
- [x] 错误提示清晰明确

---

**测试完成！** 🎉

如有问题，请查看：
- [USAGE.md](./USAGE.md) - 详细使用说明
- [README.md](./README.md) - 项目介绍
- [CHANGELOG_v2.md](./CHANGELOG_v2.md) - 更新日志

