@echo off
chcp 65001 >nul
title 初始化签证模板 - 美国/台湾/韩国

echo ========================================
echo   签证模板初始化程序
echo   美国 ^| 台湾 ^| 韩国
echo ========================================
echo.

echo 正在检查环境...
echo.

REM 检查Node.js是否安装
node -v >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo [✓] Node.js 已安装
echo.

REM 检查MongoDB是否运行
echo 正在检查MongoDB连接...
echo.

REM 运行初始化脚本（2025最新版）
echo 开始初始化签证模板...
echo.
cd server
node init_visa_2025.js
cd ..

echo.
echo ========================================
if errorlevel 1 (
    echo   初始化失败，请检查错误信息
) else (
    echo   初始化完成！
)
echo ========================================
echo.

pause

