# 🚀 快速部署指南

## 一键部署到 Vercel

### 步骤 1：准备 GitHub 仓库

1. 在 GitHub 上创建一个新仓库
2. 将本项目代码推送到仓库：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cursor-usage-checker.git
git push -u origin main
```

### 步骤 2：部署到 Vercel

#### 方法 A：通过 Vercel 网站（最简单）

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择刚才创建的仓库
5. 项目设置：
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: 留空
   - **Output Directory**: 留空
6. 点击 "Deploy"
7. 等待部署完成（通常 1-2 分钟）
8. 获得您的专属域名：`https://your-project.vercel.app`

#### 方法 B：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

### 步骤 3：测试部署

1. 访问您的 Vercel 域名
2. 输入 Cursor Token
3. 点击查询按钮
4. 查看结果

## 配置自定义域名（可选）

### 在 Vercel 中添加自定义域名

1. 在 Vercel Dashboard 中选择您的项目
2. 进入 "Settings" → "Domains"
3. 添加您的域名（如 `cursor.yourdomain.com`）
4. 按照提示配置 DNS 记录：

**添加 CNAME 记录：**
```
Type: CNAME
Name: cursor (或您想要的子域名)
Value: cname.vercel-dns.com
```

5. 等待 DNS 生效（通常几分钟到几小时）
6. 访问您的自定义域名

## 环境变量配置（可选）

如果需要添加环境变量：

1. 在 Vercel Dashboard 中选择您的项目
2. 进入 "Settings" → "Environment Variables"
3. 添加变量（如 API 密钥等）
4. 重新部署项目

## 更新部署

### 自动部署（推荐）

当您推送代码到 GitHub 时，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update feature"
git push
```

### 手动部署

```bash
vercel --prod
```

## 常见问题

### Q: 部署后无法访问？

**A:** 检查以下几点：
1. Vercel 部署是否成功
2. 域名 DNS 是否生效
3. 浏览器是否有缓存（试试无痕模式）

### Q: API 请求失败？

**A:** 检查：
1. Token 是否正确
2. Token 是否过期
3. 网络是否正常
4. Vercel 函数日志（Dashboard → Functions → Logs）

### Q: 如何查看错误日志？

**A:** 
1. 登录 Vercel Dashboard
2. 选择您的项目
3. 进入 "Functions" → "Logs"
4. 查看实时日志

### Q: 部署限额？

**A:** Vercel 免费计划限制：
- 100 GB 带宽/月
- 100 GB-小时 函数执行时间
- 无限制请求数
- 通常足够个人使用

### Q: 如何删除项目？

**A:**
1. 在 Vercel Dashboard 中选择项目
2. 进入 "Settings"
3. 滚动到底部
4. 点击 "Delete Project"

## 性能优化建议

1. **启用缓存**：在 `vercel.json` 中配置缓存头
2. **使用 CDN**：Vercel 自动提供全球 CDN
3. **压缩资源**：CSS/JS 文件会自动压缩
4. **监控性能**：使用 Vercel Analytics

## 安全建议

1. **不要提交敏感信息**：使用环境变量
2. **定期检查日志**：查看异常访问
3. **启用 HTTPS**：Vercel 默认启用
4. **限制访问**：可以添加认证中间件

## 资源链接

- [Vercel 文档](https://vercel.com/docs)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [域名配置指南](https://vercel.com/docs/concepts/projects/domains)
- [环境变量指南](https://vercel.com/docs/concepts/projects/environment-variables)

## 技术支持

遇到问题？

1. 查看 [Vercel 状态页面](https://www.vercel-status.com/)
2. 搜索 [Vercel 社区](https://github.com/vercel/vercel/discussions)
3. 提交 [Issue](https://github.com/YOUR_USERNAME/cursor-usage-checker/issues)

---

部署愉快！🎉

