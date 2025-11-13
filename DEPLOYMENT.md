# 🚀 Production Deployment Guide

Complete guide to deploy your ChatGPT-like application to production.

## 📋 Deployment Architecture

```
🌍 Users
  ↓
🌐 Vercel (Next.js Website)
  ↓
🔌 API Route (/api/chat)
  ↓
☁️ Cloud GPU Server (vLLM)
  ↓
🧠 LLM Model (Qwen 2.5 / Your Model)
```

---

## 🔥 STEP 1: Deploy Website to Vercel

### 1.1 Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/kepler-chat.git
git branch -M main
git push -u origin main
```

### 1.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### 1.3 Add Environment Variable

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**:

- **Name**: `LLM_API_URL`
- **Value**: `http://YOUR_CLOUD_SERVER_IP:8000` (we'll get this in Step 2)
- **Environment**: Production, Preview, Development

⚠️ **Note**: Initially use a placeholder, we'll update it after Step 2.

### 1.4 Deploy

Click **"Deploy"** and wait for build to complete.

🎉 Your website is now live at `https://your-project.vercel.app`

---

## 🔥 STEP 2: Deploy vLLM on Cloud GPU

### 2.1 Choose Cloud Provider

| Provider | GPU Options | Price/Hour | Best For |
|----------|-------------|------------|----------|
| **RunPod** | A10, A100 | $0.2 - $1.00 | Beginners, stable |
| **Vast.ai** | RTX 4090, A100 | $0.10 - $0.80 | Cheapest option |
| **Lambda Labs** | A100 | $1.00 - $1.50 | Production, reliable |
| **AWS/GCP** | Various | $2.00+ | Enterprise (expensive) |

**Recommended for beginners**: RunPod or Vast.ai

### 2.2 Create GPU Server

#### Option A: RunPod

1. Go to [runpod.io](https://runpod.io)
2. Sign up / Login
3. Navigate to **"Pods"** → **"Deploy"**
4. Select:
   - **GPU**: RTX 4090 or A10 (for Qwen 2.5 7B)
   - **Template**: `RunPod PyTorch` or `Ubuntu 22.04`
   - **Container Disk**: 50GB+ (for model storage)
5. Click **"Deploy"**
6. Wait for pod to start (~2-3 minutes)
7. Copy the **Public IP** address

#### Option B: Vast.ai

1. Go to [vast.ai](https://vast.ai)
2. Sign up / Login
3. Go to **"Create"** → **"GPU Instance"**
4. Select:
   - **GPU**: RTX 4090 or A100
   - **Image**: `pytorch/pytorch:latest`
   - **Disk**: 50GB+
5. Click **"Rent"**
6. Copy the **IP address** and **SSH port**

### 2.3 SSH into Server

```bash
# For RunPod (default port 22)
ssh root@YOUR_SERVER_IP

# For Vast.ai (custom port)
ssh root@YOUR_SERVER_IP -p YOUR_SSH_PORT

# If using password, enter it when prompted
# If using SSH key, ensure your key is added
```

### 2.4 Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Python and pip
apt install -y python3 python3-pip git wget curl

# Install vLLM (this may take 5-10 minutes)
pip3 install vllm

# Install FastAPI and Uvicorn (if not included)
pip3 install fastapi uvicorn

# Verify installation
python3 -c "import vllm; print('vLLM installed successfully')"
```

### 2.5 Download Model

#### Option A: From HuggingFace (Recommended)

```bash
# Install HuggingFace CLI
pip3 install huggingface-hub

# Login to HuggingFace (optional, for private models)
huggingface-cli login

# Download model
mkdir -p /root/models
cd /root/models

# Download Qwen 2.5 7B (adjust model name as needed)
huggingface-cli download Qwen/Qwen2.5-7B-Instruct --local-dir Qwen2.5-7B-Instruct

# Or download your custom fine-tuned model
# huggingface-cli download YOUR_USERNAME/YOUR_MODEL --local-dir YOUR_MODEL
```

#### Option B: Using Git LFS

```bash
# Install git-lfs
apt install -y git-lfs
git lfs install

# Clone model repository
cd /root/models
git clone https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
```

### 2.6 Start vLLM Server

```bash
# Start vLLM with OpenAI-compatible API
vllm serve /root/models/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --api-key YOUR_SECRET_API_KEY \
  --openai-api

# Or with more options:
vllm serve /root/models/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --api-key YOUR_SECRET_API_KEY \
  --openai-api \
  --tensor-parallel-size 1 \
  --max-model-len 4096 \
  --gpu-memory-utilization 0.9
```

**Parameters explained:**
- `--host 0.0.0.0`: Allow external connections
- `--port 8000`: API port
- `--api-key`: Optional API key for security
- `--openai-api`: Enable OpenAI-compatible endpoint
- `--tensor-parallel-size`: Number of GPUs (1 for single GPU)
- `--max-model-len`: Maximum context length
- `--gpu-memory-utilization`: GPU memory usage (0.9 = 90%)

### 2.7 Keep Server Running (Using screen/tmux)

```bash
# Install screen
apt install -y screen

# Start a new screen session
screen -S vllm

# Run vLLM server (inside screen)
vllm serve /root/models/Qwen2.5-7B-Instruct \
  --host 0.0.0.0 \
  --port 8000 \
  --openai-api

# Detach from screen: Press Ctrl+A, then D
# Reattach later: screen -r vllm
```

### 2.8 Test vLLM Server

```bash
# Test from server itself
curl http://localhost:8000/v1/models

# Test from your local machine (replace with your server IP)
curl http://YOUR_SERVER_IP:8000/v1/models

# Test chat completion
curl http://YOUR_SERVER_IP:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen2.5-7B-Instruct",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'
```

✅ If you get a response, your vLLM server is working!

---

## 🔥 STEP 3: Connect Website to Cloud LLM

### 3.1 Update Vercel Environment Variable

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Update `LLM_API_URL`:
   - **Value**: `http://YOUR_SERVER_IP:8000`
   - Or use HTTPS if you set up SSL: `https://your-llm-domain.com`
3. Click **"Save"**

### 3.2 Update API Route for vLLM

Since we're now using vLLM (not Ollama), we need to update the API route:

The route should already work, but verify it's using:
- Endpoint: `/v1/chat/completions` (vLLM uses OpenAI format)
- Model name: Match your vLLM model name

### 3.3 Redeploy Vercel

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deploy

### 3.4 Test End-to-End

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Send a test message
3. Verify you get a response from your cloud LLM

🎉 **Your production deployment is complete!**

---

## 🔐 STEP 4: Security & Optimization

### 4.1 Add API Key Protection

Update `app/api/chat/route.ts` to require API key:

```typescript
export async function POST(req: NextRequest) {
  // Check API key
  const apiKey = req.headers.get('x-api-key')
  const expectedKey = process.env.LLM_API_KEY
  
  if (expectedKey && apiKey !== expectedKey) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
  
  // ... rest of your code
}
```

Add to Vercel environment variables:
- `LLM_API_KEY`: Your secret key

### 4.2 Rate Limiting

Consider adding rate limiting to prevent abuse:

```typescript
// Use a library like @upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})

// In your POST handler:
const identifier = req.ip || "anonymous"
const { success } = await ratelimit.limit(identifier)

if (!success) {
  return new Response("Rate limit exceeded", { status: 429 })
}
```

### 4.3 CORS Configuration

If needed, add CORS headers:

```typescript
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*', // Or specific domain
    'Access-Control-Allow-Methods': 'POST',
  },
})
```

---

## 💰 Cost Optimization

### Estimated Monthly Costs

**Website (Vercel)**:
- Free tier: 100GB bandwidth/month
- Pro: $20/month (if you exceed free tier)

**GPU Server**:
- RunPod A10: ~$0.30/hour = $216/month (24/7)
- Vast.ai RTX 4090: ~$0.20/hour = $144/month (24/7)
- **Cost-saving tip**: Stop server when not in use, or use spot instances

**Total**: ~$150-250/month for 24/7 operation

### Cost-Saving Strategies

1. **Auto-shutdown**: Configure server to stop during low-traffic hours
2. **Spot instances**: Use cheaper spot/preemptible instances
3. **Smaller models**: Use 7B models instead of 14B+ (faster, cheaper)
4. **Caching**: Cache common responses to reduce API calls
5. **Load balancing**: Use multiple smaller instances instead of one large one

---

## 🐳 Docker Deployment (Optional)

### Dockerfile for vLLM

```dockerfile
FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip git \
    && rm -rf /var/lib/apt/lists/*

# Install vLLM
RUN pip3 install vllm fastapi uvicorn

# Copy model (or mount volume)
COPY models/ /app/models/

# Expose port
EXPOSE 8000

# Start vLLM
CMD ["vllm", "serve", "/app/models/Qwen2.5-7B-Instruct", \
     "--host", "0.0.0.0", "--port", "8000", "--openai-api"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  vllm:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./models:/app/models
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

---

## 📊 Monitoring & Logging

### Add Logging

```typescript
// In app/api/chat/route.ts
console.log('Request received:', {
  timestamp: new Date().toISOString(),
  messageCount: messages.length,
  model: 'qwen2.5'
})
```

### Monitor GPU Usage

```bash
# On GPU server
watch -n 1 nvidia-smi
```

### Set Up Alerts

- Vercel: Built-in monitoring dashboard
- GPU Server: Set up uptime monitoring (UptimeRobot, Pingdom)
- API: Monitor response times and errors

---

## 🚨 Troubleshooting

### vLLM Server Not Responding

```bash
# Check if vLLM is running
ps aux | grep vllm

# Check port
netstat -tulpn | grep 8000

# Check logs
journalctl -u vllm  # if using systemd
```

### Connection Errors

1. **Firewall**: Ensure port 8000 is open
2. **IP Whitelist**: If using API key, verify it's correct
3. **CORS**: Check CORS headers if accessing from browser

### Out of Memory

- Reduce `--gpu-memory-utilization` (e.g., 0.7)
- Use smaller model or quantization
- Increase GPU memory allocation

---

## ✅ Deployment Checklist

- [ ] Website deployed to Vercel
- [ ] Environment variable `LLM_API_URL` set in Vercel
- [ ] GPU server created and accessible
- [ ] vLLM installed on GPU server
- [ ] Model downloaded to GPU server
- [ ] vLLM server running and accessible
- [ ] API endpoint tested (`/v1/chat/completions`)
- [ ] Website connected to cloud LLM
- [ ] End-to-end test successful
- [ ] API key protection added (optional)
- [ ] Monitoring set up (optional)

---

## 🎉 You're Live!

Your production deployment is complete. Users can now access your ChatGPT-like application from anywhere in the world!

**Next Steps:**
- Add custom domain to Vercel
- Set up SSL for GPU server (optional)
- Add analytics
- Implement user authentication
- Add conversation persistence

---

## 📚 Additional Resources

- [vLLM Documentation](https://docs.vllm.ai/)
- [Vercel Documentation](https://vercel.com/docs)
- [RunPod Documentation](https://docs.runpod.io/)
- [Vast.ai Documentation](https://vast.ai/help/)

