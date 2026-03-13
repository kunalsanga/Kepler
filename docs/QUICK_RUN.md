# Quick Run Guide - Image & Video Generation

## 🚀 Fastest Way to Get Everything Running

### Step 1: Start Generation Services

**Windows:**
```batch
START_GENERATION_SERVICES.bat
```

This automatically starts:
- ✅ ComfyUI (port 8188) for images
- ✅ CogVideo (port 7860) for videos

**Keep the terminal windows open!**

### Step 2: Start Next.js (if not already running)

```bash
npm run dev
```

### Step 3: Test It!

Open http://localhost:3000 and try:

**Natural Language (NEW!):**
- "can you generate image?"
- "can you create a video?"
- "generate image of a cat"
- "create video of sunset"

**Explicit Commands:**
- `/image a cat playing piano`
- `/video a sunset over mountains`

---

## 🎯 How It Works Now

1. **User asks**: "can you generate image?"
2. **LLM responds**: "Of course! I'll generate an image for you."
3. **System detects**: The request automatically
4. **Generation starts**: Image/video generation begins
5. **Result shows**: Image/video appears in chat

---

## ⚙️ First Time Setup

If you haven't set up ComfyUI and CogVideo yet:

1. **Setup ComfyUI:**
   ```powershell
   .\scripts\setup-comfyui.ps1
   ```
   Then download a model to `ComfyUI/models/checkpoints/`

2. **Setup CogVideo:**
   ```powershell
   .\scripts\setup-cogvideo.ps1
   ```

3. **Then run:**
   ```batch
   START_GENERATION_SERVICES.bat
   ```

---

## 🔧 Troubleshooting

**"Connection refused" errors:**
- Make sure `START_GENERATION_SERVICES.bat` is running
- Check if ports 8188 and 7860 are in use
- Verify services started successfully (check terminal windows)

**Generation not working:**
- Verify ComfyUI/CogVideo directories exist
- Check if models are downloaded
- Test services: `curl http://localhost:8188/system_stats`

**Natural language not detected:**
- Try explicit commands: `/image [prompt]` or `/video [prompt]`
- Check browser console for errors

---

## 📝 What Changed

✅ **Automatic service startup** - Just run the batch script  
✅ **Natural language detection** - No need for `/image` or `/video` commands  
✅ **LLM awareness** - The AI knows it can generate images/videos  
✅ **Seamless integration** - Works automatically when you ask

---

## 🎉 You're All Set!

Just run `START_GENERATION_SERVICES.bat` and start chatting!

