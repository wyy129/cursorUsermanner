/**
 * Cursor API 代理服务 - 精简版
 * 参考 Python cursor_account_manager.py 的实现
 */

import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

/**
 * 订阅接口 - GET /api/auth/stripe
 */
app.post('/api/check-stripe', async (req, res) => {
  const { token } = req.body
  
  if (!token) {
    return res.status(400).json({ error: '缺少 token 参数' })
  }
  
  try {
    console.log('📡 [订阅接口] Token:', token.substring(0, 15) + '...')
    
    const response = await fetch('https://www.cursor.com/api/auth/stripe', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cookie': `WorkosCursorSessionToken=${token}`
      }
    })
    
    console.log(`📊 状态码: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ 失败: ${response.status} - ${errorText}`)
      return res.status(response.status).json({ error: `HTTP ${response.status}` })
    }
    
    const data = await response.json()
    console.log(`✅ 成功: ${data.membershipType}`)
    
    res.json(data)
  } catch (error) {
    console.error('❌ 异常:', error.message)
    res.status(500).json({ error: error.message })
  }
})

/**
 * 用量接口 - POST /api/dashboard/get-aggregated-usage-events
 */
app.post('/api/check-usage', async (req, res) => {
  const { token } = req.body
  
  if (!token) {
    return res.status(400).json({ error: '缺少 token 参数' })
  }
  
  try {
    console.log('📡 [用量接口] Token:', token.substring(0, 15) + '...')
    
    // 计算时间范围：最近30天（毫秒）
    const endDate = Date.now()
    const startDate = endDate - (30 * 24 * 60 * 60 * 1000)
    
    const payload = {
      teamId: -1,
      startDate: startDate,
      endDate: endDate
    }
    
    console.log('📅 时间范围:', new Date(startDate).toISOString(), '至', new Date(endDate).toISOString())
    
    const response = await fetch('https://cursor.com/api/dashboard/get-aggregated-usage-events', {
      method: 'POST',
      headers: {
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'accept': '*/*',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-user': '?1',
        'sec-fetch-dest': 'empty',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9',
        'content-type': 'application/json',
        'priority': 'u=1, i',
        'origin': 'https://cursor.com',
        'referer': 'https://cursor.com/cn/dashboard?tab=usage',
        'Cookie': `WorkosCursorSessionToken=${token}`
      },
      body: JSON.stringify(payload)
    })
    
    console.log(`📊 状态码: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ 失败: ${response.status} - ${errorText}`)
      return res.status(response.status).json({ error: `HTTP ${response.status}` })
    }
    
    const data = await response.json()
    const costCents = data.totalCostCents || 0
    console.log(`✅ 成功: 费用 $${(costCents / 100).toFixed(2)}`)
    
    res.json(data)
  } catch (error) {
    console.error('❌ 异常:', error.message)
    res.status(500).json({ error: error.message })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 Cursor API 代理服务已启动         ║
║  📍 http://localhost:${PORT}            ║
╚═══════════════════════════════════════╝

📡 可用接口:
   POST /api/check-stripe   - 查询订阅信息
   POST /api/check-usage    - 查询用量详情
   GET  /health             - 健康检查
  `)
})

