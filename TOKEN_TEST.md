# 🔍 Token验证指南

如果遇到401错误，说明Token可能有问题。按以下步骤验证：

---

## ✅ 步骤1：验证Token格式

正确的Token格式：
```
user_01ABCDEFGHIJKLMNOPQRSTUVWXYZ1234
```

特征：
- ✅ 以 `user_` 开头
- ✅ 长度约40-50字符
- ✅ 包含字母和数字

---

## 🧪 步骤2：使用curl直接测试

**在命令行执行：**

```bash
# 替换YOUR_TOKEN为实际Token
curl -v "https://www.cursor.com/api/auth/stripe" \
  -H "Cookie: WorkosCursorSessionToken=YOUR_TOKEN" \
  -H "User-Agent: Mozilla/5.0"
```

**预期结果：**

✅ **成功（200）：**
```json
{
  "subscription": {...},
  "customer": {...}
}
```

❌ **失败（401）：**
```
Unauthorized
```
说明Token无效，需要重新获取。

---

## 📁 步骤3：从Cursor应用获取新Token

### Windows

1. 打开文件管理器，输入：
   ```
   %APPDATA%\Cursor\User\globalStorage
   ```

2. 查找包含 `WorkosCursorSessionToken` 的文件

3. 可能的位置：
   - `storage.json`
   - `state.vscdb`（SQLite数据库）
   - 各个扩展的存储文件

### Mac

```bash
cd ~/Library/Application\ Support/Cursor/User/globalStorage
grep -r "WorkosCursorSessionToken" .
```

### Linux

```bash
cd ~/.config/Cursor/User/globalStorage
grep -r "WorkosCursorSessionToken" .
```

---

## 🔧 步骤4：提取Token

### 方法1：查看storage.json

```json
{
  "WorkosCursorSessionToken": "user_01XXXXX..."
}
```

### 方法2：使用SQLite工具

如果Token存储在 `.vscdb` 文件中：

```bash
# 安装SQLite工具
# Windows: 下载 sqlite3.exe
# Mac: brew install sqlite3
# Linux: apt-get install sqlite3

# 查询Token
sqlite3 state.vscdb "SELECT * FROM ItemTable WHERE key LIKE '%WorkosCursorSessionToken%'"
```

---

## 🎯 步骤5：测试新Token

获取新Token后：

### 5.1 先用curl测试
```bash
curl "https://www.cursor.com/api/auth/stripe" \
  -H "Cookie: WorkosCursorSessionToken=新的Token"
```

### 5.2 如果curl成功，在应用中使用

1. 更新JSON数据中的Token
2. 重新导入
3. 点击"🔍 查询Stripe"

应该能成功了！

---

## 💡 常见原因

### 401错误的原因

| 原因 | 可能性 | 解决方案 |
|------|--------|---------|
| Token过期 | 🔴 高 | 重新登录Cursor获取新Token |
| Token格式错误 | 🟡 中 | 检查是否包含完整Token |
| Token被撤销 | 🟡 中 | 重新登录 |
| Cursor账户问题 | 🟢 低 | 检查账户状态 |

---

## 📝 调试检查清单

部署最新版本后：

- [ ] 访问 `/health` 返回200
- [ ] 查看浏览器Console，Token前缀正确
- [ ] 查看Vercel Logs，后端收到Token
- [ ] 使用curl直接测试Cursor API
- [ ] Token以 `user_` 开头
- [ ] Token长度正确（40-50字符）
- [ ] 从Cursor重新登录获取新Token

---

## 🆘 如果还是401

**可能的情况：**

1. **Cursor API改变了认证方式**
   - 可能需要额外的header
   - 可能需要其他认证信息

2. **Token确实无效**
   - 重新登录Cursor应用
   - 生成新的Token

3. **需要额外的权限**
   - 确认是Pro用户
   - 检查订阅状态

---

## 📞 获取帮助

如果上述步骤都尝试过仍然401：

1. 检查Cursor官方文档
2. 访问Cursor社区论坛
3. 确认API端点是否仍然有效

---

**关键：先用curl直接测试Cursor API，确认Token是否有效！** 🔑

