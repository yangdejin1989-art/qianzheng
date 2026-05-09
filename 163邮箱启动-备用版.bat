@echo off
chcp 65001 >nul

echo ========================================
echo    季舒签证申请系统 - 163邮箱启动(备用版)
echo ========================================
echo.

REM 设置邮箱配置
set EMAIL_USER=jishu2020_service@163.com
set EMAIL_PASS=QDyQgPu328neKbEE

echo 📧 邮箱配置: %EMAIL_USER%
echo ✅ 授权码已验证通过
echo.

REM 检查Node.js
echo 🔍 检查Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到Node.js
    echo 请先安装Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js已安装
echo.

REM 检查项目目录
if not exist "server" (
    echo ❌ 错误：找不到server目录
    echo 请确保在正确的项目目录中运行此脚本
    pause
    exit /b 1
)

if not exist "client" (
    echo ❌ 错误：找不到client目录
    echo 请确保在正确的项目目录中运行此脚本
    pause
    exit /b 1
)

echo ✅ 项目结构检查通过
echo.

REM 清理端口占用
echo 🔍 检查端口占用...
netstat -aon | findstr :5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ 端口5000被占用，正在清理...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
        taskkill /f /pid %%a >nul 2>&1
    )
    echo ✅ 端口5000已释放
)

netstat -aon | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ 端口3000被占用，正在清理...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
        taskkill /f /pid %%a >nul 2>&1
    )
    echo ✅ 端口3000已释放
)

echo.
echo 🚀 启动后端服务器...
cd server
set EMAIL_USER=%EMAIL_USER%
set EMAIL_PASS=%EMAIL_PASS%

echo 当前目录: %CD%
echo 环境变量已设置
echo.

REM 使用PowerShell启动后端
powershell -Command "Start-Process cmd -ArgumentList '/k', 'echo 后端服务器启动中... && echo 邮箱: %EMAIL_USER% && echo 授权码: %EMAIL_PASS% && echo 当前目录: %CD% && npm start' -WindowStyle Normal"

echo ⏳ 等待后端启动...
timeout /t 8 /nobreak >nul

echo 🚀 启动前端服务器...
cd ..\client
echo 当前目录: %CD%
echo.

REM 使用PowerShell启动前端
powershell -Command "Start-Process cmd -ArgumentList '/k', 'echo 前端服务器启动中... && echo 当前目录: %CD% && npm start' -WindowStyle Normal"

echo.
echo ========================================
echo 🎉 系统启动完成！
echo ========================================
echo 📱 前端地址: http://localhost:3000
echo 🔧 后端地址: http://localhost:5000
echo 📧 邮箱: %EMAIL_USER%
echo.
echo 💡 功能说明：
echo - 支持双验证方式查询申请状态
echo - 方式一：姓名+手机号+绑定邮箱验证码
echo - 方式二：姓名+申请编码+绑定邮箱验证码
echo - 系统已配置为使用163邮箱发送验证码
echo.
echo 💡 使用提示：
echo - 前端页面会自动在浏览器中打开
echo - 如果遇到问题，请检查控制台输出
echo - 验证码将发送到用户填写的邮箱地址
echo.
echo 💡 备用启动方式：
echo - 如果此脚本仍有问题，请尝试主版本
echo - 或手动运行：cd server && npm start
echo.
echo 按任意键关闭此窗口...
pause >nul
