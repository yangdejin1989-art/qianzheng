@echo off
chcp 65001 >nul
echo ====================================
echo   重置管理员密码
echo ====================================
echo.
echo ⚠️  警告：此操作将重置admin账户密码
echo.
echo 新密码将设置为：admin123
echo.
pause

cd /d "%~dp0\server"

echo.
echo 正在重置密码...
echo.

node reset_admin_password.js

echo.
echo ====================================
pause

