# 📱 Access Your Website from Phone - Complete Guide

How to use your ChatGPT app on your phone when your laptop is running.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Ollama Server
### Step 2: Start Cloudflare Tunnel  
### Step 3: Open Website on Phone

---

## ✅ STEP 1: Start Ollama Server

**On your laptop:**

### Option A: Ollama is Already Running (Most Common)

Ollama usually runs automatically on Windows. Check if it's running:

```powershell
# Test if Ollama is running
curl http://localhost:11434/api/tags
```

**If you get a response** → Ollama is running! ✅ Skip to Step 2.

**If you get an error** → Start Ollama:

```powershell
# Start Ollama server
ollama serve
```

Or just open Ollama app (it starts automatically).

---

## ✅ STEP 2: Start Cloudflare Tunnel

**On your laptop, in your project folder:**

```powershell
# Navigate to project
cd "C:\Users\kunal sanga\OneDrive\文档\Kepler"

# Start tunnel
.\cloudflared.exe tunnel --url http://localhost:11434
```

**You'll see:**
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at:                                         |
|  https://aerial-score-creative-luggage.trycloudflare.com                                  |
+--------------------------------------------------------------------------------------------+
```

**📋 COPY THE URL!** (It might be different each time)

**⚠️ KEEP THIS TERMINAL WINDOW OPEN!** The tunnel must stay running.

---

## ✅ STEP 3: Open Website on Phone

### Your Vercel Website URL

You have two options:

**Option A: Use Your Vercel URL (Recommended)**
- Go to: `https://kepler-xxxxx.vercel.app` (your actual Vercel URL)
- This works from anywhere in the world!
- The tunnel URL is already configured in Vercel

**Option B: Use Tunnel URL Directly (For Testing)**
- Go to: `https://aerial-score-creative-luggage.trycloudflare.com` (or your current tunnel URL)
- This is just for testing the tunnel

---

## 📋 Complete Workflow

### Every Time You Want to Use It:

1. **Turn on your laptop**
2. **Start Ollama** (usually auto-starts, or run `ollama serve`)
3. **Start tunnel** (run the cloudflared command)
4. **Copy the tunnel URL** (if it changed)
5. **Update Vercel** (if URL changed - see below)
6. **Open website on phone** using your Vercel URL

---

## 🔄 If Tunnel URL Changes

The quick tunnel URL changes each time you restart. If it changes:

1. **Copy the new URL** from the tunnel output
2. **Go to Vercel** → Your Project → Settings → Environment Variables
3. **Update `LLM_API_URL`** with the new URL
4. **Redeploy** (or wait for auto-deploy)
5. **Test** on your phone

---

## 🎯 Pro Tips

### Make It Easier - Create Shortcuts

**Create a batch file to start everything:**

Create `START_EVERYTHING.bat`:

```batch
@echo off
echo Starting Ollama and Tunnel...
echo.

REM Check if Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting Ollama...
    start "" "ollama serve"
    timeout /t 3
)

echo Starting Cloudflare Tunnel...
echo.
echo Your tunnel URL will appear below:
echo.
cd /d "%~dp0"
cloudflared.exe tunnel --url http://localhost:11434

pause
```

**Double-click this file** to start everything at once!

---

### Keep Tunnel Running in Background

**Option 1: Run in Separate Window**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\kunal sanga\OneDrive\文档\Kepler'; .\cloudflared.exe tunnel --url http://localhost:11434"
```

**Option 2: Use Windows Service** (Advanced)
See `DEPLOYMENT_CLOUDFLARE.md` for service setup

---

## 📱 Accessing from Phone

### Your Vercel URL (Works Everywhere)

Once set up, you can access your site from:
- ✅ Your phone (anywhere)
- ✅ Friend's phone
- ✅ Any computer
- ✅ Anywhere in the world!

**Just use your Vercel URL:**
```
https://kepler-xxxxx.vercel.app
```

The tunnel URL is configured in Vercel, so you don't need to change anything on your phone!

---

## ⚠️ Important Notes

### Requirements for It to Work:

1. **Laptop must be ON** ✅
2. **Laptop must be connected to internet** ✅
3. **Ollama must be running** ✅
4. **Tunnel must be running** ✅
5. **Vercel has the correct tunnel URL** ✅

### If It Stops Working:

1. **Check Ollama**: `curl http://localhost:11434/api/tags`
2. **Check tunnel**: Is the terminal window still open?
3. **Check Vercel**: Is `LLM_API_URL` correct?
4. **Restart tunnel**: Get new URL and update Vercel

---

## 🎉 Summary

**To use from phone:**

1. **Laptop ON** → Start Ollama → Start Tunnel
2. **Copy tunnel URL** (if changed)
3. **Update Vercel** (if URL changed)
4. **Open Vercel URL on phone** → Chat works! 🚀

**Your Vercel URL works from anywhere as long as:**
- Your laptop is on
- Ollama is running
- Tunnel is running

---

## 📚 Related Files

- `DEPLOYMENT_CLOUDFLARE.md` - Full deployment guide
- `SETUP_TUNNEL_NOW.md` - Quick tunnel setup
- `START_TUNNEL.bat` - Quick tunnel starter

Enjoy chatting from your phone! 📱✨

