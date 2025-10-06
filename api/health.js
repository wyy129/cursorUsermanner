// 健康检查端点

export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Cursor User Manager API is running on Vercel',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
}

