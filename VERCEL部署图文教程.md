# 🚀 Vercel 部署图文教程（UI 界面操作）

## 📌 前提条件

- ✅ 已将代码上传到 GitHub
- ✅ 有 GitHub 账号
- ✅ 准备好部署到 Vercel

---

## 第一步：访问 Vercel 官网

1. 打开浏览器，访问：https://vercel.com
2. 点击右上角的 **"Sign Up"**（注册）或 **"Login"**（登录）

---

## 第二步：使用 GitHub 登录

1. 选择 **"Continue with GitHub"**
2. 授权 Vercel 访问你的 GitHub 账号
3. 登录成功后会进入 Vercel Dashboard

---

## 第三步：创建新项目

### 3.1 点击 "Add New..."

在 Vercel Dashboard 页面：
- 点击右上角的 **"Add New..."** 按钮
- 选择 **"Project"**

### 3.2 导入 Git 仓库

1. 在 "Import Git Repository" 页面
2. 找到你的 `cursor-usage-checker` 仓库
3. 点击仓库右侧的 **"Import"** 按钮

> 💡 如果看不到仓库，点击 "Adjust GitHub App Permissions" 添加仓库访问权限

---

## 第四步：配置项目设置

### 4.1 基本配置

在 "Configure Project" 页面：

| 配置项 | 填写内容 |
|--------|---------|
| **Project Name** | `cursor-usage-checker`（或自定义名称） |
| **Framework Preset** | 选择 **"Other"** |
| **Root Directory** | 保持默认 `./` |

### 4.2 构建设置（重要！）

**Build and Output Settings** 部分：

| 配置项 | 值 |
|--------|-----|
| **Build Command** | 留空或填 `echo "No build needed"` |
| **Output Directory** | 留空 |
| **Install Command** | 留空或默认 |

> ⚠️ **关键点**：本项目是纯静态页面 + Serverless Functions，不需要构建步骤！

### 4.3 环境变量（可选）

本项目不需要环境变量，可以跳过这一步。

---

## 第五步：部署

1. 检查所有配置
2. 点击底部的 **"Deploy"** 按钮
3. 等待部署完成（通常 30-60 秒）

### 部署过程

你会看到：
```
Building...
├─ Analyzing source code
├─ Installing dependencies  
├─ Building production bundle
└─ Uploading deployment

✅ Deployment Ready!
```

---

## 第六步：访问你的网站

### 6.1 获取网址

部署成功后，你会看到：
- 🎉 恭喜页面
- 你的网站地址：`https://your-project-name.vercel.app`

### 6.2 点击访问

1. 点击 **"Visit"** 按钮
2. 或直接复制链接到浏览器
3. 看到查询页面说明部署成功！

---

## 第七步：测试功能

### 7.1 获取 Cursor Token

1. 打开 https://cursor.com/cn/dashboard
2. 按 `F12` 打开开发者工具
3. 切换到 **Network（网络）** 标签
4. 刷新页面
5. 找到任意请求（如 `stripe`）
6. 查看 **Headers** → **Request Headers** → **Cookie**
7. 复制 `WorkosCursorSessionToken=` 后面的完整值

### 7.2 使用查询工具

1. 在你的 Vercel 网站上
2. 粘贴 Token 到输入框
3. 点击 **"查询"** 按钮
4. 查看结果！

---

## 🔧 常见问题排查

### ❌ 问题 1：404 Not Found

**可能原因**：
- 刚部署完成，DNS 还在传播
- 路由配置问题

**解决方法**：
1. 等待 2-5 分钟后重试
2. 清除浏览器缓存
3. 检查 `vercel.json` 配置是否正确
4. 在 Vercel Dashboard 查看部署日志

### ❌ 问题 2：API 调用失败

**可能原因**：
- Serverless Functions 未正确部署
- CORS 配置问题

**解决方法**：
1. 在 Vercel Dashboard → **Functions** 标签
2. 确认 `api/stripe.js` 和 `api/usage.js` 存在
3. 查看函数日志

### ❌ 问题 3：页面样式错误

**可能原因**：
- CSS/JS 文件路径不正确

**解决方法**：
1. 检查浏览器控制台的错误信息
2. 确认 `public/style.css` 和 `public/script.js` 文件存在
3. 检查 `index.html` 中的引用路径

### ❌ 问题 4：构建失败

**可能原因**：
- Build Command 配置错误
- 文件缺失

**解决方法**：
1. 进入项目 **Settings** → **General**
2. 找到 **Build & Development Settings**
3. 确认：
   - Build Command: 留空
   - Output Directory: 留空
   - Install Command: 留空
4. 点击 **Save** 保存
5. 在 **Deployments** 标签重新部署

---

## 🎨 自定义域名（可选）

### 步骤 1：添加域名

1. 在项目 Dashboard 点击 **"Settings"**
2. 选择 **"Domains"**
3. 点击 **"Add"** 按钮
4. 输入你的域名（如 `cursor.yourdomain.com`）
5. 点击 **"Add"**

### 步骤 2：配置 DNS

Vercel 会提供 DNS 配置说明：

**方法 A：CNAME 记录（推荐）**
```
Type: CNAME
Name: cursor（或你的子域名）
Value: cname.vercel-dns.com
```

**方法 B：A 记录**
```
Type: A
Name: @
Value: 76.76.21.21
```

### 步骤 3：等待生效

- DNS 传播时间：几分钟到 48 小时
- Vercel 会自动配置 SSL 证书
- 生效后显示绿色 ✅

---

## 📊 查看部署状态

### Dashboard 功能介绍

1. **Overview（概览）**
   - 部署状态
   - 访问统计
   - 最近部署

2. **Deployments（部署记录）**
   - 所有部署历史
   - 每次部署的详细日志
   - 回滚到之前的版本

3. **Functions（函数）**
   - Serverless Functions 列表
   - 实时日志
   - 性能指标

4. **Settings（设置）**
   - 项目配置
   - 环境变量
   - 域名管理
   - Git 集成

---

## 🔄 更新部署

### 方法 1：自动部署（推荐）

每次推送到 GitHub 会自动触发部署：

```bash
git add .
git commit -m "更新功能"
git push
```

Vercel 会自动：
1. 检测到推送
2. 开始构建
3. 部署到生产环境
4. 发送通知邮件

### 方法 2：手动触发

1. 在 Vercel Dashboard
2. 进入 **Deployments** 标签
3. 找到任意部署
4. 点击右侧的 **"..."** 菜单
5. 选择 **"Redeploy"**

---

## 💡 优化建议

### 1. 启用 Vercel Analytics（可选）

1. 在项目 Dashboard 点击 **"Analytics"**
2. 点击 **"Enable"**
3. 查看访问数据、性能指标

### 2. 设置环境变量

如果以后需要添加 API 密钥：

1. **Settings** → **Environment Variables**
2. 点击 **"Add"**
3. 输入名称和值
4. 选择环境（Production/Preview/Development）
5. 保存后重新部署

### 3. 配置通知

1. **Settings** → **Git**
2. 启用部署通知
3. 可以集成 Slack、Discord 等

---

## 📱 移动端访问

- Vercel 默认支持 HTTPS
- 响应式设计自动适配
- 可以添加到主屏幕（PWA-ready）

---

## 🆘 获取帮助

### Vercel 资源

- 📖 官方文档：https://vercel.com/docs
- 💬 社区论坛：https://github.com/vercel/vercel/discussions
- 📧 支持邮箱：support@vercel.com

### 项目相关

- 查看项目 [README.md](./README.md)
- 阅读 [使用示例.md](./使用示例.md)
- 查看 [项目架构.md](./项目架构.md)

---

## ✅ 部署检查清单

部署前确认：

- [ ] 代码已推送到 GitHub
- [ ] `vercel.json` 配置正确
- [ ] `api/` 目录包含 API 文件
- [ ] `public/` 目录包含静态资源
- [ ] `index.html` 在根目录

部署后检查：

- [ ] 网站可以正常访问
- [ ] UI 界面显示正常
- [ ] CSS 样式加载成功
- [ ] JavaScript 功能正常
- [ ] API 调用成功
- [ ] Token 查询返回结果

---

## 🎉 完成！

恭喜！你的 Cursor 查询工具已成功部署到 Vercel！

现在你可以：
- 📋 分享链接给朋友
- 🔖 收藏到浏览器
- 📱 添加到手机主屏幕
- 🎨 自定义域名
- 📊 查看访问统计

---

**祝使用愉快！** 🚀

有问题随时查看文档或提交 Issue！

