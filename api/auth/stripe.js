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

        // 检查是否包含URL编码，如果是则解码
        if (token.includes('%')) {
            token = decodeURIComponent(token);
            console.log(`[API] Token已解码: ${token.substring(0, 50)}...`);
        }
        
        // 验证Token格式（应该包含::而不是%3A%3A）
        if (!token.includes('::')) {
            console.log('[API] ⚠️ Token格式可能不正确，缺少::分隔符');
        }
        
        console.log(`[API] 最终Token: ${token.substring(0, 50)}...`);
        
        // 转发请求到Cursor API - 使用解码后的Token
        const response = await fetch('https://www.cursor.com/api/auth/stripe', {
            method: 'GET',
            headers: {
                'Cookie': `WorkosCursorSessionToken=${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://www.cursor.com/',
                'Origin': 'https://www.cursor.com'
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
                error: 'Cursor API Error',
                status: response.status,
                data: data
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
