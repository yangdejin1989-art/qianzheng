@echo off
chcp 65001 >nul
echo.
echo ====================================
echo   测试员工订单分配功能
echo ====================================
echo.
echo 正在启动测试...
echo.

cd /d "%~dp0"
node test_staff_assignment.js

echo.
echo 按任意键退出...
pause >nul

