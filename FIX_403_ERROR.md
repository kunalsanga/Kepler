# 🔧 Fix 403 Error - Quick Guide

The 403 error means the tunnel URL changed or the tunnel stopped. Here's how to fix it:

---

## ✅ STEP 1: Check if Tunnel is Running

**Look at your terminal where you ran the tunnel command.**

- ✅ **If you see tunnel output** → Tunnel is running, go to Step 2
- ❌ **If terminal is closed or shows errors** → Go to Step 2 to restart

---

## ✅ STEP 2: Start/Restart Tunnel

**In your project folder, run:**

```powershell
.\cloudflared.exe tunnel --url http://localhost:11434
```

**You'll see a new URL like:**
```
https://xxxxx-xxxxx-xxxxx.trycloudflare.com
```

**📋 COPY THIS NEW URL!**

**⚠️ Keep the terminal window open!**

---

## ✅ STEP 3: Update Vercel with New URL

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click your **Kepler** project

2. **Go to Settings:**
   - Click **"Settings"** tab
   - Click **"Environment Variables"**

3. **Update the Variable:**
   - Find `LLM_API_URL`
   - Click **"Edit"** (or delete and recreate)
   - **Value**: Paste your NEW tunnel URL
   - Click **"Save"**

4. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click **"⋯"** on latest deployment
   - Click **"Redeploy"**
   - Wait 1-2 minutes

---

## ✅ STEP 4: Test

1. Visit your Vercel URL
2. Go to chat page
3. Send a message
4. Should work now! ✅

---

## 🔄 Why This Happens

**Quick tunnels get a NEW URL each time you restart them.**

**Solutions:**

### Option A: Keep Tunnel Running (Current Method)
- Don't close the terminal
- URL stays the same while running
- If you restart, get new URL and update Vercel

### Option B: Use Named Tunnel (Permanent URL)
See `DEPLOYMENT_CLOUDFLARE.md` for setting up a permanent tunnel with a custom domain.

---

## 🆘 Still Getting 403?

### Check These:

1. **Is tunnel running?**
   - Look at terminal window
   - Should see "Registered tunnel connection"

2. **Is Ollama running?**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing
   ```
   - Should return 200 OK

3. **Is URL correct in Vercel?**
   - Check Settings → Environment Variables
   - Make sure it matches the tunnel URL exactly
   - No extra spaces or characters

4. **Did you redeploy?**
   - After changing environment variable, you MUST redeploy
   - Or push a new commit

---

## ✅ Quick Fix Checklist

- [ ] Tunnel is running (terminal open)
- [ ] Copied the NEW tunnel URL
- [ ] Updated `LLM_API_URL` in Vercel
- [ ] Redeployed Vercel project
- [ ] Waited 1-2 minutes for redeploy
- [ ] Tested on Vercel URL

---

## 🎯 Pro Tip: Use START_EVERYTHING.bat

Double-click `START_EVERYTHING.bat` to:
- Check Ollama
- Start tunnel
- Show you the URL

Then just copy the URL and update Vercel!

---

**After updating Vercel with the new tunnel URL and redeploying, your site should work!** 🚀

