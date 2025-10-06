// 健康检查端点

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    status: 'ok',
    message: 'Cursor User Manager API is running on Vercel',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
};
