# ✅ Verify Deployment - Step by Step

## 🔍 Step 1: Check Environment Variable in Vercel

1. Go to: https://vercel.com/dashboard
2. Click your **Kepler** project
3. **Settings** → **Environment Variables**
4. Verify `LLM_API_URL` exists and has value:
   ```
   https://aerial-score-creative-luggage.trycloudflare.com
   ```
5. Make sure it's checked for **all environments** (Production, Preview, Development)

---

## 🔄 Step 2: REDEPLOY (This is Critical!)

**After updating environment variables, you MUST redeploy:**

1. Go to **"Deployments"** tab
2. Find your latest deployment
3. Click the **"⋯"** (three dots) menu
4. Click **"Redeploy"**
5. **Wait 2-3 minutes** for deployment to complete
6. You'll see "Ready" when it's done

**⚠️ IMPORTANT:** Just updating the environment variable is NOT enough - you must redeploy!

---

## 🧪 Step 3: Test the Tunnel Directly

**On your laptop, open a NEW terminal and test:**

```powershell
# Test if tunnel is accessible
Invoke-WebRequest -Uri "https://aerial-score-creative-luggage.trycloudflare.com/api/tags" -UseBasicParsing
```

**Or use curl:**
```powershell
curl https://aerial-score-creative-luggage.trycloudflare.com/api/tags
```

**Expected:** Should return JSON with your models

**If this fails:** The tunnel might not be running or accessible

---

## 🔍 Step 4: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Click **"Functions"** tab
5. Click on `/api/chat`
6. Check the logs - you should see:
   - `Using LLM API URL: https://aerial-score-creative-luggage.trycloudflare.com`
   - Any error messages

---

## ✅ Step 5: Test Your Site

1. Visit your Vercel URL
2. Open browser console (F12)
3. Go to chat page
4. Send a message
5. Check console for errors
6. Check Network tab to see the API request

---

## 🆘 Common Issues

### Issue 1: "403 Forbidden"
**Cause:** Environment variable not loaded or wrong URL
**Fix:** 
- Verify URL in Vercel settings
- **Redeploy** after updating
- Check tunnel is running

### Issue 2: "Connection refused"
**Cause:** Tunnel not running
**Fix:**
- Start tunnel: `.\cloudflared.exe tunnel --url http://localhost:11434`
- Keep terminal open

### Issue 3: "Environment variable not set"
**Cause:** Variable not saved or wrong name
**Fix:**
- Check exact name: `LLM_API_URL` (case-sensitive)
- Make sure it's saved
- Redeploy

---

## 📋 Checklist

- [ ] Environment variable `LLM_API_URL` exists in Vercel
- [ ] Value is: `https://aerial-score-creative-luggage.trycloudflare.com`
- [ ] All environments checked (Production, Preview, Development)
- [ ] **Redeployed** after updating variable
- [ ] Tunnel is running (terminal open)
- [ ] Ollama is running (`curl http://localhost:11434/api/tags` works)
- [ ] Tested tunnel URL directly
- [ ] Checked Vercel logs for errors

---

## 🎯 Quick Fix

**If still not working:**

1. **Double-check tunnel is running:**
   ```powershell
   .\cloudflared.exe tunnel --url http://localhost:11434
   ```

2. **Copy the NEW URL** (if it changed)

3. **Update Vercel** with new URL

4. **Redeploy** (this is the key step!)

5. **Wait 2-3 minutes** for deployment

6. **Test again**

---

**The most common issue is forgetting to REDEPLOY after updating environment variables!** 🔄

