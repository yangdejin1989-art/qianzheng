@echo off
chcp 65001 > nul
echo ================================
echo 配置韩国签证材料和问答
echo ================================
echo.

cd server
node init_korea_materials_questions.js

echo.
pause

