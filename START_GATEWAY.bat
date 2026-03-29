@echo off
echo.
echo ========================================
echo   Starting Kepler AI Gateway
echo ========================================
echo.

cd /d "%~dp0\gateway"

if not exist "venv" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
)

echo [2/3] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/3] Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo Starting FastAPI server on port 9000...
uvicorn main:app --host 0.0.0.0 --port 9000
