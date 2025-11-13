# 🚀 Quick Start Deployment Guide

Fast deployment guide for production.

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Vercel account (free tier works)
- [ ] Cloud GPU provider account (RunPod/Vast.ai)
- [ ] Model downloaded or access to HuggingFace

---

## ⚡ 5-Minute Deployment

### Step 1: Deploy Website (2 minutes)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Deploy to production"
git remote add origin https://github.com/YOUR_USERNAME/kepler-chat.git
git push -u origin main

# 2. Go to vercel.com → Import repository → Deploy
# 3. Add environment variable: LLM_API_URL=http://YOUR_SERVER_IP:8000
```

### Step 2: Deploy vLLM (3 minutes)

```bash
# On your GPU server (RunPod/Vast.ai)
ssh root@YOUR_SERVER_IP

# Run deployment script
chmod +x scripts/deploy-vllm.sh
./scripts/deploy-vllm.sh Qwen/Qwen2.5-7B-Instruct 8000

# Wait for model download (10-30 min)
# Server will auto-start when ready
```

### Step 3: Connect & Test

```bash
# Update Vercel environment variable with your server IP
# Then redeploy

# Test from your local machine
./scripts/test-vllm.sh YOUR_SERVER_IP 8000
```

**Done!** Your app is live at `https://your-project.vercel.app`

---

## 🔧 Manual Setup (If Scripts Don't Work)

### On GPU Server:

```bash
# Install
apt update && apt install -y python3-pip
pip3 install vllm

# Download model
mkdir -p /root/models
cd /root/models
huggingface-cli download Qwen/Qwen2.5-7B-Instruct --local-dir Qwen2.5-7B-Instruct

# Start server
screen -S vllm
vllm serve /root/models/Qwen2.5-7B-Instruct --host 0.0.0.0 --port 8000 --openai-api
# Press Ctrl+A, then D to detach
```

### Update API Route:

If using vLLM, replace `app/api/chat/route.ts` with `app/api/chat/route.vllm.ts`:

```bash
cp app/api/chat/route.vllm.ts app/api/chat/route.ts
```

---

## 📋 Environment Variables

### Vercel:
- `LLM_API_URL`: `http://YOUR_SERVER_IP:8000`
- `LLM_API_KEY`: (optional) Your vLLM API key
- `LLM_MODEL_NAME`: (optional) Model name, default: `Qwen2.5-7B-Instruct`

---

## ✅ Verification

1. **Website**: Visit `https://your-project.vercel.app` → Should load
2. **vLLM**: `curl http://YOUR_SERVER_IP:8000/v1/models` → Should return models
3. **End-to-end**: Send message in chat → Should get response

---

## 🆘 Troubleshooting

**Website shows connection error:**
- Check `LLM_API_URL` in Vercel settings
- Verify server IP is correct
- Ensure port 8000 is open

**vLLM not responding:**
- Check if running: `screen -r vllm`
- Check logs: `screen -r vllm` (inside screen)
- Verify model path is correct

**Model download fails:**
- Check disk space: `df -h`
- Verify HuggingFace access
- Try downloading smaller model first

---

## 💰 Cost Estimate

- **Vercel**: Free (up to 100GB bandwidth)
- **GPU Server**: $0.20-0.50/hour = $150-360/month (24/7)
- **Total**: ~$150-360/month

**Save money**: Stop server when not in use!

---

## 📚 Full Documentation

See `DEPLOYMENT.md` for complete guide with:
- Detailed setup instructions
- Security best practices
- Docker deployment
- Monitoring & logging
- Cost optimization

---

## 🎉 You're Live!

Your production deployment is complete. Share your URL and start chatting! 🚀

