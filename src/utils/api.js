// {{RIPER-6:
//   Action: "Modified"
//   Task_ID: "#1"
//   Timestamp: "2025-10-07T00:02:59+08:00"
//   Authoring_Role: "backend-expert"
//   Principle_Applied: "API 封装，统一错误处理，支持多种调用方式"
//   MCP_Tools_Used: ["mcp.server_time"]
// }}

/**
 * API 配置
 */
const API_CONFIG = {
  // 直接调用（可能遇到 CORS 或 308 重定向问题）
  DIRECT_URL: 'https://www.cursor.com/api/auth/stripe',
  // 代理模式（需要后端支持）
  PROXY_URL: '/api/auth/stripe',
  // 使用代理模式（默认 false）
  USE_PROXY: false
}

/**
 * 方法1：直接使用 fetch（推荐用于测试）
 * 
 * @param {string} sessionToken - WorkosCursorSessionToken
 * @returns {Promise<Object>} 订阅信息对象
 */
export async function fetchStripeInfo(sessionToken) {
  const API_URL = API_CONFIG.USE_PROXY ? API_CONFIG.PROXY_URL : API_CONFIG.DIRECT_URL
  
  try {
    // 构造请求选项
    const options = {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    }
    
    // 如果使用代理模式，将 token 放在自定义 header 中
    if (API_CONFIG.USE_PROXY) {
      options.headers['X-Cursor-Token'] = sessionToken
    } else {
      // 直接模式，设置 Cookie（注意：可能被浏览器阻止）
      options.headers['Cookie'] = `WorkosCursorSessionToken=${sessionToken}`
    }
    
    // 发送请求
    const response = await fetch(API_URL, options)
    
    // 检查响应状态
    if (response.status === 308 || response.status === 301 || response.status === 302) {
      throw new Error('遇到重定向问题。请尝试使用代理模式或后端服务调用。')
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return {
      success: true,
      data: data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      suggestion: '建议：1) 安装 CORS 浏览器扩展；2) 使用后端代理；3) 使用下方的后端调用方式'
    }
  }
}

/**
 * 方法2：使用后端代理服务（推荐用于生产环境）
 * 需要配合后端服务使用
 * 
 * @param {string} sessionToken - WorkosCursorSessionToken
 * @returns {Promise<Object>} 订阅信息对象
 */
export async function fetchStripeInfoViaBackend(sessionToken) {
  try {
    // 调用本地后端代理接口
    const response = await fetch('/api/check-stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: sessionToken })
    })
    
    if (!response.ok) {
      throw new Error(`后端服务错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      success: true,
      data: data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 方法3：智能调用（自动选择最佳方式）
 * 
 * @param {string} sessionToken - WorkosCursorSessionToken
 * @returns {Promise<Object>} 订阅信息对象
 */
export async function fetchStripeInfoSmart(sessionToken) {
  // 先尝试直接调用
  const directResult = await fetchStripeInfo(sessionToken)
  
  if (directResult.success) {
    return directResult
  }
  
  // 如果直接调用失败，尝试后端代理
  console.warn('直接调用失败，尝试后端代理...')
  const backendResult = await fetchStripeInfoViaBackend(sessionToken)
  
  return backendResult
}

/**
 * 批量查询多个账号的订阅信息
 * @param {Array<string>} sessionTokens - WorkosCursorSessionToken 数组
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<Array>} 结果数组
 */
export async function fetchBatchStripeInfo(sessionTokens, onProgress) {
  const results = []
  
  for (let i = 0; i < sessionTokens.length; i++) {
    const token = sessionTokens[i]
    const result = await fetchStripeInfo(token)
    results.push(result)
    
    if (onProgress) {
      onProgress(i + 1, sessionTokens.length)
    }
    
    // 添加延迟避免请求过快
    if (i < sessionTokens.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

