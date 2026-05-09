@echo off
chcp 65001 >nul

echo ========================================
echo    KDAI 163邮箱配置测试
echo ========================================
echo.

echo 🚀 启动后端服务器进行测试...
cd server
start "KDAI后端测试" cmd /k "npm start"

echo ⏳ 等待服务器启动...
timeout /t 8 /nobreak >nul

echo 🧪 运行163邮箱测试...
cd ..
node complete-test.js

echo.
echo 测试完成！按任意键退出...
pause
