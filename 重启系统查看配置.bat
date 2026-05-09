@echo off
chcp 65001 >nul
title 重启系统查看配置

echo ========================================
echo   重启签证管理系统（清除缓存）
echo ========================================
echo.

echo [1/4] 正在停止所有服务...
taskkill /F /IM node.exe 2>nul
echo ✅ 服务已停止
timeout /t 2 >nul

echo.
echo [2/4] 正在启动后端服务...
cd server
start "后端服务" cmd /k "node index.js"
timeout /t 5 >nul
cd ..
echo ✅ 后端服务已启动

echo.
echo [3/4] 正在启动前端服务...
cd client
start "前端服务" cmd /k "npm start"
cd ..
echo ✅ 前端服务已启动

echo.
echo [4/4] 系统启动完成！
echo.
echo ========================================
echo   📋 接下来的步骤：
echo ========================================
echo.
echo 1. 等待30秒让服务完全启动
echo 2. 打开浏览器访问 http://localhost:3000
echo 3. 按 Ctrl + Shift + Delete 清空浏览器缓存
echo 4. 重新登录管理后台
echo 5. 进入【材料与问题管理】
echo 6. 选择任意签证类型
echo.
echo ✅ 现在应该能看到正确的配置了！
echo.
echo    美国签证：旅游(B1/B2)、商务(B1)、学生(F1)
echo    台湾签证：个人旅游、商务入台、探亲入台
echo    韩国签证：个人旅游(C-3)、探亲访友、商务签证
echo.
echo ========================================
echo.

pause

