# 🚀 Hugging Face Spaces 部署指南

本指南说明如何将Cursor用户管理系统部署到Hugging Face Spaces，并实现完整的在线查询功能。

---

## ✨ 方案说明

通过**Docker SDK**部署，包含：
- **前端**：Vue 3 + Vite构建的静态页面
- **后端**：Python FastAPI代理服务

这样可以完美解决CORS问题，实现在线Cursor API查询！

---

## 📋 部署步骤

### 1. 准备文件

确保仓库中包含以下文件：

```
cursor-user-manager/
├── app.py              # Python后端API
├── requirements.txt    # Python依赖
├── Dockerfile         # Docker构建配置
├── .dockerignore      # Docker忽略文件
├── package.json       # Node.js依赖
├── vite.config.js     # Vite配置
├── src/               # Vue源代码
└── README.md          # 包含HF配置
```

### 2. README.md配置

确保README.md开头有正确的配置：

```yaml
---
title: Cursor User Manager
emoji: 🔐
colorFrom: purple
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---
```

**关键配置：**
- `sdk: docker` - 使用Docker部署
- `app_port: 7860` - 应用端口

### 3. 推送到HF Spaces

#### 方式1：通过HF网页界面

1. 访问 https://huggingface.co/spaces
2. 点击 "Create new Space"
3. 选择 "Docker" SDK
4. 上传所有文件

#### 方式2：通过Git

```bash
# 克隆你的Space仓库
git clone https://huggingface.co/spaces/YOUR_USERNAME/SPACE_NAME
cd SPACE_NAME

# 复制项目文件到仓库
cp -r /path/to/cursor-user-manager/* .

# 提交并推送
git add .
git commit -m "Deploy Cursor User Manager with API proxy"
git push
```

### 4. 等待构建

- HF Spaces会自动构建Docker镜像
- 构建过程大约需要3-5分钟
- 可以在Space页面查看构建日志

### 5. 访问应用

构建完成后，访问你的Space URL：
```
https://YOUR_USERNAME-SPACE_NAME.hf.space
```

---

## ✅ 功能验证

部署成功后，测试以下功能：

### 1. 数据导入
- ✅ 点击"导入JSON文件"上传数据
- ✅ 或使用"粘贴JSON文本"导入

### 2. 数据管理
- ✅ 查看用户列表
- ✅ 搜索过滤
- ✅ 查看详情
- ✅ 复制Token

### 3. API查询（关键功能）
- ✅ 点击"🔍 查询Stripe"按钮
- ✅ 应该能成功查询并显示结果
- ✅ 无CORS错误

---

## 🔧 工作原理

### 请求流程

```
浏览器 → HF Space (FastAPI后端) → Cursor API
         ↓
      返回结果
```

1. 前端发送请求到 `/api/auth/stripe`
2. Python后端接收请求，提取Token
3. 后端转发请求到Cursor API
4. 获取响应并返回给前端

### 为什么有效？

- ✅ **服务器端请求**：Python后端发起请求，无浏览器CORS限制
- ✅ **Token转发**：后端正确设置Cookie和Header
- ✅ **同源请求**：前端请求自己的后端，无跨域问题

---

## 📊 对比：不同部署方式

| 部署方式 | API查询 | 数据管理 | 难度 |
|---------|--------|---------|-----|
| 纯静态（static SDK） | ❌ | ✅ | 简单 |
| Docker + 后端 | ✅ | ✅ | 中等 |
| 本地开发 | ✅ | ✅ | 简单 |

---

## 🐛 常见问题

### Q1: 构建失败

**检查：**
- Dockerfile语法是否正确
- requirements.txt依赖是否完整
- package.json是否有效

**解决：**
查看HF Spaces的构建日志，根据错误信息修复。

### Q2: 应用启动失败

**检查：**
- app.py端口是否为7860
- README.md中app_port配置是否正确

**解决：**
```python
# app.py最后一行应该是：
uvicorn.run(app, host="0.0.0.0", port=7860)
```

### Q3: API查询仍然失败

**检查：**
1. 浏览器开发者工具 → Network
2. 查看请求是否发送到 `/api/auth/stripe`
3. 查看后端日志（HF Space页面有logs标签）

**可能原因：**
- Token格式不正确
- Cursor API暂时不可用
- 网络问题

---

## 🔍 调试技巧

### 1. 查看后端日志

在HF Space页面点击"Logs"标签，查看Python后端日志。

### 2. 测试健康检查

访问：
```
https://YOUR_SPACE.hf.space/health
```

应该返回：
```json
{"status": "ok", "message": "Cursor User Manager API is running"}
```

### 3. 手动测试API

使用curl测试后端：

```bash
curl -X GET "https://YOUR_SPACE.hf.space/api/auth/stripe" \
  -H "X-Cursor-Token: YOUR_TOKEN"
```

---

## 📈 性能优化

### 1. Docker镜像优化

当前Dockerfile已使用：
- ✅ 多阶段构建（减小镜像大小）
- ✅ Alpine Linux（轻量基础镜像）
- ✅ 缓存优化（先复制package.json）

### 2. 启动时间优化

- FastAPI + Uvicorn 启动快速
- 前端构建产物已预编译
- 首次访问约2-3秒

### 3. 请求优化

- 后端使用httpx异步HTTP客户端
- 设置合理的超时时间（10秒）
- 错误处理完善

---

## 🎉 部署成功！

如果一切正常，你现在拥有：

✅ 完整的在线Cursor用户管理系统  
✅ 可以在任何地方访问  
✅ 支持Cursor API查询  
✅ 无CORS限制  
✅ 免费托管在HF Spaces  

**享受你的应用吧！** 🚀

---

## 💡 后续优化建议

1. **添加认证**：保护敏感数据
2. **数据持久化**：集成数据库
3. **批量查询**：支持多用户查询
4. **缓存机制**：减少API调用
5. **日志监控**：分析使用情况

---

有问题？查看 [README.md](./README.md) 或访问 [HF Spaces文档](https://huggingface.co/docs/hub/spaces)。

