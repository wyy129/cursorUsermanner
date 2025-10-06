// {{RIPER-6:
//   Action: "Modified"
//   Task_ID: "#API-004"
//   Timestamp: "2025-10-06T09:30:00Z"
//   Authoring_Role: "PM"
//   Principle_Applied: "环境自适应，开发用代理，生产直接请求"
//   Quality_Check: "自动检测环境并使用正确的API地址"
//   MCP_Tools_Used: ["search_replace"]
// }}

import { showMessage } from './message.js'

/**
 * 获取API地址（自动适配环境）
 */
function getApiUrl() {
  // 获取当前页面的协议和域名
  const baseUrl = window.location.origin
  
  // 开发环境：使用Vite代理
  if (import.meta.env.DEV) {
    return '/api/auth/stripe'
  }
  
  // 生产环境：使用完整的URL（包含协议和域名）
  // 确保使用HTTPS，避免308重定向
  return `${baseUrl}/api/auth/stripe`
}

/**
 * 查询用户的Stripe信息
 * @param {string} token - WorkosCursorSessionToken
 * @param {boolean} debug - 是否启用调试模式（显示完整请求详情）
 */
export async function queryUserStripeInfo(token, debug = false) {
  try {
    const apiUrl = getApiUrl() + (debug ? '?debug=true' : '')
    console.log('请求地址:', apiUrl)
    console.log('Token长度:', token.length, '前缀:', token.substring(0, 15))
    console.log('调试模式:', debug ? '✅ 开启' : '❌ 关闭')
    
    // 触发请求监控事件（在请求前）
    const requestStartEvent = new CustomEvent('stripe-api-call-start', {
      detail: {
        apiUrl,
        token,
        timestamp: new Date().toISOString()
      }
    })
    window.dispatchEvent(requestStartEvent)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 通过自定义header传递Token（避免浏览器Cookie限制）
        'X-Cursor-Token': token,
        // 调试模式标记
        ...(debug ? { 'X-Debug': 'true' } : {})
      },
      // 生产环境使用include以支持跨域Cookie，开发环境使用same-origin
      credentials: import.meta.env.DEV ? 'same-origin' : 'include'
    })
    
    console.log('响应状态:', response.status, response.statusText)
    
    if (!response.ok) {
      // 尝试获取错误详情
      const errorData = await response.json().catch(() => ({ error: '无法解析错误响应' }))
      console.error('API错误响应:', errorData)
      
      // 触发请求监控事件（失败）
      const errorEvent = new CustomEvent('stripe-api-call', {
        detail: {
          success: false,
          apiUrl,
          token,
          statusCode: response.status,
          statusText: response.statusText,
          data: errorData
        }
      })
      window.dispatchEvent(errorEvent)
      
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorData.error || response.statusText}`,
        details: errorData
      }
    }
    
    const data = await response.json()
    console.log('成功获取数据:', data)
    
    // 如果响应中包含调试信息，单独显示
    if (data._debug) {
      console.group('🔍 调试信息（请求详情）')
      console.log('1️⃣ 前端 → Vercel Function:', data._debug.requestToVercel)
      console.log('2️⃣ Vercel Function → Cursor API:', data._debug.requestToCursor)
      console.log('📝 Token 信息:', data._debug.tokenInfo)
      console.log('📨 Cursor 响应:', data._debug.cursorResponse)
      console.groupEnd()
    }
    
    // 触发请求监控事件（成功）
    const successEvent = new CustomEvent('stripe-api-call', {
      detail: {
        success: true,
        apiUrl,
        token,
        statusCode: 200,
        statusText: 'OK',
        data: data
      }
    })
    window.dispatchEvent(successEvent)
    
    return { success: true, data }
    
  } catch (error) {
    console.error('API查询失败:', error)
    
    // 如果是网络错误，给出友好提示
    if (error.message.includes('fetch') || error.message.includes('Failed')) {
      return { 
        success: false, 
        error: '网络请求失败，请检查连接或稍后重试。'
      }
    }
    
    return { 
      success: false, 
      error: error.message 
    }
  }
}


