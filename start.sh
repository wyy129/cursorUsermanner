#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║   Cursor 用户管理系统启动脚本         ║"
echo "╚════════════════════════════════════════╝"
echo ""

echo "[1/2] 启动后端代理服务..."
cd server
npm start &
BACKEND_PID=$!
echo "后端服务 PID: $BACKEND_PID"

sleep 5

echo "[2/2] 启动前端应用..."
cd ..
npm run dev &
FRONTEND_PID=$!
echo "前端应用 PID: $FRONTEND_PID"

echo ""
echo "✅ 所有服务已启动！"
echo ""
echo "📝 访问地址:"
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:3001"
echo ""
echo "💡 使用提示:"
echo "   1. 在界面上开启 '使用后端代理' 开关"
echo "   2. 粘贴您的 WorkosCursorSessionToken"
echo "   3. 点击查询按钮"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获中断信号
trap "echo ''; echo '停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 等待
wait

