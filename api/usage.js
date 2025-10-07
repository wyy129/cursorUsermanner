/**
 * Vercel Serverless Function - Usage API 代理
 * 用于查询 Cursor 账号的使用统计
 */

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // 只接受POST请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '方法不允许' });
    }
    
    const { token, teamId = -1, startDate, endDate } = req.body;
    
    if (!token) {
        return res.status(400).json({ error: '缺少 Token' });
    }
    
    try {
        const payload = JSON.stringify({
            teamId: teamId,
            startDate: startDate,
            endDate: endDate
        });
        
        const headers = {
            'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'accept': '*/*',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'empty',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'zh-CN,zh;q=0.9',
            'content-type': 'application/json',
            'priority': 'u=1, i',
            'origin': 'https://cursor.com',
            'sec-ch-ua-arch': '"x86"',
            'sec-ch-ua-bitness': '"64"',
            'sec-ch-ua-platform-version': '"10.0.0"',
            'referer': 'https://cursor.com/cn/dashboard?tab=usage',
            'cookie': `WorkosCursorSessionToken=${token}`
        };
        
        const response = await fetch('https://cursor.com/api/dashboard/get-aggregated-usage-events', {
            method: 'POST',
            headers: headers,
            body: payload
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cursor API Error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `Cursor API 返回错误: ${response.status}`,
                details: errorText
            });
        }
        
        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        console.error('Request Error:', error);
        return res.status(500).json({ 
            error: '请求失败',
            message: error.message 
        });
    }
}

