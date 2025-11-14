@echo off
echo.
echo ========================================
echo  Cloudflare Tunnel - Quick Start
echo ========================================
echo.
echo This will expose your local Ollama server
echo.
echo IMPORTANT: Look for a URL that starts with:
echo    https://llm-xxxxx-xxxxx.trycloudflare.com
echo.
echo COPY THAT URL - You'll need it for Vercel!
echo.
echo Press Ctrl+C to stop the tunnel
echo.
echo ========================================
echo.

REM Check if Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Ollama is running
) else (
    echo [WARNING] Ollama might not be running
    echo Make sure to run: ollama serve
)
echo.

REM Start tunnel
cloudflared.exe tunnel --url http://localhost:11434

pause

