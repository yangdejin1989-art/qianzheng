@echo off
chcp 65001 >nul

echo ========================================
echo    KDAI双验证系统测试
echo ========================================
echo.

echo 🚀 启动后端服务器...
cd server
start "KDAI后端服务器" cmd /k "npm start"

echo ⏳ 等待服务器启动...
timeout /t 5 /nobreak >nul

echo 🧪 运行测试...
cd ..
node complete-test.js

echo.
echo 测试完成！按任意键退出...
pause
