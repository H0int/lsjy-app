@echo off
chcp 65001 >nul
title 罗圣纪元 - 停止服务
echo.
echo 正在停止后端服务...
taskkill /f /im node.exe 2>nul
echo.
echo 已停止。
timeout /t 2 >nul
