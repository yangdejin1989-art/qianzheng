@echo off
chcp 65001 >nul
color 0C
title 停止季舒签证系统

echo.
echo ╔════════════════════════════════════════╗
echo ║      停止季舒签证申请系统服务        ║
echo ╚════════════════════════════════════════╝
echo.

echo [1/3] 停止前端服务（端口3000）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    echo    正在停止进程 %%a...
    taskkill /F /PID %%a >nul 2>&1
)
echo ✅ 前端服务已停止
echo.

echo [2/3] 停止后端服务（端口5000）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 2^>nul') do (
    echo    正在停止进程 %%a...
    taskkill /F /PID %%a >nul 2>&1
)
echo ✅ 后端服务已停止
echo.

echo [3/3] 清理后台Node进程...
taskkill /F /IM node.exe >nul 2>&1
echo ✅ 清理完成
echo.

echo ════════════════════════════════════════
echo.
echo 🎉 所有服务已停止！
echo.
echo 记录日志: startup.log
echo.
echo ════════════════════════════════════════
echo.

REM 记录停止日志
echo [%date% %time%] 系统停止 >> startup.log

timeout /t 3
exit


