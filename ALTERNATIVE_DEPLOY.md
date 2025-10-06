# 🚀 替代部署方案

如果Hugging Face Spaces限制外部HTTP请求，可以使用以下替代方案。

---

## ⚠️ HF Spaces限制说明

Hugging Face Spaces（特别是免费版）可能：
- ❌ 限制外部HTTP/HTTPS请求
- ❌ 阻止访问某些域名
- ❌ 有严格的防火墙规则

### 验证是否被限制

访问测试端点：
```
https://YOUR_SPACE.hf.space/test-network
```

如果所有测试都失败，说明HF确实限制了外部请求。

---

## ✅ 推荐替代方案

### 方案1：Vercel（免费，推荐）⭐

**优点：**
- ✅ 完全免费
- ✅ 无外部请求限制
- ✅ 自动HTTPS
- ✅ 全球CDN
- ✅ 支持Serverless函数

**部署步骤：**

1. 安装Vercel CLI
```bash
npm i -g vercel
```

2. 创建 `api/stripe.js` (Serverless函数)
```javascript
// api/stripe.js
export default async function handler(req, res) {
  const token = req.headers['x-cursor-token'];
  
  if (!token) {
    return res.status(400).json({ error: '缺少Token' });
  }
  
  try {
    const response = await fetch('https://www.cursor.com/api/auth/stripe', {
      headers: {
        'Cookie': `WorkosCursorSessionToken=${token}`,
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

3. 创建 `vercel.json`
```json
{
  "rewrites": [
    { "source": "/api/auth/stripe", "destination": "/api/stripe" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

4. 部署
```bash
vercel
```

---

### 方案2：Netlify（免费）

**优点：**
- ✅ 完全免费
- ✅ 支持Netlify Functions
- ✅ 自动部署

**部署步骤：**

1. 创建 `netlify/functions/stripe.js`
```javascript
exports.handler = async (event) => {
  const token = event.headers['x-cursor-token'];
  
  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: '缺少Token' })
    };
  }
  
  try {
    const response = await fetch('https://www.cursor.com/api/auth/stripe', {
      headers: {
        'Cookie': `WorkosCursorSessionToken=${token}`
      }
    });
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

2. 创建 `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/auth/stripe"
  to = "/.netlify/functions/stripe"
  status = 200
```

3. 部署
```bash
# 连接Git仓库到Netlify，自动部署
# 或使用Netlify CLI
npm i -g netlify-cli
netlify deploy --prod
```

---

### 方案3：Railway（免费额度）

**优点：**
- ✅ 支持Docker
- ✅ 无请求限制
- ✅ 简单易用

**部署步骤：**

1. 访问 https://railway.app
2. 连接GitHub仓库
3. Railway自动检测Dockerfile并部署

---

### 方案4：Render（免费）

**优点：**
- ✅ 支持Docker
- ✅ 自动HTTPS
- ✅ 免费层足够使用

**部署步骤：**

1. 访问 https://render.com
2. 创建新的Web Service
3. 连接仓库，选择Docker
4. 自动部署

---

### 方案5：本地运行（最简单）⭐⭐⭐

**优点：**
- ✅ 完全免费
- ✅ 无任何限制
- ✅ 最快速度
- ✅ 立即可用

**使用方法：**

```bash
# 开发模式（推荐）
npm install
npm run dev
# 访问 http://localhost:3000

# 或完整部署
npm run build
pip install -r requirements.txt
python app.py
# 访问 http://localhost:7860
```

**适合场景：**
- 个人使用
- 内网使用
- 数据安全要求高

---

### 方案6：自己的VPS服务器

**优点：**
- ✅ 完全控制
- ✅ 无限制
- ✅ 可自定义

**部署步骤：**

```bash
# 在你的VPS上
git clone YOUR_REPO
cd cursor-user-manager

# 使用Docker
docker build -t cursor-manager .
docker run -d -p 7860:7860 cursor-manager

# 或直接运行
npm install && npm run build
pip3 install -r requirements.txt
python3 app.py
```

---

## 📊 方案对比

| 方案 | 成本 | 难度 | 速度 | 限制 | 推荐度 |
|------|------|------|------|------|--------|
| 本地运行 | 免费 | ⭐ | ⭐⭐⭐ | 无 | ⭐⭐⭐⭐⭐ |
| Vercel | 免费 | ⭐⭐ | ⭐⭐⭐ | 少 | ⭐⭐⭐⭐⭐ |
| Netlify | 免费 | ⭐⭐ | ⭐⭐⭐ | 少 | ⭐⭐⭐⭐ |
| Railway | 免费额度 | ⭐⭐ | ⭐⭐ | 中 | ⭐⭐⭐⭐ |
| Render | 免费 | ⭐⭐ | ⭐⭐ | 中 | ⭐⭐⭐ |
| VPS | 付费 | ⭐⭐⭐ | ⭐⭐⭐ | 无 | ⭐⭐⭐ |
| HF Spaces | 免费 | ⭐⭐ | ⭐ | 多 | ⭐ |

---

## 🎯 推荐选择

### 个人使用
→ **本地运行** (`npm run dev`)

### 在线分享
→ **Vercel** 或 **Netlify**

### 长期稳定
→ **VPS服务器**

### 临时测试
→ **Railway** 或 **Render**

---

## 💡 快速开始（Vercel）

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 创建Serverless函数
mkdir -p api
cat > api/stripe.js << 'EOF'
export default async function handler(req, res) {
  const token = req.headers['x-cursor-token'];
  if (!token) return res.status(400).json({ error: '缺少Token' });
  
  const response = await fetch('https://www.cursor.com/api/auth/stripe', {
    headers: { 'Cookie': `WorkosCursorSessionToken=${token}` }
  });
  res.json(await response.json());
}
EOF

# 3. 部署
vercel --prod
```

完成！获得一个 `https://your-app.vercel.app` 地址。

---

## ❓ 常见问题

### Q: 为什么HF Spaces不行？

**A:** HF Spaces主要为AI模型服务设计，对外部HTTP请求有限制，不适合做API代理。

### Q: Vercel和Netlify哪个更好？

**A:** 两者都很好：
- **Vercel**: 对Next.js支持更好，速度略快
- **Netlify**: 界面更友好，功能更丰富

### Q: 本地运行安全吗？

**A:** 非常安全，数据完全在本地，不会上传到任何服务器。

---

**建议：如果HF Spaces确实限制外部请求，立即切换到Vercel或本地运行！** 🚀

