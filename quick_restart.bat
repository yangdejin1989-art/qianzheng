@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    重启签证系统
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 启动后端服务...
start "后端服务" cmd /k "cd server && node index.js"

timeout /t 3 /nobreak >nul

echo [2/2] 启动前端服务...
start "前端服务" cmd /k "cd client && npm start"

echo.
echo ========================================
echo    服务启动完成！
echo ========================================
echo.
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:5000
echo.
echo 请等待20秒左右，前端编译完成后再访问
echo.
pause

