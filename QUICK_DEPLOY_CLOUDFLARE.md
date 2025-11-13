# ⚡ Quick Deploy with Cloudflare Tunnel (5 Minutes)

Fastest way to deploy your ChatGPT app for FREE using Cloudflare Tunnel.

---

## 🚀 Quick Start

### 1. Deploy Website (2 min)

```bash
# Push to GitHub
git init
git add .
git commit -m "Deploy"
git remote add origin https://github.com/YOUR_USERNAME/kepler-chat.git
git push -u origin main

# Deploy on Vercel.com → Import repo → Deploy
```

### 2. Setup Tunnel (2 min)

```powershell
# Install (PowerShell as Admin)
winget install cloudflare.cloudflared

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create my-llm

# Start tunnel (get URL)
cloudflared tunnel run my-llm --url http://localhost:11434
```

**Copy the URL** (looks like: `https://llm-xxxxx.trycloudflare.com`)

### 3. Connect (1 min)

1. Vercel → Settings → Environment Variables
2. Add: `LLM_API_URL` = `https://llm-xxxxx.trycloudflare.com`
3. Redeploy

**Done!** 🎉

---

## 🔧 Automated Setup

Run the PowerShell script:

```powershell
# Run as Administrator
.\scripts\setup-cloudflare-tunnel.ps1
```

---

## 📋 Keep Tunnel Running

**Option 1: Batch File**
```bash
.\scripts\start-tunnel.bat
```

**Option 2: Windows Service**
```bash
cloudflared service install
net start cloudflared
```

**Option 3: Task Scheduler**
- Create task to run on startup
- Program: `cloudflared`
- Arguments: `tunnel run my-llm`

---

## ✅ Verify

1. **Ollama**: `curl http://localhost:11434/api/tags`
2. **Tunnel**: `curl https://your-tunnel-url/api/tags`
3. **Website**: Visit Vercel URL and send a message

---

## 🆘 Troubleshooting

**Tunnel not working?**
- Check Ollama is running: `ollama serve`
- Verify tunnel: `cloudflared tunnel list`
- Test: `curl https://your-tunnel-url/api/tags`

**Website shows error?**
- Check `LLM_API_URL` in Vercel matches tunnel URL
- Ensure tunnel is running
- Redeploy Vercel project

---

## 📚 Full Guide

See `DEPLOYMENT_CLOUDFLARE.md` for complete instructions.

---

## 💰 Cost

**Total: $0/month** ✅
- Vercel: Free
- Cloudflare Tunnel: Free
- Ollama: Free (runs on your laptop)

---

Enjoy your free deployment! 🚀

