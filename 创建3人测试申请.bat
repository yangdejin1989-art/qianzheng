@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    创建3人测试申请（1主申请人 + 2同行人）
echo ========================================
echo.

cd server
node test_3_persons.js

echo.
echo 按任意键关闭窗口...
pause >nul


