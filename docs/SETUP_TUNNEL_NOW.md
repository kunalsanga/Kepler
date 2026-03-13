# 🚀 Quick Setup: Cloudflare Tunnel (5 Minutes)

Your Vercel site is deployed but needs to connect to your local Ollama. Let's set up Cloudflare Tunnel!

---

## ✅ STEP 1: Install Cloudflared

### Option A: Download Manually (Easiest)

1. **Download cloudflared:**
   - Go to: https://github.com/cloudflare/cloudflared/releases/latest
   - Download: `cloudflared-windows-amd64.exe`
   - Save it to: `C:\Users\kunal sanga\OneDrive\文档\Kepler\cloudflared.exe`

2. **Or use this direct link:**
   - Latest release: https://github.com/cloudflare/cloudflared/releases

### Option B: Using Chocolatey (If you have it)

```powershell
choco install cloudflared -y
```

---

## ✅ STEP 2: Authenticate with Cloudflare

1. **Open PowerShell or CMD in your project folder:**
   ```powershell
   cd "C:\Users\kunal sanga\OneDrive\文档\Kepler"
   ```

2. **Run authentication:**
   ```powershell
   .\cloudflared.exe tunnel login
   ```
   
   Or if installed globally:
   ```powershell
   cloudflared tunnel login
   ```

3. **Browser will open** → Log in to Cloudflare (create free account if needed)

4. **Authorize** the tunnel

✅ You'll see: "You have successfully logged in"

---

## ✅ STEP 3: Create Tunnel

```powershell
.\cloudflared.exe tunnel create my-llm
```

Or:
```powershell
cloudflared tunnel create my-llm
```

✅ Tunnel created!

---

## ✅ STEP 4: Start Tunnel (Get Public URL)

```powershell
.\cloudflared.exe tunnel run my-llm --url http://localhost:11434
```

Or:
```powershell
cloudflared tunnel run my-llm --url http://localhost:11434
```

**You'll see output like:**
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                         |
|  https://llm-xxxxx-xxxxx.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

**📋 COPY THIS URL!** (It looks like: `https://llm-xxxxx-xxxxx.trycloudflare.com`)

**⚠️ Keep this terminal window open!** The tunnel needs to stay running.

---

## ✅ STEP 5: Test Tunnel

Open a **NEW terminal** and test:

```powershell
curl https://llm-xxxxx-xxxxx.trycloudflare.com/api/tags
```

If you get a response, the tunnel is working! ✅

---

## ✅ STEP 6: Add URL to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click on your **Kepler** project

2. **Go to Settings:**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left sidebar

3. **Add Environment Variable:**
   - **Name**: `LLM_API_URL`
   - **Value**: `https://llm-xxxxx-xxxxx.trycloudflare.com` (your tunnel URL)
   - **Environment**: Check all (Production, Preview, Development)
   - Click **"Save"**

4. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click the **"⋯"** (three dots) on latest deployment
   - Click **"Redeploy"**
   - Or push a new commit to trigger auto-deploy

---

## ✅ STEP 7: Test Your Live Site!

1. **Wait for redeploy** (1-2 minutes)
2. **Visit your Vercel URL**: `https://kepler-xxxxx.vercel.app`
3. **Go to chat page**
4. **Send a test message**

🎉 **You should get a response from your local Ollama!**

---

## ⚠️ Important Notes

### Keep Tunnel Running

The tunnel must stay running for your site to work. Options:

**Option 1: Keep Terminal Open**
- Just keep the PowerShell window open
- Tunnel runs as long as window is open

**Option 2: Run in Background**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\cloudflared.exe tunnel run my-llm --url http://localhost:11434"
```

**Option 3: Windows Service (24/7)**
```powershell
.\cloudflared.exe service install
net start cloudflared
```

### Tunnel URL Changes

- **Quick mode** (what we did): URL changes each time you restart
- **Permanent URL**: See `DEPLOYMENT_CLOUDFLARE.md` for custom domain setup

---

## 🆘 Troubleshooting

### "Cannot connect to Ollama server"
- ✅ Make sure Ollama is running: `ollama serve`
- ✅ Test locally: `curl http://localhost:11434/api/tags`
- ✅ Keep tunnel terminal open

### "Tunnel not responding"
- ✅ Check tunnel is running (terminal should be open)
- ✅ Verify Ollama is running
- ✅ Test tunnel URL directly: `curl https://your-tunnel-url/api/tags`

### "Connection refused"
- ✅ Make sure you copied the correct tunnel URL
- ✅ Check `LLM_API_URL` in Vercel matches tunnel URL exactly
- ✅ Redeploy Vercel after changing environment variable

---

## 🎉 You're Done!

Your setup:
- ✅ Website: Deployed on Vercel
- ✅ Tunnel: Running (exposing local Ollama)
- ✅ Connection: Vercel → Cloudflare → Your Laptop → Ollama

**Total Cost: $0/month** 🎊

---

## 📚 Next Steps (Optional)

- Set up permanent tunnel URL (see `DEPLOYMENT_CLOUDFLARE.md`)
- Configure tunnel to run as Windows service
- Add custom domain to Vercel

Enjoy your live ChatGPT app! 🚀

