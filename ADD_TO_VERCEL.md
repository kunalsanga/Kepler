# ✅ Add Tunnel URL to Vercel

## Your Tunnel URL:
```
https://aerial-score-creative-luggage.trycloudflare.com
```

## Steps:

1. **Go to Vercel Dashboard:**
   - Open: https://vercel.com/dashboard
   - Click on your **Kepler** project

2. **Go to Settings:**
   - Click **"Settings"** tab (top menu)
   - Click **"Environment Variables"** (left sidebar)

3. **Add New Variable:**
   - Click **"Add New"** or **"Create"**
   - **Name**: `LLM_API_URL`
   - **Value**: `https://aerial-score-creative-luggage.trycloudflare.com`
   - **Environment**: Check all three:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **"Save"**

4. **Redeploy:**
   - Go to **"Deployments"** tab
   - Find your latest deployment
   - Click the **"⋯"** (three dots) menu
   - Click **"Redeploy"**
   - Or just push a new commit to trigger auto-deploy

5. **Wait 1-2 minutes** for redeploy to complete

6. **Test:**
   - Visit your Vercel URL
   - Go to chat page
   - Send a message
   - You should get a response! 🎉

---

## ⚠️ Important:

- **Keep the tunnel terminal open!** The tunnel must stay running
- If you close it, your site won't be able to connect
- The URL will change if you restart the tunnel (that's normal for quick tunnels)

---

## 🎉 Done!

Your ChatGPT app is now fully deployed and working!

