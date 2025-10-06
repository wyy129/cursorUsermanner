# 🔍 调试指南

如果遇到504超时错误，请按以下步骤排查：

## 1. 验证Token是否有效

### 方法1：使用测试脚本

```bash
# 在本地运行测试脚本
python test_api.py "你的WorkosCursorSessionToken"
```

这会直接测试Token是否能访问Cursor API。

### 方法2：使用curl命令

```bash
curl -v -X GET "https://www.cursor.com/api/auth/stripe" \
  -H "Cookie: WorkosCursorSessionToken=你的Token" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Accept: application/json"
```

## 2. 检查Token格式

正确的Token格式应该是：
```
user_01XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

- 以 `user_` 开头
- 后面跟随一串字母数字
- 总长度通常在40-50个字符

## 3. 检查HF Spaces后端日志

1. 访问你的HF Space页面
2. 点击 "Logs" 标签
3. 查看是否有错误信息：
   ```
   [API] 请求Cursor API, Token前10位: user_01XXX...
   [API] 响应状态码: 200
   ```

## 4. 常见问题

### Q1: 一直超时（504）

**可能原因：**
- Token已过期或无效
- Cursor API暂时不可用
- 网络连接问题

**解决：**
1. 获取新的Token
2. 稍后重试
3. 检查Cursor官网是否正常

### Q2: Token从哪里获取？

从Cursor应用的存储中获取：
- Windows: `%APPDATA%\Cursor\User\globalStorage\`
- Mac: `~/Library/Application Support/Cursor/User/globalStorage/`
- Linux: `~/.config/Cursor/User/globalStorage/`

查找包含 `WorkosCursorSessionToken` 的文件。

### Q3: 401错误

**原因：** Token无效或已过期

**解决：** 
1. 重新登录Cursor应用
2. 获取新的Token
3. 重新导入数据

### Q4: 403错误

**原因：** 权限不足或请求被拒绝

**解决：**
1. 确认是Pro用户
2. 检查Token权限
3. 联系Cursor支持

## 5. 手动测试流程

### 步骤1：测试健康检查
```bash
curl https://YOUR_SPACE.hf.space/health
```

应该返回：
```json
{"status":"ok","message":"Cursor User Manager API is running"}
```

### 步骤2：测试API代理
```bash
curl -X GET "https://YOUR_SPACE.hf.space/api/auth/stripe" \
  -H "X-Cursor-Token: 你的Token"
```

### 步骤3：查看详细错误
打开浏览器开发者工具 (F12) → Console 标签，查看详细错误信息。

## 6. 临时解决方案

如果HF Spaces一直超时，可以：

### 方案1：本地运行（推荐）
```bash
npm run dev
```
本地Vite代理通常更快更稳定。

### 方案2：使用其他部署平台
- Vercel
- Netlify
- Railway
- Render

### 方案3：仅使用数据管理功能
不依赖API查询，仅使用本地数据管理功能。

## 7. 性能优化建议

如果Token有效但响应慢：

1. **减少并发请求**
   - 不要同时查询多个用户
   - 等待一个查询完成后再查询下一个

2. **使用缓存**
   - 对于同一用户，短时间内不要重复查询
   - 可以将查询结果缓存到本地

3. **检查网络**
   - HF Spaces的网络可能有限制
   - 尝试在网络良好时使用

## 8. 获取帮助

如果以上方法都无法解决：

1. 查看HF Spaces文档
2. 提交Issue到项目仓库
3. 检查Cursor官方论坛

---

**记住：** API查询功能依赖于：
- ✅ 有效的Token
- ✅ 稳定的网络
- ✅ Cursor API服务正常

如果其中任何一项有问题，都可能导致超时或失败。

