# 重启签证系统服务

Write-Host "🔄 正在重启签证系统..." -ForegroundColor Cyan

# 切换到项目目录
Set-Location -Path "C:\Users\YANG\Desktop\签证\qianzheng"

# 启动后端
Write-Host "`n📡 启动后端服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\YANG\Desktop\签证\qianzheng\server'; node index.js"

# 等待2秒
Start-Sleep -Seconds 2

# 启动前端
Write-Host "🌐 启动前端服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\YANG\Desktop\签证\qianzheng\client'; npm start"

Write-Host "`n✅ 服务启动完成！" -ForegroundColor Green
Write-Host "前端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "后端地址: http://localhost:5000" -ForegroundColor Cyan
Write-Host "`n⚠️  请等待20秒左右，前端编译完成后再访问" -ForegroundColor Yellow

