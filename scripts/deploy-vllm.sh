#!/bin/bash

# vLLM Deployment Script
# Run this on your GPU cloud server

set -e  # Exit on error

echo "🚀 Starting vLLM Deployment..."

# Configuration
MODEL_NAME="${1:-Qwen/Qwen2.5-7B-Instruct}"
MODEL_DIR="/root/models"
PORT="${2:-8000}"
API_KEY="${3:-}"

# Step 1: Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
apt install -y python3 python3-pip git wget curl screen

# Step 3: Install vLLM
echo "📦 Installing vLLM (this may take 5-10 minutes)..."
pip3 install vllm fastapi uvicorn

# Step 4: Install HuggingFace CLI
echo "📦 Installing HuggingFace CLI..."
pip3 install huggingface-hub

# Step 5: Create models directory
echo "📁 Creating models directory..."
mkdir -p "$MODEL_DIR"
cd "$MODEL_DIR"

# Step 6: Download model
echo "📥 Downloading model: $MODEL_NAME"
echo "⚠️  This may take 10-30 minutes depending on model size..."
huggingface-cli download "$MODEL_NAME" --local-dir "$(basename $MODEL_NAME)"

MODEL_PATH="$MODEL_DIR/$(basename $MODEL_NAME)"

# Step 7: Build vLLM command
echo "🔧 Building vLLM command..."
VLLM_CMD="vllm serve $MODEL_PATH --host 0.0.0.0 --port $PORT --openai-api"

if [ -n "$API_KEY" ]; then
    VLLM_CMD="$VLLM_CMD --api-key $API_KEY"
fi

# Step 8: Create systemd service (optional)
echo "📝 Creating systemd service..."
cat > /etc/systemd/system/vllm.service << EOF
[Unit]
Description=vLLM Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$MODEL_DIR
ExecStart=/usr/bin/python3 -m vllm.serve.api_server \
    --model $MODEL_PATH \
    --host 0.0.0.0 \
    --port $PORT \
    --openai-api
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Step 9: Start vLLM
echo "🚀 Starting vLLM server..."
echo "Command: $VLLM_CMD"

# Option A: Run in screen session
screen -dmS vllm bash -c "$VLLM_CMD"

# Option B: Use systemd (uncomment to use)
# systemctl daemon-reload
# systemctl enable vllm
# systemctl start vllm

# Wait a bit for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Step 10: Test server
echo "🧪 Testing vLLM server..."
if curl -s http://localhost:$PORT/v1/models > /dev/null; then
    echo "✅ vLLM server is running!"
    echo ""
    echo "📋 Server Information:"
    echo "   Model: $MODEL_NAME"
    echo "   Port: $PORT"
    echo "   Endpoint: http://$(hostname -I | awk '{print $1}'):$PORT/v1/chat/completions"
    echo ""
    echo "🔍 To check status:"
    echo "   screen -r vllm  # View logs"
    echo "   curl http://localhost:$PORT/v1/models  # Test API"
    echo ""
    echo "🛑 To stop:"
    echo "   screen -X -S vllm quit  # If using screen"
    echo "   systemctl stop vllm  # If using systemd"
else
    echo "❌ Server test failed. Check logs:"
    echo "   screen -r vllm"
    exit 1
fi

echo "🎉 Deployment complete!"

