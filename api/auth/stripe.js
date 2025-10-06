// Vercel Serverless Function
// 代理Cursor API请求，解决CORS问题

export default async function handler(req, res) {
  // 动态设置CORS头（支持credentials）
  const origin = req.headers.origin || req.headers.referer || '*';
  
  // 如果有具体的origin，则设置为该origin（支持credentials）
  // 否则使用通配符（但此时不能使用credentials）
  if (origin !== '*') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Cursor-Token, Content-Type, Authorization');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 【调试】记录所有请求头
    console.log('[API] === 开始处理请求 ===');
    console.log('[API] 请求方法:', req.method);
    console.log('[API] Origin:', req.headers.origin);
    console.log('[API] 所有请求头:', JSON.stringify(req.headers, null, 2));
    
    // 获取Token（优先从header，其次从cookie）
    let token = req.headers['x-cursor-token'];
    console.log('[API] 从 X-Cursor-Token header 获取:', token ? `存在，长度${token.length}` : '不存在');
    
    if (!token && req.headers.cookie) {
      console.log('[API] 尝试从 Cookie 获取...');
      const cookies = req.headers.cookie.split(';');
      for (const cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith('WorkosCursorSessionToken=')) {
          token = trimmed.split('=')[1];
          console.log('[API] 从 Cookie 获取成功');
          break;
        }
      }
    }

    if (!token) {
      console.error('[API] ❌ 未找到Token！');
      return res.status(400).json({
        error: '缺少WorkosCursorSessionToken',
        hint: '请在请求头中包含 X-Cursor-Token',
        debug: {
          hasXCursorToken: !!req.headers['x-cursor-token'],
          hasCookie: !!req.headers.cookie,
          receivedHeaders: Object.keys(req.headers)
        }
      });
    }

    console.log(`[API] ✅ Token获取成功！`);
    console.log(`[API] Token长度: ${token.length}`);
    console.log(`[API] Token前缀: ${token.substring(0, 20)}...`);
    console.log(`[API] Token格式检查: ${token.startsWith('user_') ? '✅ 正确' : '⚠️ 可能不正确'}`);

    // 转发请求到Cursor API（使用原生fetch，Vercel运行时支持）
    console.log('[API] 准备转发请求到 Cursor API...');
    const cursorHeaders = {
      'Cookie': `WorkosCursorSessionToken=${token}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://www.cursor.com',
      'Referer': 'https://www.cursor.com/',
    };
    console.log('[API] 发送的Headers:', JSON.stringify(cursorHeaders, null, 2));
    
    const response = await fetch('https://www.cursor.com/api/auth/stripe', {
      method: 'GET',
      headers: cursorHeaders,
    });

    console.log(`[API] ⬅️ Cursor API响应状态: ${response.status} ${response.statusText}`);
    const responseText = await response.text();
    console.log(`[API] 响应内容长度: ${responseText.length}`);
    console.log(`[API] 响应内容前300字符: ${responseText.substring(0, 300)}`);

    // 返回响应
    if (!response.ok) {
      console.error(`[API] ❌ Cursor API返回错误: ${response.status}`);
      console.error(`[API] 错误响应内容: ${responseText}`);
      
      return res.status(response.status).json({
        error: `Cursor API返回 ${response.status}`,
        details: responseText.substring(0, 500),
        hint: response.status === 401 ? 'Token可能无效或已过期，请检查Token是否正确' : '请求失败',
        debug: {
          status: response.status,
          statusText: response.statusText,
          fullResponse: responseText,
          tokenPrefix: token.substring(0, 20),
          tokenLength: token.length
        }
      });
    }
    
    console.log('[API] ✅ 请求成功！');

    // 尝试解析JSON
    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch (e) {
      // 如果不是JSON，返回原始文本
      return res.status(200).json({
        raw: responseText,
        note: '响应不是JSON格式'
      });
    }

  } catch (error) {
    console.error('[API] 错误:', error);
    
    return res.status(500).json({
      error: '服务器错误',
      message: error.message,
      stack: error.stack?.substring(0, 200)
    });
  }
}

