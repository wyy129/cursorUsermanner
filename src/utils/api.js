// {{RIPER-6:
//   Action: "Added"
//   Task_ID: "#1"
//   Timestamp: "2025-10-07T00:02:59+08:00"
//   Authoring_Role: "backend-expert"
//   Principle_Applied: "API 封装，统一错误处理"
//   MCP_Tools_Used: ["mcp.server_time"]
// }}

/**
 * 查询 Cursor 账号的订阅信息
 * @param {string} sessionToken - WorkosCursorSessionToken
 * @returns {Promise<Object>} 订阅信息对象
 */
export async function fetchStripeInfo(sessionToken) {
  const API_URL = 'https://www.cursor.com/api/auth/stripe'
  
  try {
    // 构造请求头
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*'
    }
    
    // 构造 Cookie 字符串
    const cookieString = `WorkosCursorSessionToken=${sessionToken}`
    headers['Cookie'] = cookieString
    
    // 发送请求
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    })
    
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
      error: error.message
    }
  }
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

