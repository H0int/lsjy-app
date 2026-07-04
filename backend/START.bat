@echo off
title LSJY-Backend
echo.
echo   LSJY Backend + Frontend Launcher
echo.

cd /d "%~dp0"

echo [1/2] Starting backend server...
start "LSJY-Backend" cmd /k "cd /d "%~dp0" && npm start"

echo [1/2] Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo [2/2] Opening frontend page...
start "" "%~dp0patched\index.html"

echo.
echo   Done!
echo   Backend: http://localhost:3000
echo   Frontend page opened.
echo   Do NOT close the backend window.
echo.

timeout /t 3 >nul
exit
