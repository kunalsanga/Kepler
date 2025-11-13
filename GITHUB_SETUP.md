# 📦 Push to GitHub - Step by Step Guide

Complete guide to push your project to GitHub and deploy to Vercel.

---

## ✅ STEP 1: Create GitHub Repository

### 1.1 Go to GitHub

1. Open [github.com](https://github.com) in your browser
2. Sign in (or create account if you don't have one - it's free)
3. Click the **"+"** icon in top right → **"New repository"**

### 1.2 Create New Repository

Fill in:
- **Repository name**: `kepler-chat` (or any name you like)
- **Description**: "ChatGPT-like app with Ollama" (optional)
- **Visibility**: 
  - ✅ **Public** (recommended - free, easy to deploy)
  - Or **Private** (if you want it private)
- **DO NOT** check "Add a README file" (we already have one)
- **DO NOT** add .gitignore or license (we already have them)

4. Click **"Create repository"**

---

## ✅ STEP 2: Push Your Code to GitHub

### 2.1 Open Terminal/CMD in Your Project

**Option A: Using CMD**
```cmd
cd "C:\Users\kunal sanga\OneDrive\文档\Kepler"
```

**Option B: Using PowerShell**
```powershell
cd "C:\Users\kunal sanga\OneDrive\文档\Kepler"
```

**Option C: Using VS Code**
- Open VS Code in your project folder
- Press `` Ctrl + ` `` to open terminal
- Terminal will already be in the right directory

### 2.2 Initialize Git (if not already done)

```bash
git init
```

### 2.3 Add All Files

```bash
git add .
```

### 2.4 Create First Commit

```bash
git commit -m "Initial commit - ChatGPT app with Ollama"
```

### 2.5 Connect to GitHub

**Replace `YOUR_USERNAME` with your actual GitHub username:**

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kepler-chat.git
```

**Example:**
```bash
# If your GitHub username is "johnsmith"
git remote add origin https://github.com/johnsmith/kepler-chat.git
```

### 2.6 Push to GitHub

```bash
git push -u origin main
```

**You'll be asked to login:**
- If you see a login prompt, enter your GitHub username and password
- Or use a Personal Access Token (see below if you get errors)

---

## 🔐 If You Get Authentication Errors

### Option A: Use Personal Access Token (Recommended)

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: "Vercel Deployment"
4. Select scopes: Check **"repo"** (full control of private repositories)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)

7. When pushing, use the token as password:
   ```bash
   git push -u origin main
   # Username: your-github-username
   # Password: paste-your-token-here
   ```

### Option B: Use GitHub Desktop (Easier)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Sign in with GitHub
3. File → Add Local Repository → Select your project folder
4. Click "Publish repository" button
5. Done! ✅

---

## ✅ STEP 3: Verify on GitHub

1. Go to your GitHub profile: `https://github.com/YOUR_USERNAME`
2. You should see your repository `kepler-chat`
3. Click on it to see all your files

✅ **Your code is now on GitHub!**

---

## ✅ STEP 4: Deploy to Vercel

### 4.1 Go to Vercel

1. Open [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### 4.2 Import Your Repository

1. Click **"Add New Project"** or **"New Project"**
2. You'll see a list of your GitHub repositories
3. Find **"kepler-chat"** (or whatever you named it)
4. Click **"Import"**

### 4.3 Configure Project

Vercel will auto-detect Next.js, so you can mostly use defaults:

- **Framework Preset**: Next.js ✅ (auto-detected)
- **Root Directory**: `./` ✅ (default)
- **Build Command**: `npm run build` ✅ (default)
- **Output Directory**: `.next` ✅ (default)
- **Install Command**: `npm install` ✅ (default)

**Environment Variables**: 
- Skip for now (we'll add `LLM_API_URL` later after setting up Cloudflare Tunnel)

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll see: **"Congratulations! Your project has been deployed."**

🎉 **Your website is now live!**

You'll get a URL like: `https://kepler-chat-xxxxx.vercel.app`

---

## ✅ STEP 5: Test Your Deployment

1. Click the **"Visit"** button or copy the URL
2. Your website should load!
3. Try navigating to the chat page

**Note**: Chat won't work yet because we haven't set up the Cloudflare Tunnel. That's the next step!

---

## 📋 Quick Command Reference

```bash
# Navigate to project
cd "C:\Users\kunal sanga\OneDrive\文档\Kepler"

# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/kepler-chat.git

# Push
git push -u origin main
```

---

## 🆘 Troubleshooting

### "Repository not found"
- Check your GitHub username is correct
- Make sure you created the repository on GitHub first
- Verify the repository name matches

### "Authentication failed"
- Use Personal Access Token (see Option A above)
- Or use GitHub Desktop (see Option B above)

### "Permission denied"
- Make sure you're logged into GitHub
- Check you have write access to the repository

### "fatal: not a git repository"
- Run `git init` first
- Make sure you're in the project folder

---

## ✅ Next Steps

After deploying to Vercel:

1. **Set up Cloudflare Tunnel** (see `QUICK_DEPLOY_CLOUDFLARE.md`)
2. **Add environment variable** in Vercel:
   - `LLM_API_URL` = your Cloudflare Tunnel URL
3. **Redeploy** Vercel project
4. **Test** your live chatbot!

---

## 🎉 You're Done!

Your code is now:
- ✅ On GitHub (version controlled)
- ✅ Deployed on Vercel (live website)
- 🌐 Accessible worldwide at your Vercel URL

Next: Set up Cloudflare Tunnel to connect your local Ollama! 🚀

