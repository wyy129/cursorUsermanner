import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'

const app = express()
const PORT = 3001

// 中间件
app.use(cors())
app.use(express.json())

// 根路径 - API文档
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cursor账户管理 - API服务</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 2rem;
          color: #333;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #667eea; margin-bottom: 0.5rem; }
        .status { 
          display: inline-block;
          padding: 0.5rem 1rem;
          background: #d1fae5;
          color: #065f46;
          border-radius: 8px;
          font-weight: 600;
          margin-bottom: 2rem;
        }
        h2 { color: #1f2937; margin: 2rem 0 1rem 0; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem; }
        .endpoint {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border-left: 4px solid #667eea;
        }
        .method {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.85rem;
          margin-right: 0.5rem;
        }
        .get { background: #d1fae5; color: #065f46; }
        .post { background: #dbeafe; color: #1e40af; }
        .path { 
          font-family: monospace;
          color: #1f2937;
          font-size: 1.1rem;
          font-weight: 600;
        }
        .description { 
          color: #6b7280;
          margin: 0.5rem 0;
        }
        pre {
          background: #1f2937;
          color: #10b981;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.9rem;
        }
        .note {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 1rem;
          border-radius: 4px;
          color: #92400e;
          margin: 1rem 0;
        }
        a { color: #667eea; text-decoration: none; font-weight: 600; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Cursor账户管理 API服务</h1>
        <div class="status">✅ 服务运行正常</div>
        
        <p>欢迎使用Cursor账户管理系统的后端API服务。此服务提供账户订阅状态查询功能。</p>
        
        <h2>📡 可用端点</h2>
        
        <div class="endpoint">
          <div>
            <span class="method get">GET</span>
            <span class="path">/health</span>
          </div>
          <p class="description">健康检查端点，用于检测服务是否正常运行</p>
          <p><strong>响应示例：</strong></p>
          <pre>{ "status": "ok", "message": "服务运行正常" }</pre>
        </div>

        <div class="endpoint">
          <div>
            <span class="method post">POST</span>
            <span class="path">/api/check-subscription</span>
          </div>
          <p class="description">查询单个账户的订阅状态</p>
          <p><strong>请求体：</strong></p>
          <pre>{
  "token": "WorkosCursorSessionToken值"
}</pre>
          <p><strong>响应示例：</strong></p>
          <pre>{
  "success": true,
  "data": {
    "membershipType": "free_trial",
    "individualMembershipType": "free_trial",
    "daysRemainingOnTrial": 6,
    "subscriptionStatus": "trialing",
    ...
  }
}</pre>
        </div>

        <div class="endpoint">
          <div>
            <span class="method post">POST</span>
            <span class="path">/api/batch-check-subscription</span>
          </div>
          <p class="description">批量查询多个账户的订阅状态</p>
          <p><strong>请求体：</strong></p>
          <pre>{
  "accounts": [...]
}</pre>
        </div>

        <div class="note">
          💡 <strong>提示：</strong> 前端应用运行在 <a href="http://localhost:3000" target="_blank">http://localhost:3000</a>
        </div>

        <h2>🔧 技术栈</h2>
        <ul style="margin-left: 2rem; color: #4b5563; line-height: 2;">
          <li>Express.js - Web框架</li>
          <li>CORS - 跨域资源共享</li>
          <li>node-fetch - HTTP请求库</li>
        </ul>
      </div>
    </body>
    </html>
  `)
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' })
})

// 查询账户订阅状态
app.post('/api/check-subscription', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ 
        error: '缺少必需的参数',
        message: '请提供WorkosCursorSessionToken' 
      })
    }

    console.log('正在查询订阅状态，Token:', token.substring(0, 50) + '...')

    // 使用正确的方式传递Cookie
    const response = await fetch('https://www.cursor.com/api/auth/stripe', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Cookie': `WorkosCursorSessionToken=${token}`
      },
      timeout: 10000
    })

    console.log('API响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API错误响应:', errorText)
      return res.status(response.status).json({
        error: '请求失败',
        message: `API返回状态码: ${response.status}`,
        status: response.status,
        details: errorText
      })
    }

    const data = await response.json()
    console.log('查询成功，会员类型:', data.membershipType)
    
    // 返回订阅信息
    res.json({
      success: true,
      data: {
        membershipType: data.membershipType,
        individualMembershipType: data.individualMembershipType,
        daysRemainingOnTrial: data.daysRemainingOnTrial,
        subscriptionStatus: data.subscriptionStatus,
        verifiedStudent: data.verifiedStudent,
        trialEligible: data.trialEligible,
        isOnStudentPlan: data.isOnStudentPlan,
        isTeamMember: data.isTeamMember,
        teamMembershipType: data.teamMembershipType,
        customerBalance: data.customerBalance,
        trialWasCancelled: data.trialWasCancelled,
        isOnBillableAuto: data.isOnBillableAuto
      }
    })

  } catch (error) {
    console.error('查询订阅状态错误:', error)
    res.status(500).json({
      error: '服务器错误',
      message: error.message
    })
  }
})

// 批量查询账户订阅状态
app.post('/api/batch-check-subscription', async (req, res) => {
  try {
    const { accounts } = req.body

    if (!accounts || !Array.isArray(accounts)) {
      return res.status(400).json({ 
        error: '缺少必需的参数',
        message: '请提供accounts数组' 
      })
    }

    const results = []

    for (const account of accounts) {
      const token = account.auth_info?.WorkosCursorSessionToken

      if (!token) {
        results.push({
          email: account.email,
          success: false,
          error: 'WorkosCursorSessionToken不存在'
        })
        continue
      }

      try {
        const response = await fetch('https://www.cursor.com/api/auth/stripe', {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Cookie': `WorkosCursorSessionToken=${token}`
          },
          timeout: 10000
        })

        if (response.ok) {
          const data = await response.json()
          results.push({
            email: account.email,
            success: true,
            data: {
              membershipType: data.membershipType,
              individualMembershipType: data.individualMembershipType,
              daysRemainingOnTrial: data.daysRemainingOnTrial,
              subscriptionStatus: data.subscriptionStatus
            }
          })
        } else {
          results.push({
            email: account.email,
            success: false,
            error: `API返回状态码: ${response.status}`
          })
        }
      } catch (error) {
        results.push({
          email: account.email,
          success: false,
          error: error.message
        })
      }

      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    res.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('批量查询订阅状态错误:', error)
    res.status(500).json({
      error: '服务器错误',
      message: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 后端服务器运行在 http://localhost:${PORT}`)
  console.log(`📡 前端应用地址: http://localhost:3000`)
  console.log(`✅ 服务已就绪，等待请求...`)
})

