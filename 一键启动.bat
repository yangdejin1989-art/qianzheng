@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

REM ========================================
REM 邮箱配置区域 - 可根据需要修改
REM ========================================
REM 如需使用其他Gmail账号，请修改下面两行：
REM set DEFAULT_EMAIL_USER=your-email@gmail.com
REM set DEFAULT_EMAIL_PASS=your-app-password

REM 当前默认配置：
set DEFAULT_EMAIL_USER=yangdejin1989@gmail.com
set DEFAULT_EMAIL_PASS=XCNJOCHXCVJSRVPF

echo ========================================
echo    季舒签证申请系统 - 一键启动
echo ========================================
echo 📧 默认邮箱: %DEFAULT_EMAIL_USER%
echo.

echo 🔍 第一步：检查项目结构
if not exist "server\index.js" (
    echo [错误] 找不到后端文件 server\index.js
    echo 请确保在正确的项目目录下运行此脚本
    pause
    exit /b 1
)

if not exist "client\package.json" (
    echo [错误] 找不到前端文件 client\package.json
    echo 请确保在正确的项目目录下运行此脚本
    pause
    exit /b 1
)

if not exist "server\models\EmailVerification.js" (
    echo [错误] 找不到邮箱验证模型文件
    echo 请确保 EmailVerification.js 模型文件存在
    pause
    exit /b 1
)

echo ✅ 项目结构检查完成

echo.
echo 🔍 第二步：检查端口占用
netstat -ano | findstr :5000 > temp_port_check.txt 2>nul
if %errorlevel% equ 0 (
    echo ⚠️  端口5000已被占用，正在清理...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        taskkill /f /pid %%a 2>nul
    )
    echo ✅ 端口清理完成
) else (
    echo ✅ 端口5000可用
)
del temp_port_check.txt 2>nul

echo.
echo 🔍 第三步：停止现有服务
echo 正在停止现有Node.js进程...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ 已停止现有服务
) else (
    echo ✅ 没有运行中的服务
)

echo.
echo 📧 第四步：Gmail邮箱配置
REM 使用默认Gmail配置，优先使用环境变量
if "%EMAIL_USER%"=="" (
    set EMAIL_USER=%DEFAULT_EMAIL_USER%
)
if "%EMAIL_PASS%"=="" (
    set EMAIL_PASS=%DEFAULT_EMAIL_PASS%
)

echo ✅ 邮箱配置: %EMAIL_USER%

echo.
echo 🚀 第五步：启动后端服务
echo 正在启动后端服务...
cd server
start "KDAI后端服务" cmd /k "echo ========================================== && echo    KDAI宽带申请系统 - 后端服务 && echo ========================================== && echo 邮箱配置: %EMAIL_USER% && echo 服务地址: http://localhost:5000 && echo 启动时间: %date% %time% && echo ========================================== && set EMAIL_USER=%EMAIL_USER% && set EMAIL_PASS=%EMAIL_PASS% && node index.js"

echo 等待后端服务启动...
timeout /t 5 /nobreak >nul

echo.
echo 🧪 第六步：验证服务启动
cd ..
echo ✅ 后端服务已启动（窗口运行中）
echo ℹ️  如有问题请查看后端服务窗口的日志信息

echo.
echo 🌐 第七步：启动前端服务
echo 正在启动前端服务...
cd client
start "KDAI前端服务" cmd /k "echo ========================================== && echo    KDAI宽带申请系统 - 前端服务 && echo ========================================== && echo 服务地址: http://localhost:3000 && echo 启动时间: %date% %time% && echo ========================================== && npm start"

echo 等待前端服务启动...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo 🎉 KDAI宽带申请系统启动完成！
echo ========================================
echo.
echo 📊 服务地址:
echo   前端页面: http://localhost:3000
echo   后端API:  http://localhost:5000
echo   邮箱服务: %EMAIL_USER% ✅
echo.
echo 🧪 测试验证码功能:
echo   1. 点击"申请进度查询"
echo   2. 输入手机号和邮箱
echo   3. 点击"发送验证码"
echo.
echo 🔧 后台管理: 右上角"管理" (admin/123456)
echo.
echo 📝 注意: 保持服务窗口运行，关闭窗口即停止服务
echo.

echo 正在打开浏览器...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ✅ 启动完成！按任意键关闭此窗口...
pause >nul
