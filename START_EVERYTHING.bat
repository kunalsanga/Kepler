@echo off
echo.
echo ========================================
echo   Starting Ollama + Cloudflare Tunnel
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check if Ollama is running
echo [1/2] Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo        [OK] Ollama is running
) else (
    echo        [WARNING] Ollama might not be running
    echo        Starting Ollama in background...
    start "" "ollama serve"
    timeout /t 3 /nobreak >nul
    echo        [OK] Ollama started
)
echo.

REM Start tunnel
echo [2/2] Starting Cloudflare Tunnel...
echo.
echo ========================================
echo   IMPORTANT: COPY THE URL BELOW!
echo ========================================
echo.
echo Your tunnel URL will appear in a moment...
echo.
echo Keep this window open while using the app!
echo.
echo Press Ctrl+C to stop
echo.
echo ========================================
echo.

REM Start tunnel
cloudflared.exe tunnel --url http://localhost:11434

pause

