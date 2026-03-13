# 🌍 Cloudflare Tunnel Deployment Guide

Deploy your ChatGPT app using Cloudflare Tunnel to expose your local Ollama server for FREE!

## 📋 Architecture

```
🌍 Users
  ↓
🌐 Vercel (Next.js Website)
  ↓
🔌 API Route (/api/chat)
  ↓
☁️ Cloudflare Tunnel
  ↓
💻 Your Local Laptop (Ollama)
  ↓
🧠 Qwen 2.5 Model
```

**Benefits:**
- ✅ **100% FREE** (no cloud GPU costs)
- ✅ Secure (Cloudflare encryption)
- ✅ Easy setup (no server management)
- ✅ Works with your existing Ollama setup

---

## ✅ STEP 0: Confirm Ollama is Running

### Test Ollama Locally

```bash
# Test if Ollama works
ollama run qwen2.5

# If it replies, you're good!
```

### Keep Ollama Server Running

On Windows, Ollama runs automatically as a service. Verify it's running:

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If you get a response, Ollama is running
```

If not running, start it:

```bash
# On Windows (usually auto-starts)
# Or manually:
ollama serve
```

---

## 🟩 STEP 1: Deploy Website to Vercel

### 1.1 Push Project to GitHub

```bash
# Navigate to your project folder
cd C:\Users\kunal sanga\OneDrive\文档\Kepler

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Deploy to production"

# Create repository on GitHub first, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kepler-chat.git
git push -u origin main
```

**Note:** Replace `YOUR_USERNAME` and `kepler-chat` with your actual GitHub username and repository name.

### 1.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select your repository (`kepler-chat`)
5. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Environment Variables**: Skip for now (we'll add later)
6. Click **"Deploy"**

⏳ Wait 2-3 minutes for deployment to complete.

🎉 Your website is now live at `https://your-project.vercel.app`

---

## 🟧 STEP 2: Install Cloudflare Tunnel

### 2.1 Install Cloudflare WARP (Optional but Recommended)

1. Download from: https://one.one.one.one/
2. Install and open the app
3. Log in to Cloudflare account (create one if needed - it's free)

### 2.2 Install cloudflared

**Option A: Using winget (Windows Package Manager)**

```powershell
winget install cloudflare.cloudflared
```

**Option B: Using Chocolatey**

```powershell
# If winget fails, use Chocolatey
choco install cloudflared
```

**Option C: Manual Download**

1. Go to: https://github.com/cloudflare/cloudflared/releases
2. Download `cloudflared-windows-amd64.exe`
3. Rename to `cloudflared.exe`
4. Add to PATH or use full path

### 2.3 Verify Installation

```bash
cloudflared --version
```

You should see version information.

---

## 🟦 STEP 3: Authenticate Cloudflare

```bash
cloudflared tunnel login
```

This will:
1. Open your browser
2. Ask you to log in to Cloudflare
3. Authorize the tunnel
4. Save credentials automatically

✅ You'll see: "You have successfully logged in"

---

## 🟪 STEP 4: Create a Tunnel

```bash
cloudflared tunnel create my-llm
```

This creates a new tunnel named `my-llm`.

You'll see output like:
```
Created tunnel my-llm with id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

✅ Tunnel created successfully!

---

## 🟨 STEP 5: Run Tunnel and Expose Ollama

### Quick Start (Temporary)

```bash
cloudflared tunnel run my-llm --url http://localhost:11434
```

You'll see output like:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://llm-xxxxx-xxxxx.trycloudflare.com                                                 |
+--------------------------------------------------------------------------------------------+
```

**COPY THIS URL!** This is your public Ollama endpoint.

⚠️ **Note**: This URL is temporary and changes each time you restart. For a permanent URL, see Step 6.

### Test the Tunnel

Open a new terminal and test:

```bash
curl https://llm-xxxxx-xxxxx.trycloudflare.com/api/tags
```

If you get a response, the tunnel is working! ✅

---

## 🟥 STEP 6: Configure Permanent Tunnel (Recommended)

### 6.1 Create Configuration File

Create `cloudflared.yml` in your project root:

```yaml
tunnel: my-llm
credentials-file: C:\Users\kunal sanga\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: llm-yourdomain.com  # Optional: use your own domain
    service: http://localhost:11434
  - service: http_status:404
```

**Or simpler version (without custom domain):**

```yaml
tunnel: my-llm
credentials-file: C:\Users\kunal sanga\.cloudflared\<tunnel-id>.json

ingress:
  - service: http://localhost:11434
```

### 6.2 Find Your Credentials File

After creating the tunnel, the credentials file is saved at:
```
C:\Users\kunal sanga\.cloudflared\<tunnel-id>.json
```

Replace `<tunnel-id>` with the actual ID from Step 4.

### 6.3 Run Tunnel with Config

```bash
cloudflared tunnel run my-llm
```

This uses the config file and gives you a permanent URL.

### 6.4 (Optional) Set Up Custom Domain

1. Go to Cloudflare Dashboard → Zero Trust → Tunnels
2. Select your tunnel (`my-llm`)
3. Click **"Configure"**
4. Add a public hostname:
   - **Subdomain**: `llm` (or any name)
   - **Domain**: Your Cloudflare domain (or use `trycloudflare.com` for free)
   - **Service**: `http://localhost:11434`
5. Save

You'll get a permanent URL like: `https://llm.yourdomain.com`

---

## 🔧 STEP 7: Keep Tunnel Running Automatically

### Option A: Run as Windows Service

```bash
# Install as service
cloudflared service install

# Start service
net start cloudflared

# Or use Services app (services.msc) and start "cloudflared" service
```

### Option B: Use Task Scheduler (Windows)

1. Open Task Scheduler (`taskschd.msc`)
2. Create Basic Task
3. Name: "Cloudflare Tunnel"
4. Trigger: "When I log on" or "At startup"
5. Action: Start a program
   - Program: `C:\path\to\cloudflared.exe`
   - Arguments: `tunnel run my-llm`
6. Save

### Option C: Use a Batch File (Simple)

Create `start-tunnel.bat`:

```batch
@echo off
cd /d "C:\Users\kunal sanga\OneDrive\文档\Kepler"
cloudflared tunnel run my-llm
pause
```

Run this file whenever you want to start the tunnel.

### Option D: Run in Background (PowerShell)

```powershell
# Run in background
Start-Process cloudflared -ArgumentList "tunnel run my-llm" -WindowStyle Hidden
```

---

## 🌐 STEP 8: Update Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

2. Add/Update:
   - **Name**: `LLM_API_URL`
   - **Value**: Your Cloudflare Tunnel URL
     - Temporary: `https://llm-xxxxx-xxxxx.trycloudflare.com`
     - Permanent: `https://llm.yourdomain.com` (if you set up custom domain)
   - **Environment**: Production, Preview, Development

3. Click **"Save"**

4. **Redeploy**:
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger auto-deploy

---

## 🚀 STEP 9: Test Your Live Chatbot

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Go to the chat page
3. Send a test message
4. You should get a response from your local Qwen 2.5! 🎉

---

## ✅ Verification Checklist

- [ ] Ollama is running locally (`curl http://localhost:11434/api/tags`)
- [ ] Cloudflare Tunnel is installed (`cloudflared --version`)
- [ ] Authenticated with Cloudflare (`cloudflared tunnel login`)
- [ ] Tunnel created (`cloudflared tunnel create my-llm`)
- [ ] Tunnel is running (`cloudflared tunnel run my-llm`)
- [ ] Tunnel URL is accessible (test with curl)
- [ ] Website deployed to Vercel
- [ ] Environment variable `LLM_API_URL` set in Vercel
- [ ] Vercel project redeployed
- [ ] End-to-end test successful (send message in chat)

---

## 🆘 Troubleshooting

### Tunnel Not Connecting

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Check tunnel status
cloudflared tunnel list

# Check tunnel info
cloudflared tunnel info my-llm
```

### Website Shows Connection Error

1. **Verify Tunnel URL**: Make sure `LLM_API_URL` in Vercel matches your tunnel URL
2. **Check Tunnel Status**: Ensure tunnel is running (`cloudflared tunnel run my-llm`)
3. **Test Tunnel Directly**: `curl https://your-tunnel-url/api/tags`
4. **Check Ollama**: Ensure Ollama is running locally

### Tunnel Keeps Disconnecting

- Use the service method (Step 7, Option A) for stability
- Check your internet connection
- Ensure Cloudflare WARP is running (if installed)

### Slow Responses

- This is normal - responses go: Vercel → Cloudflare → Your Laptop → Ollama → Back
- Consider using a cloud GPU for production (see `DEPLOYMENT.md`)

---

## 💡 Pro Tips

1. **Keep Laptop On**: Your laptop needs to be on and connected to internet
2. **Use Custom Domain**: Set up a custom domain for a permanent URL
3. **Monitor Tunnel**: Check Cloudflare dashboard for tunnel status
4. **Backup Plan**: Keep cloud GPU deployment ready (see `DEPLOYMENT.md`) for when laptop is off

---

## 🎉 You're Live!

Your ChatGPT-like app is now:
- ✅ Deployed on Vercel (free)
- ✅ Connected to your local Ollama (free)
- ✅ Accessible worldwide via Cloudflare Tunnel (free)
- ✅ **100% FREE deployment!**

**Total Cost: $0/month** 🎊

---

## 📚 Next Steps

- Add custom domain to Vercel
- Set up monitoring/analytics
- Add user authentication
- Implement conversation persistence
- Consider cloud GPU for 24/7 availability (see `DEPLOYMENT.md`)

---

## 🔗 Quick Reference

**Start Tunnel:**
```bash
cloudflared tunnel run my-llm
```

**Stop Tunnel:**
```bash
# Press Ctrl+C in terminal
# Or stop service: net stop cloudflared
```

**Check Tunnel Status:**
```bash
cloudflared tunnel list
cloudflared tunnel info my-llm
```

**Test Ollama:**
```bash
curl http://localhost:11434/api/tags
```

**Test Tunnel:**
```bash
curl https://your-tunnel-url/api/tags
```

---

Enjoy your free, fully functional ChatGPT deployment! 🚀

