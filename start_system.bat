@echo off
setlocal enabledelayedexpansion

REM Define Python executable path (fallback to global python if no local venv)
if exist "venv\Scripts\python.exe" (
    set PYTHON_EXE="%~dp0venv\Scripts\python.exe"
) else (
    set PYTHON_EXE=python
)

echo =========================================
echo   Starting Smart Parking System...
echo =========================================
echo.

echo [1] Starting Backend API Server (Node.js)...
cd /d "%~dp0backend-js"
start "Smart Parking - Node.js Backend" cmd /k "node src/server.js"
cd /d "%~dp0"

echo.
echo [2] Starting Frontend Dashboard (React/Vite)...
cd /d "%~dp0frontend"
start "Smart Parking - React Frontend" cmd /k "npm run dev"
cd /d "%~dp0"

echo.
echo [3] Starting CV Module (License Plate Detection)...
cd /d "%~dp0"
echo Starting camera module...
start "Smart Parking - LPR System" cmd /k "%PYTHON_EXE% lpr_sequential.py"

echo.
echo =========================================
echo   System Started Successfully!
echo =========================================
echo - Dashboard: http://localhost:5173
echo - Backend API: http://localhost:5000
echo - Entry Camera: Running (window 1)
echo.
echo NOTE: MongoDB service is hosted on Atlas Cloud!
echo.
echo (Close the terminal windows to stop the servers.)
pause
