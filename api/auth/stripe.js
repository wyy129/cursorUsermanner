// Vercel Serverless Function
// 用于代理Cursor API请求，解决CORS问题

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Cursor-Token, Content-Type');

    // 处理OPTIONS预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // 从header获取Token（可能是URL编码的）
        let token = req.headers['x-cursor-token'];
        
        if (!token) {
            return res.status(400).json({ 
                error: 'Missing token',
                message: '请在X-Cursor-Token头中提供Token'
            });
        }

        console.log(`[API] 收到Token（原始）: ${token.substring(0, 50)}...`);

        // Token可能是解码状态（::），需要编码为（%3A%3A）再放到Cookie中
        let cookieToken = token;
        
        // 如果Token已经是解码状态（包含::），需要编码
        if (token.includes('::') && !token.includes('%')) {
            cookieToken = encodeURIComponent(token);
            console.log(`[API] Token已编码为Cookie格式: ${cookieToken.substring(0, 50)}...`);
        } else if (token.includes('%')) {
            // 已经是编码状态，直接使用
            console.log(`[API] Token已是编码格式，直接使用`);
        }
        
        console.log(`[API] 最终Cookie: WorkosCursorSessionToken=${cookieToken.substring(0, 50)}...`);
        
        // 转发请求到Cursor API - Cookie中必须是URL编码格式（%3A%3A）
        const response = await fetch('https://www.cursor.com/api/auth/stripe', {
            method: 'GET',
            headers: {
                'Cookie': `WorkosCursorSessionToken=${cookieToken}`,
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.cursor.com/',
                'Origin': 'https://www.cursor.com',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Ch-Ua': '"Chromium";v="130", "Microsoft Edge";v="130"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"'
            }
        });

        const data = await response.text();
        
        console.log(`[API] Cursor API响应: ${response.status}`);

        // 转发响应
        if (response.ok) {
            const jsonData = JSON.parse(data);
            console.log(`[API] ✅ 查询成功: ${jsonData.membershipType}, 剩余${jsonData.daysRemainingOnTrial || '无限'}天`);
            return res.status(200).json(jsonData);
        } else {
            console.log(`[API] ❌ 失败: ${data}`);
            return res.status(response.status).json({ 
                error: 'Token可能已过期或无效',
                message: '请确认Token是最新的且尚未过期',
                cursor_error: data,
                status: response.status
            });
        }

    } catch (error) {
        console.error('[API] 错误:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
}
