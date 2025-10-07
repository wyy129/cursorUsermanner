/**
 * Cursor API 工具 - 精简版
 * 参考 Python cursor_account_manager.py 的实现
 * 使用后端代理调用，避免浏览器 CORS 限制
 */

/**
 * 调用订阅接口 - GET /api/auth/stripe
 * @param {string} sessionToken - WorkosCursorSessionToken
 * @returns {Promise<Object>} { success, data?, error? }
 */
export async function checkSubscription(sessionToken) {
  try {
    const response = await fetch('/api/check-stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sessionToken })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error.message || '请求失败'
    }
  }
}

/**
 * 调用用量接口 - POST /api/dashboard/get-aggregated-usage-events
 * @param {string} sessionToken - WorkosCursorSessionToken
 * @returns {Promise<Object>} { success, data?, error? }
 */
export async function checkUsage(sessionToken) {
  try {
    const response = await fetch('/api/check-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: sessionToken })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error.message || '请求失败'
    }
  }
}

/**
 * 同时查询订阅和用量信息
 * @param {string} sessionToken - WorkosCursorSessionToken
 * @returns {Promise<Object>} { success, subscription?, usage?, error? }
 */
export async function checkAll(sessionToken) {
  const [subResult, usageResult] = await Promise.all([
    checkSubscription(sessionToken),
    checkUsage(sessionToken)
  ])
  
  if (subResult.success && usageResult.success) {
    return {
      success: true,
      subscription: subResult.data,
      usage: usageResult.data
    }
  }
  
  return {
    success: false,
    error: `订阅查询: ${subResult.error || 'OK'} | 用量查询: ${usageResult.error || 'OK'}`
  }
}

