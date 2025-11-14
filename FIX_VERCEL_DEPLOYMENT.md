# 🔧 Fix Vercel Deployment - Connection Error

Your app works locally but shows "Connection Error" on Vercel? This guide will fix it in 5 minutes!

---

## 🎯 The Problem

When deployed on Vercel, your app tries to connect to `http://localhost:11434` (your local Ollama), but Vercel's servers can't access your local machine. You need to expose your local Ollama to the internet using Cloudflare Tunnel.

---

## ✅ Solution: 5-Minute Fix

### Step 1: Start Cloudflare Tunnel (2 minutes)

**Option A: Quick Tunnel (Temporary - URL changes each time)**
```powershell
# Download cloudflared if you don't have it
# From: https://github.com/cloudflare/cloudflared/releases
# Or install via winget:
winget install cloudflare.cloudflared

# Start tunnel (keep this terminal open!)
.\cloudflared.exe tunnel --url http://localhost:11434
```

**You'll see output like:**
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://aerial-score-creative-luggage.trycloudflare.com                                  |
+--------------------------------------------------------------------------------------------+
```

**Copy the URL** (e.g., `https://aerial-score-creative-luggage.trycloudflare.com`)

**⚠️ Important:** Keep this terminal window open! The tunnel stops when you close it.

---

### Step 2: Update Vercel Environment Variable (2 minutes)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your **Kepler** project

2. **Add/Update Environment Variable:**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in the sidebar
   - Look for `LLM_API_URL`:
     - If it exists: Click **"Edit"**
     - If it doesn't exist: Click **"Add New"**
   - Set:
     - **Name:** `LLM_API_URL`
     - **Value:** Your tunnel URL (e.g., `https://aerial-score-creative-luggage.trycloudflare.com`)
     - **Environments:** Check all ✅ (Production, Preview, Development)
   - Click **"Save"**

---

### Step 3: Redeploy on Vercel (1 minute)

**⚠️ CRITICAL: You MUST redeploy after changing environment variables!**

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click **"⋯"** (three dots menu)
4. Click **"Redeploy"**
5. Wait 2-3 minutes for deployment to complete

---

### Step 4: Test It! 🎉

1. Visit your Vercel URL
2. Go to the chat page
3. Send a message
4. It should work! ✅

---

## 🔄 Keep Tunnel Running

**The tunnel must stay running while you use the app.**

### Option 1: Keep Terminal Open (Simple)
- Just keep the PowerShell terminal open
- Tunnel runs as long as terminal is open

### Option 2: Run as Background Service (Advanced)
```powershell
# Install as Windows service
cloudflared service install

# Start service
net start cloudflared
```

### Option 3: Use Batch File
```powershell
.\scripts\START_TUNNEL.bat
```

---

## 🆘 Troubleshooting

### Issue: "Connection Error" still shows

**Check these:**

1. ✅ **Is tunnel running?**
   - Look at the terminal where you ran `cloudflared`
   - Should show "Registered tunnel connection"

2. ✅ **Is URL correct in Vercel?**
   - Go to Vercel → Settings → Environment Variables
   - Verify `LLM_API_URL` matches your tunnel URL exactly
   - Must start with `https://` (not `http://`)

3. ✅ **Did you redeploy?**
   - Environment variables only apply to NEW deployments
   - Go to Deployments → Redeploy

4. ✅ **Is Ollama running?**
   - Test: `curl http://localhost:11434/api/tags`
   - Should return your models list

5. ✅ **Check Vercel logs:**
   - Go to Deployments → Latest → Functions → `/api/chat` → Logs
   - Look for: `Using LLM API URL: ...`
   - Should show your tunnel URL, not `localhost`

---

### Issue: Tunnel URL changed

**Quick tunnels get new URLs each time you restart.**

**Solution:** Use a named tunnel (permanent URL):

```powershell
# Login to Cloudflare
cloudflared tunnel login

# Create named tunnel
cloudflared tunnel create my-ollama

# Run tunnel
cloudflared tunnel run my-ollama --url http://localhost:11434
```

This gives you a permanent URL that doesn't change.

---

### Issue: "403 Forbidden" error

**Cause:** Tunnel URL is wrong or tunnel stopped

**Fix:**
1. Restart tunnel
2. Copy new URL
3. Update Vercel environment variable
4. Redeploy

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] Ollama is running (`curl http://localhost:11434/api/tags` works)
- [ ] Cloudflare tunnel is running (terminal shows "Registered tunnel connection")
- [ ] `LLM_API_URL` is set in Vercel (Settings → Environment Variables)
- [ ] `LLM_API_URL` value matches tunnel URL exactly
- [ ] Redeployed after setting environment variable
- [ ] Tunnel URL starts with `https://` (not `http://`)

---

## 🎯 Most Common Issue

**90% of problems are:**
- ✅ Environment variable is set
- ❌ **But you forgot to REDEPLOY!**

**Solution:** Always redeploy after changing environment variables!

---

## 📚 More Help

- **Quick Setup:** See `QUICK_DEPLOY_CLOUDFLARE.md`
- **Full Guide:** See `DEPLOYMENT_CLOUDFLARE.md`
- **Debug Guide:** See `DEBUG_VERCEL.md`

---

## ✅ Success!

Once working, you'll see:
- ✅ "Connected" status in the chat header
- ✅ Messages send and receive responses
- ✅ No connection errors

Enjoy your deployed app! 🚀

