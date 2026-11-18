@echo off
title ZipGo - Live on Cloudflare
cd /d "%~dp0"
set "NODE_OPTIONS=--experimental-sqlite %NODE_OPTIONS%"

echo.
echo  ==============================================================
echo   ZipGo Express - Launching Live on Cloudflare
echo  ==============================================================
echo.

rem Check if server is running on port 4000
netstat -ano | findstr /R /C:":4000 .*LISTENING" >nul
if errorlevel 1 (
  echo  Starting ZipGo server on port 4000...
  start "ZipGo Server (port 4000)" cmd /k "node zipgo-backend\src\server.js"
  timeout /t 3 /nobreak >nul
) else (
  echo  ZipGo server is already running on port 4000.
)

echo.
echo  Starting Cloudflare Live Tunnel...
echo  Your public live HTTPS link will appear below (look for https://*.trycloudflare.com):
echo  ==============================================================
echo.
"%~dp0cloudflared.exe" tunnel --url http://localhost:4000
pause
