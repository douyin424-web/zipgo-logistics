@echo off
title ZipGo - start locally
cd /d "%~dp0"
set "NODE_OPTIONS=--experimental-sqlite %NODE_OPTIONS%"

echo.
echo  ZipGo - starting the backend and the website on this computer
echo  ==============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js is not installed. Install "Node.js 22 LTS" from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=5)?0:1)"
if errorlevel 1 (
  echo  Your Node.js is too old. Install "Node.js 22 LTS" or newer from https://nodejs.org and run this file again.
  node -v
  pause
  exit /b 1
)

netstat -ano | findstr /R /C:":4000 .*LISTENING" >nul
if not errorlevel 1 (
  echo  Port 4000 is already in use.
  echo  Close the old map backend ^(indrive-backend-geospatial^) or an earlier ZipGo window, then run this again.
  pause
  exit /b 1
)

rem ── First run: create the settings files ──────────────────────
if not exist "zipgo-backend\.env" (
  echo  Creating zipgo-backend\.env with local settings...
  copy /Y "zipgo-backend\local.env.template" "zipgo-backend\.env" >nul
  echo.>> "zipgo-backend\.env"
  echo # Random secret for login tokens - created by start-zipgo.bat>> "zipgo-backend\.env"
  node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))" >> "zipgo-backend\.env"
  if exist "indrive-backend-geospatial\.env" (
    echo  Copying your WhatsApp settings from the old map backend...
    echo # WhatsApp settings copied from indrive-backend-geospatial\.env>> "zipgo-backend\.env"
    findstr /B /C:"WHATSAPP_" "indrive-backend-geospatial\.env" >> "zipgo-backend\.env"
  )
)

if not exist ".env.local" (
  echo  Creating .env.local so the website uses the local backend...
  echo VITE_API_URL=http://localhost:4000> ".env.local"
)

if not exist "zipgo-backend\node_modules" (
  echo  Installing backend packages - first time only...
  pushd zipgo-backend
  call npm install
  popd
)

if not exist "node_modules" (
  echo  Installing website packages - first time only...
  call npm install
)

if not exist "dist" (
  echo  Building website for unified host...
  call npm run build
)

start "ZipGo Unified Server (port 4000)" /D "%~dp0zipgo-backend" cmd /k npm run dev

echo  Waiting for ZipGo to start...
timeout /t 5 /nobreak >nul
start "" "http://localhost:4000/business"
start "" "http://localhost:4000/rider"

echo.
echo  ==============================================================
echo   ZipGo Unified Server is running on ONE SINGLE HOST (port 4000)!
echo  ==============================================================
echo    Website:          http://localhost:4000
echo    Business Portal:  http://localhost:4000/business
echo    Rider Portal:     http://localhost:4000/rider
echo    Backend Health:   http://localhost:4000/health
echo    Live Tracking:    http://localhost:4000/track/
echo.
echo  To stop: close the ZipGo window.
pause
