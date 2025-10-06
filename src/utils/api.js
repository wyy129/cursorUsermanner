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
 */
export async function queryUserStripeInfo(token) {
  try {
    const apiUrl = getApiUrl()
    console.log('使用API地址:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 通过自定义header传递Token（避免浏览器Cookie限制）
        'X-Cursor-Token': token
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
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


