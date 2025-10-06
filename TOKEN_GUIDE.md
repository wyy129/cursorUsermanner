# 🔑 获取有效Token指南

## ⚠️ 当前问题

看到这个错误说明Token已经**失效或过期**：
```json
{
  "error": "not_authenticated",
  "description": "The user does not have an active session or is not authenticated"
}
```

## 📋 如何获取有效的Token

### 方式1: 从浏览器Cookie获取（最推荐）

1. **登录Cursor网站**
   - 访问 https://www.cursor.com
   - 登录你的账号

2. **打开开发者工具**
   - 按 `F12` 或 `Ctrl+Shift+I`
   - 切换到 **Application** 标签（或 **存储** 标签）

3. **查找Cookie**
   - 左侧找到 `Cookies` → `https://www.cursor.com`
   - 找到 `WorkosCursorSessionToken`
   - 复制完整的值

4. **验证Token格式**
   - Token应该包含 `::` 分隔符
   - 格式: `user_xxxxxxxx::eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - 如果看到 `%3A%3A`，说明是URL编码的（系统会自动解码）

### 方式2: 从Network请求获取

1. **登录Cursor并打开F12**
   - 切换到 **Network** 标签
   - 刷新页面或进行任何操作

2. **查找API请求**
   - 在请求列表中找到任何 `cursor.com` 的请求
   - 点击查看 **Request Headers**
   - 找到 `Cookie` 字段中的 `WorkosCursorSessionToken`

3. **复制Token**
   - 只复制Token的值部分
   - 不要包含 `WorkosCursorSessionToken=` 前缀

### 方式3: 从Cursor客户端获取

1. **找到存储位置**
   
   **Windows**:
   ```
   %APPDATA%\Cursor\User\globalStorage\storage.json
   ```
   
   **macOS**:
   ```
   ~/Library/Application Support/Cursor/User/globalStorage/storage.json
   ```
   
   **Linux**:
   ```
   ~/.config/Cursor/User/globalStorage/storage.json
   ```

2. **搜索Token**
   - 打开 `storage.json` 文件
   - 搜索 `WorkosCursorSessionToken`
   - 复制对应的值

## ✅ 验证Token有效性

### 使用浏览器Console测试

```javascript
// 在 cursor.com 页面的Console中运行
fetch('https://www.cursor.com/api/auth/stripe', {
    credentials: 'include'
})
.then(r => r.json())
.then(data => {
    console.log('✅ Token有效!', data);
    console.log('会员类型:', data.membershipType);
    console.log('剩余天数:', data.daysRemainingOnTrial);
})
.catch(err => console.error('❌ Token无效:', err));
```

如果返回数据，说明Token有效。如果返回401，说明需要重新登录。

### 使用curl测试

```bash
curl 'https://www.cursor.com/api/auth/stripe' \
  -H 'Cookie: WorkosCursorSessionToken=你的Token' \
  -v
```

看到200响应说明Token有效。

## 🔄 Token有效期

- **Web Token**: 通常7-30天
- **Client Token**: 可能更长
- **过期标志**: 返回401错误

## 📝 正确的数据格式

导入系统的JSON应该包含有效Token：

```json
[
  {
    "email": "user@example.com",
    "auth_info": {
      "WorkosCursorSessionToken": "user_xxxxxxxx::eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "membershipType": "pro",
    "tokenValidity": true
  }
]
```

**关键点**：
- ✅ Token必须是最新获取的
- ✅ Token格式必须正确（包含`::`）
- ✅ Token不能是从旧备份中获取的

## 🐛 常见问题

### Q: Token看起来正确但还是401
**A**: Token可能已经过期，需要重新登录获取新Token

### Q: 能在浏览器使用但在系统中401
**A**: 确保Token完整复制，没有截断或多余空格

### Q: Token太长复制不全
**A**: 
1. 双击Token值选中全部
2. 或者右键 → Copy Value
3. 在文本编辑器中检查是否完整

### Q: 如何知道Token何时过期
**A**: 
- Token中包含exp字段（JWT格式）
- 可以用这个工具解析: https://jwt.io
- 或者简单地：定期重新获取

## 💡 最佳实践

1. **定期更新Token**
   - 建议每周或每月更新一次
   - 在Token过期前主动更新

2. **安全存储**
   - 不要将Token提交到公开仓库
   - 不要在公共场所展示Token
   - Token等同于你的账号密码

3. **测试后使用**
   - 获取新Token后先在浏览器Console测试
   - 确认有效后再导入系统

4. **备份管理**
   - 保存Token的同时记录获取时间
   - 方便判断是否需要更新

## 🎯 下一步

1. **获取新Token** - 按照上述方法获取最新Token
2. **验证有效性** - 在浏览器Console测试
3. **更新数据** - 将新Token更新到JSON中
4. **重新导入** - 在系统中重新导入数据
5. **测试查询** - 点击查询按钮测试

如果按照以上步骤操作，应该就能成功查询了！🎉

