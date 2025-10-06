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
        
        // 尝试多种Cookie格式
        const cookieFormats = [
            `WorkosCursorSessionToken=${token}`,
            `WorkosCursorSessionToken=${encodeURIComponent(token)}`,
        ];
        
        console.log(`[API] 尝试第一种Cookie格式...`);
        
        // 转发请求到Cursor API - 使用更完整的headers模拟真实浏览器
        const response = await fetch('https://www.cursor.com/api/auth/stripe', {
            method: 'GET',
            headers: {
                'Cookie': cookieFormats[0],
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
            
            // 如果失败，尝试第二种Cookie格式
            if (response.status === 401) {
                console.log(`[API] 尝试URL编码的Cookie格式...`);
                const response2 = await fetch('https://www.cursor.com/api/auth/stripe', {
                    method: 'GET',
                    headers: {
                        'Cookie': cookieFormats[1],
                        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
                        'Accept': 'application/json',
                        'Referer': 'https://www.cursor.com/',
                        'Origin': 'https://www.cursor.com'
                    }
                });
                
                const data2 = await response2.text();
                console.log(`[API] 第二次尝试响应: ${response2.status}`);
                
                if (response2.ok) {
                    const jsonData = JSON.parse(data2);
                    console.log(`[API] ✅ 第二次成功!`);
                    return res.status(200).json(jsonData);
                } else {
                    console.log(`[API] ❌ 第二次也失败: ${data2}`);
                }
            }
            
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
