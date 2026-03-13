@echo off
echo.
echo ========================================
echo   Starting Image ^& Video Generation Services
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Start ComfyUI
echo [1/2] Starting ComfyUI...
if exist "ComfyUI\main.py" (
    start "ComfyUI" cmd /k "cd ComfyUI && python main.py --port 8188 --lowvram"
    echo        [OK] ComfyUI starting on port 8188
    timeout /t 3 /nobreak >nul
) else (
    echo        [SKIP] ComfyUI not found - run setup-comfyui.ps1 first
)
echo.

REM CogVideo disabled (Using ComfyUI AnimateDiff)
REM echo [2/2] Starting CogVideo...
REM if exist "CogVideo" (
REM     start "CogVideo" cmd /k "cd CogVideo && python -m cogvideo.cli.api --port 7860 --low-resource-mode"
REM     echo        [OK] CogVideo starting on port 7860
REM     timeout /t 3 /nobreak >nul
REM ) else (
REM     echo        [SKIP] CogVideo not found - run setup-cogvideo.ps1 first
REM )
echo.

echo ========================================
echo   Generation services started!
echo ========================================
echo.
echo Keep these windows open while using the app.
echo Press any key to exit this window (services will keep running)
pause >nul

