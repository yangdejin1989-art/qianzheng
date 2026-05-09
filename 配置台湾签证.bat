@echo off
chcp 65001 >nul
cls
echo ========================================
echo   日本在留人士赴台签证配置工具
echo ========================================
echo.
echo 此脚本将重新配置台湾签证的4个客户类型
echo.
echo 配置内容：
echo   • 个人旅游-留学生（12个材料）
echo   • 个人旅游-永驻（8个材料）
echo   • 个人旅游-工作签证（11个材料）
echo   • 个人旅游-家族签证（9个材料）
echo   • 28个通用问题
echo.
echo ----------------------------------------
echo.

cd /d "%~dp0"
cd server

echo 正在运行配置脚本...
echo.

node init_taiwan_japan_resident.js

echo.
echo ========================================
echo   配置完成！
echo ========================================
echo.
echo 请在管理后台查看配置结果
echo.
pause

