#!/bin/bash

# Setup API Key Protection Script
# This adds API key protection to your vLLM server

set -e

API_KEY="${1:-$(openssl rand -hex 32)}"
PORT="${2:-8000}"

echo "🔐 Setting up API key protection..."
echo ""
echo "Generated API Key: $API_KEY"
echo ""
echo "⚠️  Save this key securely! You'll need it to connect your website."
echo ""

# Update vLLM service to use API key
if [ -f /etc/systemd/system/vllm.service ]; then
    echo "📝 Updating systemd service with API key..."
    sed -i "s|--openai-api|--openai-api --api-key $API_KEY|g" /etc/systemd/system/vllm.service
    systemctl daemon-reload
    systemctl restart vllm
    echo "✅ Service updated and restarted"
else
    echo "📝 Creating vLLM service with API key..."
    cat > /etc/systemd/system/vllm.service << EOF
[Unit]
Description=vLLM Server with API Key
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 -m vllm.serve.api_server \
    --model /root/models/Qwen2.5-7B-Instruct \
    --host 0.0.0.0 \
    --port $PORT \
    --openai-api \
    --api-key $API_KEY
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable vllm
    systemctl start vLLM
    echo "✅ Service created and started"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Add this to your Vercel environment variables:"
echo "   LLM_API_KEY=$API_KEY"
echo ""
echo "2. Update your API route to send API key in headers:"
echo "   headers: {"
echo "     'Authorization': 'Bearer $API_KEY'"
echo "   }"
echo ""
echo "3. Test the connection:"
echo "   curl -H 'Authorization: Bearer $API_KEY' \\"
echo "        http://localhost:$PORT/v1/models"
echo ""

