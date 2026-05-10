$body1 = '{"imageUrl":"https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200","position":"center","order":0,"visible":true}'
$body2 = '{"imageUrl":"https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200","position":"center","order":1,"visible":true}'
$body3 = '{"imageUrl":"https://images.unsplash.com/photo-1521737711867-e3b97375f905?w=1200","position":"center","order":2,"visible":true}'
$body4 = '{"imageUrl":"https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200","position":"center","order":3,"visible":true}'

Invoke-RestMethod -Uri 'http://localhost:5000/api/carousels' -Method Post -ContentType 'application/json' -Body $body1
Invoke-RestMethod -Uri 'http://localhost:5000/api/carousels' -Method Post -ContentType 'application/json' -Body $body2
Invoke-RestMethod -Uri 'http://localhost:5000/api/carousels' -Method Post -ContentType 'application/json' -Body $body3
Invoke-RestMethod -Uri 'http://localhost:5000/api/carousels' -Method Post -ContentType 'application/json' -Body $body4

Write-Host "4张轮播图添加完成！"