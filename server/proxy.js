// {{RIPER-6:
//   Action: "Added"
//   Task_ID: "#5"
//   Timestamp: "2025-10-07T00:02:59+08:00"
//   Authoring_Role: "backend-expert"
//   Principle_Applied: "后端代理解决 CORS 和重定向问题"
//   MCP_Tools_Used: ["mcp.server_time"]
// }}

import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
const PORT = 3001

// 中间件
app.use(cors())
app.use(express.json())

/**
 * 代理接口：查询 Cursor Stripe 信息
 */
app.post('/api/check-stripe', async (req, res) => {
  const { token } = req.body
  
  if (!token) {
    return res.status(400).json({
      success: false,
      error: '缺少 token 参数'
    })
  }
  
  try {
    console.log('📡 代理请求 Cursor API...')
    
    // 构造请求
    const response = await fetch('https://www.cursor.com/api/auth/stripe', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': `WorkosCursorSessionToken=${token}`,
        'Referer': 'https://www.cursor.com/',
        'Origin': 'https://www.cursor.com'
      },
      redirect: 'follow' // 自动跟随重定向
    })
    
    console.log(`📊 响应状态: ${response.status}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ 查询成功:', data.membershipType)
    
    res.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('❌ 查询失败:', error.message)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * 健康检查接口
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cursor API 代理服务运行中' })
})

/**
 * 启动服务器
 */
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Cursor API 代理服务已启动 🚀        ║
║   端口: ${PORT}                          ║
║   地址: http://localhost:${PORT}        ║
╚════════════════════════════════════════╝

可用接口:
- POST /api/check-stripe  查询 Stripe 信息
- GET  /health            健康检查

前端配置:
将 fetchStripeInfoViaBackend 作为主要调用方式
  `)
})

