@echo off
echo.
echo ========================================
echo   Starting Kepler AI - All Services
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check if Ollama is running
echo [1/4] Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo        [OK] Ollama is running
) else (
    echo        [STARTING] Ollama...
    start "Ollama" cmd /k "ollama serve"
    timeout /t 3 /nobreak >nul
    echo        [OK] Ollama started
)
echo.

REM Start Generation Services
echo [2/4] Starting Image & Video Generation Services...
call START_GENERATION_SERVICES.bat
echo.

REM Start Next.js
echo [4/4] Starting Next.js...
if exist "node_modules" (
    start "Next.js" cmd /k "npm run dev"
    echo        [OK] Next.js starting on port 3000
) else (
    echo        [ERROR] node_modules not found - run 'npm install' first
    pause
    exit /b 1
)
echo.

echo ========================================
echo   All services starting...
echo ========================================
echo.
echo Open http://localhost:3000 in your browser
echo.
echo Keep all terminal windows open!
echo Press any key to exit this window (services will keep running)
pause >nul

