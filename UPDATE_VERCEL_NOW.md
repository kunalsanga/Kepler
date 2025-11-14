# ✅ Update Vercel - Step by Step

## Your Tunnel URL:
```
https://aerial-score-creative-luggage.trycloudflare.com
```

---

## 📋 Steps to Update Vercel:

### 1. Go to Vercel Dashboard
- Open: https://vercel.com/dashboard
- Click on your **Kepler** project

### 2. Go to Environment Variables
- Click **"Settings"** tab (top menu)
- Click **"Environment Variables"** (left sidebar)

### 3. Update LLM_API_URL
- Find `LLM_API_URL` in the list
- Click **"Edit"** (or delete and recreate if needed)
- **Value**: `https://aerial-score-creative-luggage.trycloudflare.com`
- Make sure all environments are checked:
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- Click **"Save"**

### 4. Redeploy (IMPORTANT!)
- Go to **"Deployments"** tab
- Find your latest deployment
- Click the **"⋯"** (three dots) menu
- Click **"Redeploy"**
- Wait 1-2 minutes for deployment to complete

### 5. Test
- Visit your Vercel URL
- Go to chat page
- Send a test message
- Should work now! ✅

---

## ⚠️ Important Notes:

- **Keep the tunnel terminal open!** The tunnel must stay running
- The URL will work as long as the tunnel is running
- If you restart the tunnel, you'll get a new URL and need to update again

---

## 🧪 Test the Tunnel Directly

Before updating Vercel, you can test if the tunnel works:

Open a NEW terminal and run:
```powershell
Invoke-WebRequest -Uri "https://aerial-score-creative-luggage.trycloudflare.com/api/tags" -UseBasicParsing
```

If you get a response, the tunnel is working! ✅

---

After updating Vercel and redeploying, your site should work! 🚀

