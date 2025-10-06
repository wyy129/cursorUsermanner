@echo off
chcp 65001 >nul
title Cursor 用户管理系统

echo ╔════════════════════════════════════════╗
echo ║   Cursor 用户管理系统启动脚本         ║
echo ╚════════════════════════════════════════╝
echo.

echo [1/2] 启动后端代理服务...
start "Cursor API 代理" cmd /k "cd server && npm start"

echo 等待后端服务启动...
timeout /t 5 /nobreak > nul

echo [2/2] 启动前端应用...
start "Cursor 前端" cmd /k "npm run dev"

echo.
echo ✅ 所有服务已启动！
echo.
echo 📝 访问地址:
echo    前端: http://localhost:3000
echo    后端: http://localhost:3001
echo.
echo 💡 使用提示:
echo    1. 在界面上开启 "使用后端代理" 开关
echo    2. 粘贴您的 WorkosCursorSessionToken
echo    3. 点击查询按钮
echo.
pause

