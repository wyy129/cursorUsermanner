# ⚡ 快速开始指南

## 🎯 一分钟快速启动

### Windows 用户

```bash
# 1. 一键安装所有依赖
npm run setup

# 2. 一键启动（双击即可）
start.bat
```

### Linux/Mac 用户

```bash
# 1. 一键安装所有依赖
npm run setup

# 2. 一键启动
chmod +x start.sh
./start.sh
```

### 访问应用

- 前端：http://localhost:3000
- 后端：http://localhost:3001

## 📝 使用流程

### 1️⃣ 导入用户数据

**方法 A：从文件导入**
- 点击 "从文件导入" 按钮
- 选择 `sample-data.json`

**方法 B：直接粘贴**
- 点击 "粘贴 JSON" 按钮
- 粘贴您的 JSON 数据
- 点击 "导入"

### 2️⃣ 查询 Token 信息

**步骤：**
1. 找到 "账号信息查询" 卡片
2. ✅ **开启 "使用后端代理" 开关**（重要！）
3. 粘贴 `WorkosCursorSessionToken`
4. 点击 "查询账号信息"

**Token 获取方式：**
- 从导入的 JSON 数据中提取
- 或从浏览器 Cookie 中复制

### 3️⃣ 查看数据

- **统计卡片** - 总览关键指标
- **数据表格** - 浏览所有用户
- **搜索框** - 快速过滤
- **详情按钮** - 查看完整信息

## 🔧 常用命令

```bash
# 安装所有依赖（首次使用）
npm run setup

# 仅启动前端
npm run dev

# 仅启动后端代理
npm run proxy

# 构建生产版本
npm run build
```

## 💡 快速技巧

### 技巧 1：快速测试
使用项目自带的 `sample-data.json`：
```bash
# 界面上点击 "从文件导入"，选择 sample-data.json
```

### 技巧 2：批量查询
从导入的数据中提取所有 Token，然后逐个查询。

### 技巧 3：导出结果
使用浏览器的打印功能（Ctrl+P）导出数据表格。

## ⚠️ 注意事项

### ✅ 推荐做法
- 使用后端代理模式查询
- 保持 Token 私密性
- 定期更新 Token

### ❌ 避免的做法
- 不要在公共网络使用
- 不要分享 Token
- 不要频繁请求（避免限流）

## 🆘 遇到问题？

### 问题 1：后端启动失败
```bash
# 检查 Node.js 版本
node --version  # 需要 >= 14

# 重新安装依赖
cd server
rm -rf node_modules
npm install
```

### 问题 2：308 重定向错误
✅ **解决**：确保开启 "使用后端代理" 开关

### 问题 3：查询返回 401
✅ **解决**：Token 可能已过期，重新获取

### 问题 4：端口被占用
修改配置：
```javascript
// server/proxy.js
const PORT = 3002  // 改为其他端口
```

## 📚 更多文档

- [完整 README](./README.md) - 详细功能说明
- [308 问题解决方案](./SOLUTION_308.md) - 重定向问题完整指南
- [代理服务配置](./PROXY_SETUP.md) - 后端服务详细配置
- [Token 示例](./TOKEN_EXAMPLE.md) - Token 使用示例

## 🎉 开始使用！

现在您已经准备好了！运行启动脚本，开始管理您的 Cursor 用户数据吧！

```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

祝使用愉快！ 🚀





