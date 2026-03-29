@echo off
echo.
echo ========================================
echo   Kepler AI - Cloudflare Tunnel
echo ========================================
echo.
echo This will expose your local Gateway (port 9000)
echo to the internet via Cloudflare Tunnel.
echo.
echo Make sure your Gateway is already running!
echo (Run START_GATEWAY.bat first)
echo.

where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] cloudflared is not installed!
    echo.
    echo Install it with:
    echo   winget install --id Cloudflare.cloudflared
    echo.
    pause
    exit /b 1
)

echo [OK] cloudflared found
echo.
echo Starting tunnel for http://localhost:9000 ...
echo.
echo !! IMPORTANT !!
echo Copy the https://xxxx.trycloudflare.com URL below
echo and set it as AI_GATEWAY_URL in your Vercel env vars.
echo.
echo ========================================
echo.

cloudflared tunnel --url http://localhost:9000

pause
