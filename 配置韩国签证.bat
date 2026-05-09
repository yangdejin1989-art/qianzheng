@echo off
chcp 65001 > nul
echo ================================
echo 配置韩国签证（日本出发）
echo ================================
echo.

cd server
node init_korea_visa.js

echo.
echo 配置完成！
echo.
pause

