# 🔧 Debug Vercel Deployment - Step by Step

Your project works locally but not on Vercel. Let's fix it!

---

## ✅ STEP 1: Verify Environment Variable in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click your **Kepler** project

2. **Check Environment Variables:**
   - Click **"Settings"** → **"Environment Variables"**
   - Look for `LLM_API_URL`
   - **Value should be:** `https://aerial-score-creative-luggage.trycloudflare.com`
   - **All environments checked:** ✅ Production, ✅ Preview, ✅ Development

3. **If it's wrong or missing:**
   - Click **"Add"** or **"Edit"**
   - **Name:** `LLM_API_URL`
   - **Value:** `https://aerial-score-creative-luggage.trycloudflare.com`
   - Check all environments
   - Click **"Save"**

---

## ✅ STEP 2: REDEPLOY (Critical!)

**After updating environment variables, you MUST redeploy:**

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click **"⋯"** (three dots)
4. Click **"Redeploy"**
5. **Wait 2-3 minutes** for it to complete

**⚠️ This is the most common issue - environment variables only take effect after redeploy!**

---

## ✅ STEP 3: Check Vercel Logs

**See what URL Vercel is actually using:**

1. Go to **"Deployments"** tab
2. Click on the **latest deployment**
3. Click **"Functions"** tab
4. Click on **`/api/chat`**
5. Look at the logs - you should see:
   ```
   Using LLM API URL: https://aerial-score-creative-luggage.trycloudflare.com
   ```

**If you see `http://localhost:11434`** → Environment variable not loaded (need to redeploy)

**If you see the tunnel URL** → Good! Check for other errors

---

## ✅ STEP 4: Verify Tunnel is Running

**On your laptop, check:**

1. **Is the tunnel terminal still open?**
   - Look for the terminal where you ran `.\cloudflared.exe tunnel --url http://localhost:11434`
   - It should show "Registered tunnel connection"

2. **If tunnel stopped, restart it:**
   ```powershell
   .\cloudflared.exe tunnel --url http://localhost:11434
   ```
   - **Copy the NEW URL** if it changed
   - Update Vercel with new URL
   - Redeploy

---

## ✅ STEP 5: Test Tunnel URL Directly

**Test if the tunnel works from your laptop:**

```powershell
# Test the tunnel
Invoke-WebRequest -Uri "https://aerial-score-creative-luggage.trycloudflare.com/api/tags" -UseBasicParsing
```

**Expected:** Should return JSON with your models

**If it fails:** 
- Tunnel might not be running
- URL might have changed
- Restart tunnel and get new URL

---

## ✅ STEP 6: Check Browser Console

**On your Vercel site:**

1. Open your Vercel URL
2. Press **F12** to open developer tools
3. Go to **"Console"** tab
4. Go to chat page and send a message
5. Look for errors

**Common errors:**
- `403 Forbidden` → Tunnel URL wrong or tunnel not running
- `Connection refused` → Tunnel stopped
- `CORS error` → API route issue

---

## 🎯 Quick Fix Checklist

Run through this checklist:

- [ ] **Environment variable exists in Vercel**
  - Name: `LLM_API_URL`
  - Value: `https://aerial-score-creative-luggage.trycloudflare.com`
  - All environments checked

- [ ] **Redeployed after setting variable**
  - Went to Deployments → Redeploy
  - Waited 2-3 minutes
  - Deployment shows "Ready"

- [ ] **Tunnel is running**
  - Terminal window open
  - Shows "Registered tunnel connection"
  - URL matches Vercel environment variable

- [ ] **Ollama is running**
  - Test: `curl http://localhost:11434/api/tags`
  - Should return models list

- [ ] **Checked Vercel logs**
  - Functions → /api/chat
  - See what URL is being used
  - Check for error messages

---

## 🆘 Common Issues & Fixes

### Issue 1: "403 Forbidden" on Vercel

**Cause:** Environment variable not loaded or wrong URL

**Fix:**
1. Verify `LLM_API_URL` in Vercel settings
2. **Redeploy** (this is critical!)
3. Check tunnel is running
4. Verify URL matches exactly

### Issue 2: "Connection refused"

**Cause:** Tunnel stopped or Ollama not running

**Fix:**
1. Restart tunnel: `.\cloudflared.exe tunnel --url http://localhost:11434`
2. Copy new URL if it changed
3. Update Vercel
4. Redeploy

### Issue 3: Works locally but not on Vercel

**Cause:** Environment variable not set in Vercel

**Fix:**
1. Add `LLM_API_URL` to Vercel
2. Set value to your tunnel URL
3. **Redeploy** (must do this!)
4. Wait for deployment

### Issue 4: Environment variable shows in Vercel but not working

**Cause:** Not redeployed after setting variable

**Fix:**
- **Redeploy** the project
- Environment variables only apply to NEW deployments

---

## 🔍 Debug Commands

**Test locally:**
```powershell
# Test Ollama
Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing

# Test tunnel
Invoke-WebRequest -Uri "https://aerial-score-creative-luggage.trycloudflare.com/api/tags" -UseBasicParsing
```

**Check Vercel:**
- Go to Deployments → Latest → Functions → /api/chat → Logs
- Look for: `Using LLM API URL: ...`

---

## ✅ Most Likely Fix

**90% of the time, the issue is:**

1. ✅ Environment variable is set in Vercel
2. ❌ **But you forgot to REDEPLOY!**

**Solution:**
- Go to Deployments → Redeploy
- Wait 2-3 minutes
- Test again

---

## 📞 Still Not Working?

**Share these details:**

1. What error do you see on Vercel? (screenshot if possible)
2. What does Vercel logs show? (Functions → /api/chat → Logs)
3. Is tunnel running? (terminal window status)
4. What URL is in Vercel environment variable?

Let's debug together! 🚀

