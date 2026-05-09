@echo off
chcp 65001 >nul

echo ========================================
echo    KDAI数据库清理工具
echo ========================================
echo.
echo 🧹 即将清理数据库中的旧索引和字段...
echo ⚠️  此操作将删除queryCode相关的所有数据
echo.
echo 请确保：
echo 1. MongoDB服务正在运行
echo 2. 已备份重要数据（如有需要）
echo.
pause

echo.
echo 🚀 开始清理数据库...
cd server
node cleanup-database.js

echo.
echo 清理完成！按任意键退出...
pause
