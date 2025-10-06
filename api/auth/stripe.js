// Vercel Serverless Function
// 代理Cursor API请求，解决CORS问题

module.exports = async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Cursor-Token, Content-Type');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取Token（优先从header，其次从cookie）
    let token = req.headers['x-cursor-token'];
    
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';');
      for (const cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith('WorkosCursorSessionToken=')) {
          token = trimmed.split('=')[1];
          break;
        }
      }
    }

    if (!token) {
      return res.status(400).json({
        error: '缺少WorkosCursorSessionToken',
        hint: '请在请求头中包含 X-Cursor-Token'
      });
    }

    console.log(`[API] 处理请求，Token前10位: ${token.substring(0, 10)}...`);

    // 使用原生fetch（Node.js 18+）或node-fetch
    let fetchFn = global.fetch;
    if (!fetchFn) {
      // 如果Node.js版本较低，使用node-fetch
      fetchFn = require('node-fetch');
    }

    // 转发请求到Cursor API
    const response = await fetchFn('https://www.cursor.com/api/auth/stripe', {
      method: 'GET',
      headers: {
        'Cookie': `WorkosCursorSessionToken=${token}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://www.cursor.com',
        'Referer': 'https://www.cursor.com/',
      },
    });

    console.log(`[API] Cursor API响应: ${response.status}`);

    // 返回响应
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Cursor API返回错误: ${response.status}`,
        details: errorText.substring(0, 200)
      });
    }

    const data = await response.json();
    
    return res.status(200).json(data);

  } catch (error) {
    console.error('[API] 错误:', error);
    
    return res.status(500).json({
      error: '服务器错误',
      message: error.message,
      type: error.name
    });
  }
};

