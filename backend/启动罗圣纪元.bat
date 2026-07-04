@echo off
chcp 65001 >nul
title 罗圣纪元 - 一键启动

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   罗圣纪元平台 - 一键启动            ║
echo  ║   后端服务 + 前端页面                ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/2] 正在启动后端服务...
start "罗圣纪元后端" cmd /k "cd /d "%~dp0" && npm start"

echo [1/2] 等待后端启动（5秒）...
timeout /t 5 /nobreak >nul

echo [2/2] 正在打开前端页面...
start "" "%~dp0patched\index.html"

echo.
echo  ══════════════════════════════════════
echo   启动完成！
echo   后端地址: http://localhost:3000
echo   前端页面已自动打开
echo   
echo   注意: 不要关闭"罗圣纪元后端"窗口
echo         关闭后端窗口服务会停止
echo  ══════════════════════════════════════
echo.

timeout /t 3 >nul
exit
