# Cursor 用户数据管理系统

一个现代化的 Vue 3 应用，用于管理和展示 Cursor 用户数据。

## ✨ 特性

- 📊 **数据统计** - 实时统计总用户数、Pro 用户、有效 Token 和试用用户
- 📁 **灵活导入** - 支持文件上传和直接粘贴 JSON 数据
- 🔐 **Token 查询** - 通过 WorkosCursorSessionToken 实时查询账号订阅信息
- 🔍 **智能搜索** - 实时搜索邮箱、会员类型和系统类型
- 📋 **详细展示** - 展示用户的完整信息，包括认证信息和设备信息
- 🎨 **现代设计** - 渐变色彩、流畅动画和响应式布局
- 💻 **响应式** - 完美适配桌面端和移动端

## 🚀 快速开始

### 方式一：一键启动（推荐）

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

这将自动启动后端代理服务和前端应用。

### 方式二：手动启动

#### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

#### 2. 启动服务

**启动后端代理（终端 1）：**
```bash
cd server
npm start
```

**启动前端应用（终端 2）：**
```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动，后端代理在 `http://localhost:3001`。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📖 使用说明

### 1. 导入数据

项目支持两种导入方式：

#### 方式一：文件上传
- 点击 "从文件导入" 按钮
- 选择 JSON 文件（参考 `sample-data.json`）
- 数据将自动加载到表格中

#### 方式二：直接粘贴
- 点击 "粘贴 JSON" 按钮
- 在弹出的对话框中粘贴 JSON 数组
- 点击 "导入" 按钮

### 2. Token 查询（新功能）

通过 WorkosCursorSessionToken 实时查询账号订阅状态：

#### 如何使用：
1. 在 "账号信息查询" 卡片中，粘贴您的 `WorkosCursorSessionToken`
2. 点击 "查询账号信息" 按钮
3. 系统将调用 Cursor API 并展示：
   - **会员类型**（Pro / 免费试用 / 免费版）
   - **试用剩余天数**（如果是试用账号）
   - **订阅状态**（试用中 / 激活 / 已取消等）
   - **个人会员类型**

#### API 说明：
- **接口地址**：`https://www.cursor.com/api/auth/stripe`
- **请求方式**：GET
- **认证方式**：Cookie 中的 WorkosCursorSessionToken
- **返回数据**：包含会员类型、试用天数、订阅状态等信息

#### 注意事项：
- Token 必须是有效的 WorkosCursorSessionToken
- **⚠️ 推荐使用后端代理模式**（避免 308 重定向和 CORS 问题）
- Pro 用户没有 `daysRemainingOnTrial` 字段

#### 解决 308 重定向问题：

如果遇到 `308 Permanent Redirect` 或 CORS 错误，请使用后端代理：

**快速启动（推荐）：**
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

**手动启动：**
```bash
# 终端 1：启动后端代理
cd server
npm install
npm start

# 终端 2：启动前端
npm run dev
```

然后在界面上**开启"使用后端代理"开关**即可正常使用。

详细配置请参考 [PROXY_SETUP.md](./PROXY_SETUP.md)

### 3. 查看数据

- **统计卡片** - 顶部显示四个关键指标
- **数据表格** - 展示所有用户的主要信息
- **详情查看** - 点击每行的眼睛图标查看完整信息

### 4. 搜索过滤

在搜索框中输入关键词，系统会自动过滤：
- 邮箱地址
- 会员类型（pro/free）
- 系统类型（win32/windows/darwin等）

## 📊 数据格式

导入的 JSON 数据应该是一个数组，每个对象包含以下字段：

```json
[
  {
    "email": "user@example.com",
    "membershipType": "pro",
    "system_type": "win32",
    "tokenValidity": true,
    "daysRemainingOnTrial": null,
    "register_time": "2025-08-28 15:22:46",
    "modelUsage": {
      "used": 100,
      "total": 100
    },
    "auth_info": {
      "cursorAuth/accessToken": "...",
      "cursorAuth/refreshToken": "..."
    },
    "machine_info": {
      "telemetry.machineId": "...",
      ...
    }
  }
]
```

详细示例请参考 `sample-data.json` 文件。

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite 5** - 下一代前端构建工具
- **Composition API** - Vue 3 的响应式 API
- **CSS3** - 现代化样式和动画

## 📁 项目结构

```
cursor-user-manager/
├── src/
│   ├── components/        # Vue 组件
│   │   ├── AppHeader.vue      # 应用头部
│   │   ├── StatsDisplay.vue   # 统计展示
│   │   ├── ImportControls.vue # 导入控制
│   │   ├── SearchBox.vue      # 搜索框
│   │   ├── DataTable.vue      # 数据表格
│   │   └── EmptyState.vue     # 空状态
│   ├── assets/           # 静态资源
│   │   └── style.css         # 全局样式
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── index.html            # HTML 模板
├── vite.config.js        # Vite 配置
├── package.json          # 项目配置
└── sample-data.json      # 示例数据
```

## 🎨 设计特点

- **渐变配色** - 紫色渐变主题，现代感十足
- **卡片设计** - 圆角卡片，阴影悬浮效果
- **流畅动画** - hover 效果和过渡动画
- **响应式布局** - Grid 和 Flexbox 实现自适应
- **图标系统** - 内联 SVG 图标，清晰美观

## 📝 开发指南

### 组件说明

- **AppHeader.vue** - 应用顶部导航栏
- **StatsDisplay.vue** - 四个统计卡片，显示关键指标
- **ImportControls.vue** - 数据导入控制面板
- **SearchBox.vue** - 搜索输入框，支持实时过滤
- **DataTable.vue** - 数据表格，包含详情查看功能
- **EmptyState.vue** - 空状态提示

### 状态管理

使用 Vue 3 的 `ref` 和 `computed` 进行状态管理：
- `users` - 用户数据数组
- `searchQuery` - 搜索关键词
- `stats` - 计算属性，自动统计数据
- `filteredUsers` - 计算属性，过滤后的用户列表

## 📄 许可证

MIT License

## 🔄 更新日志

### v1.2.0 (最新)
- ✅ 修复 308 重定向问题
- ✅ 新增后端代理服务
- ✅ 支持直接调用和代理模式切换
- ✅ 添加一键启动脚本
- ✅ 优化错误提示和重试机制

### v1.1.0
- ✅ 新增 Token 查询功能
- ✅ 集成 Cursor Stripe API
- ✅ 实时查询会员类型和试用天数
- ✅ 支持查看完整 API 响应数据

### v1.0.0
- ✅ 初始版本发布
- ✅ 数据导入和展示功能
- ✅ 统计和搜索功能

## 👨‍💻 作者

Created with ❤️ by RIPER-6 + P.A.C.E. Engine

---

**提示**：项目已包含示例数据 `sample-data.json`，可以直接导入测试！

