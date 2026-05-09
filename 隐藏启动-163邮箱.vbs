Set WshShell = CreateObject("WScript.Shell")
' 使用163邮箱启动系统（最小化窗口）
WshShell.Run "后台启动-163邮箱.bat", 7, False
Set WshShell = Nothing

