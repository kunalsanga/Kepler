# Quick Start Guide

## 🚀 Fastest Way to Run (Text Chat Only)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env.local`
Create a file named `.env.local` in the root directory:
```env
LOCAL_LLM_URL=http://127.0.0.1:11434
```

### 3. Start Ollama
Make sure Ollama is running:
```bash
ollama serve
```

### 4. Start Next.js
```bash
npm run dev
```

### 5. Open Browser
Go to: **http://localhost:3000**

**Done!** You can now chat with Qwen-2.5.

---

## 🎨 Full Setup (Text + Image + Video)

### Step 1: Environment Variables
Create `.env.local`:
```env
LOCAL_LLM_URL=http://127.0.0.1:11434
COMFYUI_URL=http://localhost:8188
COGVIDEO_URL=http://localhost:7860
```

### Step 2: Setup Services

**Option A: Use the batch script (Windows)**
```batch
START_ALL_SERVICES.bat
```

**Option B: Manual setup**

1. **Setup ComfyUI:**
   ```powershell
   .\scripts\setup-comfyui.ps1
   ```
   Then download a model to `ComfyUI/models/checkpoints/`

2. **Setup CogVideo:**
   ```powershell
   .\scripts\setup-cogvideo.ps1
   ```

### Step 3: Start Everything

**Windows:**
```batch
START_ALL_SERVICES.bat
```

**Manual (4 terminals):**
- Terminal 1: `ollama serve`
- Terminal 2: `cd ComfyUI && python main.py --port 8188 --lowvram`
- Terminal 3: `cd CogVideo && python -m cogvideo.cli.api --port 7860 --low-resource-mode`
- Terminal 4: `npm run dev`

### Step 4: Test

1. Open **http://localhost:3000**
2. Try text: "Hello!"
3. Try image: `/image a cat playing piano`
4. Try video: `/video a sunset over mountains`

---

## 📝 Commands in Chat

### Image Generation
- `/image [your prompt]`
- `generate image: [your prompt]`

### Video Generation
- `/video [your prompt]`
- `generate video: [your prompt]`

---

## ⚠️ Troubleshooting

**"Connection refused"**
- Check if services are running
- Verify ports: 11434 (Ollama), 8188 (ComfyUI), 7860 (CogVideo)

**ComfyUI/CogVideo not working**
- Make sure you ran the setup scripts
- Check if models are downloaded
- Verify GPU has enough VRAM (6GB minimum)

**Next.js errors**
- Run `npm install`
- Delete `.next` folder and restart

---

## 📚 More Help

- Full guide: `HOW_TO_RUN.md`
- Setup details: `GENERATION_SETUP.md`
- Architecture: `MVP_EXTENSION_DESIGN.md`
