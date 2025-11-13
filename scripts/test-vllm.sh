#!/bin/bash

# Test vLLM Server Script
# Run this from your local machine or server

set -e

SERVER_IP="${1:-localhost}"
PORT="${2:-8000}"
API_KEY="${3:-}"

echo "🧪 Testing vLLM Server at $SERVER_IP:$PORT"
echo ""

# Test 1: Check if server is accessible
echo "1️⃣ Testing server connectivity..."
if curl -s --max-time 5 "http://$SERVER_IP:$PORT/v1/models" > /dev/null; then
    echo "   ✅ Server is accessible"
else
    echo "   ❌ Cannot connect to server"
    echo "   Check:"
    echo "   - Is vLLM running?"
    echo "   - Is port $PORT open?"
    echo "   - Is firewall blocking connections?"
    exit 1
fi

# Test 2: List models
echo ""
echo "2️⃣ Listing available models..."
MODELS=$(curl -s "http://$SERVER_IP:$PORT/v1/models")
echo "$MODELS" | jq '.' 2>/dev/null || echo "$MODELS"

# Test 3: Chat completion (non-streaming)
echo ""
echo "3️⃣ Testing chat completion (non-streaming)..."
RESPONSE=$(curl -s "http://$SERVER_IP:$PORT/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "${API_KEY:+Authorization: Bearer $API_KEY}" \
  -d '{
    "model": "Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Say hello in one word."}],
    "stream": false,
    "max_tokens": 50
  }')

if echo "$RESPONSE" | grep -q "choices"; then
    echo "   ✅ Chat completion works!"
    echo "$RESPONSE" | jq '.choices[0].message.content' 2>/dev/null || echo "$RESPONSE"
else
    echo "   ❌ Chat completion failed"
    echo "$RESPONSE"
    exit 1
fi

# Test 4: Chat completion (streaming)
echo ""
echo "4️⃣ Testing chat completion (streaming)..."
STREAM_RESPONSE=$(curl -s -N "http://$SERVER_IP:$PORT/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "${API_KEY:+Authorization: Bearer $API_KEY}" \
  -d '{
    "model": "Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Count to 3."}],
    "stream": true,
    "max_tokens": 50
  }')

if echo "$STREAM_RESPONSE" | grep -q "data:"; then
    echo "   ✅ Streaming works!"
    echo "   Stream preview:"
    echo "$STREAM_RESPONSE" | head -n 3
else
    echo "   ❌ Streaming failed"
    echo "$STREAM_RESPONSE"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "📋 Server Details:"
echo "   URL: http://$SERVER_IP:$PORT"
echo "   Endpoint: http://$SERVER_IP:$PORT/v1/chat/completions"
echo "   Status: ✅ Operational"

