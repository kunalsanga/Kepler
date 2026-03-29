#!/bin/bash
echo "Starting AI Gateway Architecture..."

# 1. Start Ollama
echo "Starting Ollama..."
if command -v ollama >/dev/null 2>&1; then
    ollama serve &
else
    echo "Ollama is not installed or not in PATH."
fi

# 2. Start ComfyUI
echo "Starting ComfyUI..."
if [ -f "../ComfyUI/main.py" ]; then
    (cd ../ComfyUI && python main.py --port 8188 --lowvram) &
elif [ -f "ComfyUI/main.py" ]; then
    (cd ComfyUI && python main.py --port 8188 --lowvram) &
else
    echo "ComfyUI not found. Please start it manually on port 8188."
fi

# 3. Start FastAPI Gateway
echo "Starting FastAPI Gateway..."
cd "$(dirname "$0")/../gateway" || exit
if [ ! -d "venv" ]; then
    python -m venv venv
    source venv/Scripts/activate || source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/Scripts/activate || source venv/bin/activate
fi

uvicorn main:app --host 0.0.0.0 --port 9000
