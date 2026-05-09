@echo off
REM 一键重启后端服务，不影响前端

echo 正在尝试关闭已有的后端进程...
taskkill /F /FI "WINDOWTITLE eq Backend Server*" >nul 2>nul
REM 等待1秒确保进程关闭
timeout /t 1 >nul

echo 启动后端服务器...
start "Backend Server" cmd /k "cd server && node index.js"

echo 后端已重启！
pause