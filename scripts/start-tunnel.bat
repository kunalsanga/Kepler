@echo off
REM Cloudflare Tunnel Starter Script
REM Run this to start your tunnel

echo 🌍 Starting Cloudflare Tunnel...
echo.

REM Change to script directory
cd /d "%~dp0\.."

REM Check if cloudflared is available
where cloudflared >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ cloudflared not found in PATH
    echo Please install cloudflared first
    echo See: DEPLOYMENT_CLOUDFLARE.md
    pause
    exit /b 1
)

REM Check if config file exists
if exist "cloudflared.yml" (
    echo ✅ Using config file: cloudflared.yml
    cloudflared tunnel run my-llm
) else (
    echo ⚠️  Config file not found, using quick mode
    echo.
    cloudflared tunnel run my-llm --url http://localhost:11434
)

pause

