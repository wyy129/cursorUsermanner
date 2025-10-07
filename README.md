# 🔍 Cursor 账号使用情况在线查询工具

一个部署在 Vercel 上的在线查询工具，用于查询 Cursor 账号的订阅信息和使用统计。

## ✨ 特性

- 🚀 现代化的 Web 界面
- 📊 实时查询账号信息和使用统计
- 🔒 安全的服务器端代理，保护您的 Token
- 💾 自动保存 Token 到本地存储（浏览器）
- 📱 响应式设计，支持移动端
- ⚡ 部署在 Vercel，访问速度快

## 🎯 功能

### 查询内容

1. **账户信息**
   - 用户 ID
   - 订阅状态
   - 订阅计划
   - 订阅金额
   - 下次续费时间
   - 邮箱和用户名

2. **使用统计**
   - 快速请求次数
   - 慢速请求次数
   - 总请求次数
   - 使用事件统计

3. **原始数据**
   - 完整的 JSON 数据展示

## 📦 项目结构

```
cursor-usage-checker/
├── api/
│   ├── stripe.js          # Stripe API 代理
│   └── usage.js           # Usage API 代理
├── public/
│   ├── style.css          # 样式文件
│   └── script.js          # 前端脚本
├── index.html             # 主页面
├── vercel.json            # Vercel 配置
├── package.json           # 项目配置
├── .gitignore             # Git 忽略文件
└── README.md              # 说明文档
```

## 🚀 部署到 Vercel

### 方法一：通过 Vercel Dashboard（推荐）

1. 将项目代码上传到 GitHub 仓库

2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)

3. 点击 "New Project"

4. 导入您的 GitHub 仓库

5. Vercel 会自动检测配置并部署

6. 部署完成后，您会获得一个 `.vercel.app` 域名

### 方法二：通过 Vercel CLI

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 在项目目录中运行：
```bash
vercel login
vercel
```

3. 按照提示完成部署

### 方法三：一键部署

点击下面的按钮一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/cursor-usage-checker)

## 📖 使用说明

### 获取 WorkosCursorSessionToken

1. 打开浏览器（Chrome/Edge/Firefox）

2. 按 `F12` 打开开发者工具

3. 访问 [Cursor Dashboard](https://cursor.com/cn/dashboard)

4. 在开发者工具中切换到 **Network（网络）** 标签

5. 刷新页面或点击任意选项卡

6. 在请求列表中找到任意请求（如 `stripe` 或 `get-aggregated-usage-events`）

7. 点击该请求，查看 **Headers（请求头）** 部分

8. 在 **Request Headers** 中找到 `Cookie` 字段

9. 复制 `WorkosCursorSessionToken=` 后面的完整值（包括 `%3A%3A` 等编码字符）

示例：
```
WorkosCursorSessionToken=user_01K6VZ40GJ6KWWKEKJ6F0E4ET1%3A%3AeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 查询使用情况

1. 访问您部署的网站

2. 将获取的 Token 粘贴到输入框中

3. 点击 **查询** 按钮

4. 等待查询结果显示

5. Token 会自动保存在浏览器中，下次访问时自动填充

## 🔧 本地开发

### 前置要求

- Node.js 14.x 或更高版本
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 查看效果

### 部署到生产环境

```bash
npm run deploy
```

## 🔒 安全说明

- ⚠️ **请勿泄露您的 Token**：Token 相当于您的账号密码
- 🔐 所有请求都通过服务器端代理，前端不直接访问 Cursor API
- 💾 Token 只保存在您的浏览器本地存储中
- 🚫 服务器不会记录、存储或传输您的 Token 到其他地方
- 🛡️ 建议定期更换 Token（重新登录 Cursor）

## ⚠️ 注意事项

1. Token 有效期有限，过期后需要重新获取
2. 不要在公共场所或不信任的设备上使用
3. 如果发现 Token 泄露，请立即修改 Cursor 账号密码
4. 本工具仅供个人使用，请勿用于商业用途

## 🛠️ 技术栈

- **前端**：原生 HTML + CSS + JavaScript
- **后端**：Vercel Serverless Functions（Node.js）
- **部署**：Vercel
- **API**：Cursor.com 官方 API

## 📝 API 接口说明

### 1. Stripe 订阅信息接口

- **路径**：`/api/stripe`
- **方法**：POST
- **参数**：
  ```json
  {
    "token": "WorkosCursorSessionToken 值"
  }
  ```

### 2. 使用统计接口

- **路径**：`/api/usage`
- **方法**：POST
- **参数**：
  ```json
  {
    "token": "WorkosCursorSessionToken 值",
    "teamId": -1,
    "startDate": 1757228452918,
    "endDate": 1759820452918
  }
  ```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License

## ⭐ Star History

如果这个项目对您有帮助，请给它一个 Star！

## 🔗 相关链接

- [Cursor 官网](https://cursor.com)
- [Vercel 官网](https://vercel.com)
- [项目仓库](https://github.com/YOUR_USERNAME/cursor-usage-checker)

## 📮 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/YOUR_USERNAME/cursor-usage-checker/issues)
- 发送邮件到：your-email@example.com

---

Made with ❤️ by You

