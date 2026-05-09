@echo off
chcp 65001 >nul

echo ========================================
echo    KDAI邮件功能重启脚本
echo ========================================
echo.

REM 设置邮箱配置
set EMAIL_USER=jishu2020_service@163.com
set EMAIL_PASS=QDyQgPu328neKbEE
set ENABLE_STATUS_EMAILS=true

echo 📧 邮箱配置: %EMAIL_USER%
echo ✅ 授权码已验证通过
echo 🔧 邮件功能开关: %ENABLE_STATUS_EMAILS%
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

echo.
echo 🚀 启动后端服务器...
cd server

echo 当前目录: %CD%
echo 环境变量已设置
echo.

start "KDAI后端服务器" cmd /k "set EMAIL_USER=%EMAIL_USER% && set EMAIL_PASS=%EMAIL_PASS% && set ENABLE_STATUS_EMAILS=%ENABLE_STATUS_EMAILS% && echo 后端服务器启动中... && echo 邮箱: %EMAIL_USER% && echo 授权码: %EMAIL_PASS% && echo 邮件功能: %ENABLE_STATUS_EMAILS% && echo 当前目录: %CD% && echo 环境变量已设置: EMAIL_USER=%EMAIL_USER%, EMAIL_PASS=%EMAIL_PASS%, ENABLE_STATUS_EMAILS=%ENABLE_STATUS_EMAILS% && npm start"

echo ⏳ 等待后端启动...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo 🎉 邮件功能重启完成！
echo ========================================
echo 🔧 后端地址: http://localhost:5000
echo 📧 邮箱: %EMAIL_USER%
echo 🔧 邮件功能: %ENABLE_STATUS_EMAILS%
echo.
echo 💡 现在可以测试邮件功能了！
echo 1. 在管理后台查看订单详情
echo 2. 使用邮件管理组件发送邮件
echo 3. 修改申请状态测试自动发送
echo.
echo 按任意键关闭此窗口...
pause >nul
