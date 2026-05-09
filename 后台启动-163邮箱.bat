@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

REM ========================================
REM 季舒签证申请系统 - 163邮箱后台启动
REM ========================================

REM 163邮箱配置
set EMAIL_USER=jishu2020_service@163.com
set EMAIL_PASS=QDyQgPu328neKbEE

REM 记录启动日志
echo [%date% %time%] 163邮箱模式启动 >> startup.log

REM 检查项目结构
if not exist "server\index.js" (
    echo [%date% %time%] 错误：找不到server\index.js >> startup.log
    exit /b 1
)

if not exist "client\package.json" (
    echo [%date% %time%] 错误：找不到client\package.json >> startup.log
    exit /b 1
)

REM 清理端口占用
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM 等待端口释放
timeout /t 2 /nobreak >nul

REM 设置环境变量
set EMAIL_USER=%EMAIL_USER%
set EMAIL_PASS=%EMAIL_PASS%

REM 启动后端服务（最小化窗口）
cd server
start "签证系统-后端" /min cmd /k "set EMAIL_USER=%EMAIL_USER% && set EMAIL_PASS=%EMAIL_PASS% && node index.js"
cd ..

REM 等待后端启动
timeout /t 8 /nobreak >nul

REM 启动前端服务（最小化窗口）
cd client
start "签证系统-前端" /min cmd /k "npm start"
cd ..

REM 等待前端启动
timeout /t 15 /nobreak >nul

REM 记录启动完成
echo [%date% %time%] 系统启动完成 - 163邮箱: %EMAIL_USER% >> startup.log

REM 自动打开浏览器
start http://localhost:3000

exit

