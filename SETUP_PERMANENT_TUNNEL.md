# 🔥 Setup PERMANENT Cloudflare Tunnel (5 Minutes)

**The Problem:** Temporary tunnels (`cloudflared tunnel --url`) expire and break. You need a **PERMANENT named tunnel**.

---

## 🚀 Quick Setup (Automated)

Run the PowerShell script:

```powershell
.\scripts\setup-permanent-tunnel.ps1
```

Follow the prompts. It will:
1. ✅ Check cloudflared installation
2. ✅ Authenticate with Cloudflare
3. ✅ Create a named tunnel
4. ✅ Generate config file
5. ✅ Give you a permanent URL

---

## 📋 Manual Setup (Step-by-Step)

### Step 1: Install Cloudflared (if not installed)

```powershell
winget install cloudflare.cloudflared
```

### Step 2: Login to Cloudflare

```powershell
cloudflared tunnel login
```

This opens a browser. Log in and authorize.

### Step 3: Create Named Tunnel

```powershell
cloudflared tunnel create my-llm
```

Replace `my-llm` with your preferred name (e.g., `kunal-ollama`, `qwen-bot`).

**You'll get a tunnel ID** - save it!

### Step 4: Create Config File

Create/edit: `C:\Users\<yourname>\.cloudflared\config.yml`

```yaml
tunnel: my-llm
credentials-file: C:\Users\<yourname>\.cloudflared\my-llm.json

ingress:
  - hostname: myai-bot.trycloudflare.com
    service: http://localhost:11434
  - service: http_status:404
```

**Replace:**
- `my-llm` → your tunnel name
- `myai-bot` → your desired subdomain (can be anything)
- `<yourname>` → your Windows username

### Step 5: Start the Tunnel

```powershell
cloudflared tunnel run my-llm
```

**You'll see:**
```
+--------------------------------------------------------------------------------------------+
|  Your tunnel is ready! Visit it at:                                                       |
|  https://myai-bot.trycloudflare.com                                                       |
+--------------------------------------------------------------------------------------------+
```

### Step 6: Test the Tunnel

```powershell
curl https://myai-bot.trycloudflare.com/api/tags
```

**Expected:** JSON response with your models ✅

**If you get 404/error:** Check that Ollama is running on `http://localhost:11434`

### Step 7: Update Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add/Update: `LLM_API_URL` = `https://myai-bot.trycloudflare.com`
3. Check all environments (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** (Deployments → Redeploy)

---

## ✅ Why This Works

| Temporary Tunnel (`--url`) | Named Tunnel |
|---------------------------|--------------|
| ❌ Expires when CMD closes | ✅ Permanent |
| ❌ URL changes every time | ✅ Same URL forever |
| ❌ Sometimes not public | ✅ Always public |
| ❌ Breaks in production | ✅ Works 24/7 |

---

## 🔄 Keep Tunnel Running

### Option 1: Keep Terminal Open (Simple)
Just keep the PowerShell window open.

### Option 2: Run in Background

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel run my-llm"
```

### Option 3: Windows Service (Advanced)

```powershell
# Install as service
cloudflared service install

# Start service
net start cloudflared
```

### Option 4: Task Scheduler (Auto-start)

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: "When I log on"
4. Action: Start a program
5. Program: `cloudflared`
6. Arguments: `tunnel run my-llm`
7. Start in: `C:\Users\<yourname>\.cloudflared`

---

## 🆘 Troubleshooting

### Issue: "Tunnel not found"

**Fix:** Make sure you created the tunnel:
```powershell
cloudflared tunnel list
```

If it's not there, create it:
```powershell
cloudflared tunnel create my-llm
```

### Issue: "Config file not found"

**Fix:** Check the path:
```powershell
# Check if config exists
Test-Path "$env:USERPROFILE\.cloudflared\config.yml"

# View config
Get-Content "$env:USERPROFILE\.cloudflared\config.yml"
```

### Issue: "Credentials file not found"

**Fix:** The credentials file is created when you run `cloudflared tunnel create`. Check:
```powershell
Test-Path "$env:USERPROFILE\.cloudflared\my-llm.json"
```

### Issue: "404 Not Found" when testing

**Causes:**
1. Ollama not running → Start: `ollama serve`
2. Wrong port → Check Ollama is on `localhost:11434`
3. Config wrong → Check `config.yml` has correct service URL

**Test locally first:**
```powershell
curl http://localhost:11434/api/tags
```

### Issue: Vercel still can't connect

**Check:**
1. ✅ Tunnel is running (terminal shows "Ready")
2. ✅ URL in Vercel matches tunnel URL exactly
3. ✅ Redeployed after setting environment variable
4. ✅ Test tunnel URL directly: `curl https://your-subdomain.trycloudflare.com/api/tags`

---

## 📝 Quick Reference

**Start tunnel:**
```powershell
cloudflared tunnel run my-llm
```

**List tunnels:**
```powershell
cloudflared tunnel list
```

**Delete tunnel:**
```powershell
cloudflared tunnel delete my-llm
```

**View config:**
```powershell
Get-Content "$env:USERPROFILE\.cloudflared\config.yml"
```

**Test tunnel:**
```powershell
curl https://your-subdomain.trycloudflare.com/api/tags
```

---

## 🎉 Success Checklist

- [ ] Named tunnel created
- [ ] Config file created at `~\.cloudflared\config.yml`
- [ ] Tunnel running: `cloudflared tunnel run my-llm`
- [ ] Permanent URL received (e.g., `https://myai-bot.trycloudflare.com`)
- [ ] Test works: `curl https://your-url.trycloudflare.com/api/tags`
- [ ] `LLM_API_URL` set in Vercel
- [ ] Vercel project redeployed
- [ ] App works on Vercel! ✅

---

## 💡 Pro Tips

1. **Choose a memorable subdomain** - You'll use it forever
2. **Keep tunnel running** - Use Task Scheduler for auto-start
3. **Test before deploying** - Always test the tunnel URL first
4. **Monitor tunnel** - Check terminal for connection status
5. **Backup config** - Save your `config.yml` file

---

**Your permanent tunnel URL will NEVER change!** 🎯

