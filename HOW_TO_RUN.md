# How to Run Kepler AI

## Quick Start (Text Chat Only)

If you just want to run the chat interface with text generation:

### 1. Start Ollama
```bash
ollama serve
```

### 2. Install Next.js Dependencies
```bash
npm install
```

### 3. Create `.env.local`
```env
LOCAL_LLM_URL=http://127.0.0.1:11434
```

### 4. Run Next.js
```bash
npm run dev
```

### 5. Open Browser
Navigate to: `http://localhost:3000`

---

## Full Setup (Text + Image + Video)

You have **two options** for image/video generation:

### Option A: Next.js API Routes (New Implementation)

This uses the new API routes I just created.

#### Step 1: Environment Variables
Create `.env.local`:
```env
LOCAL_LLM_URL=http://127.0.0.1:11434
COMFYUI_URL=http://localhost:8188
COGVIDEO_URL=http://localhost:7860
```

#### Step 2: Setup ComfyUI
**Windows:**
```powershell
.\scripts\setup-comfyui.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-comfyui.sh
./scripts/setup-comfyui.sh
```

**Then download a model:**
- Go to `ComfyUI/models/checkpoints/`
- Download a model like `sd-turbo.safetensors` or `sd-xl-turbo.safetensors`

#### Step 3: Setup CogVideo
**Windows:**
```powershell
.\scripts\setup-cogvideo.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-cogvideo.sh
./scripts/setup-cogvideo.sh
```

#### Step 4: Start All Services

Open **4 separate terminal windows**:

**Terminal 1 - Ollama:**
```bash
ollama serve
```

**Terminal 2 - ComfyUI:**
```bash
cd ComfyUI
python main.py --port 8188 --lowvram
```

**Terminal 3 - CogVideo:**
```bash
cd CogVideo
python -m cogvideo.cli.api --port 7860 --low-resource-mode
```

**Terminal 4 - Next.js App:**
```bash
npm run dev
```

#### Step 5: Test
1. Open `http://localhost:3000`
2. Try text chat: "Hello, how are you?"
3. Try image: `/image a cat playing piano`
4. Try video: `/video a sunset over mountains`

---

### Option B: Python Backend (Existing Implementation)

This uses your existing `backend/main.py` FastAPI server.

#### Step 1: Install Python Dependencies
```bash
cd backend
pip install fastapi uvicorn requests websocket-client
```

#### Step 2: Setup ComfyUI
Same as Option A, Step 2.

#### Step 3: Start Services

**Terminal 1 - Ollama:**
```bash
ollama serve
```

**Terminal 2 - ComfyUI:**
```bash
cd ComfyUI
python main.py --port 8188 --lowvram
```

**Terminal 3 - Python Backend:**
```bash
cd backend
python main.py
# Or: uvicorn main:app --host 0.0.0.0 --port 8000
```

**Terminal 4 - Next.js App:**
```bash
npm run dev
```

**Note:** You'll need to update your Next.js API routes to point to `http://localhost:8000` instead of direct ComfyUI/CogVideo.

---

## Windows Batch Script (Quick Start)

Create `START_ALL.bat`:

```batch
@echo off
echo Starting Kepler AI Services...

start "Ollama" cmd /k "ollama serve"
timeout /t 3 /nobreak >nul

start "ComfyUI" cmd /k "cd ComfyUI && python main.py --port 8188 --lowvram"
timeout /t 3 /nobreak >nul

start "CogVideo" cmd /k "cd CogVideo && python -m cogvideo.cli.api --port 7860 --low-resource-mode"
timeout /t 3 /nobreak >nul

start "Next.js" cmd /k "npm run dev"

echo.
echo All services starting...
echo Open http://localhost:3000 in your browser
pause
```

---

## Troubleshooting

### "Connection refused" errors
- Check if services are running on correct ports
- Verify `.env.local` has correct URLs
- Test each service individually:
  - Ollama: `curl http://localhost:11434/api/tags`
  - ComfyUI: `curl http://localhost:8188/system_stats`
  - CogVideo: Check if port 7860 is listening

### ComfyUI not generating images
- Verify model is in `ComfyUI/models/checkpoints/`
- Check ComfyUI console for errors
- Try `--normalvram` instead of `--lowvram` if you have headroom

### CogVideo timeout
- Reduce frame count (default: 8)
- Lower resolution in `lib/cogvideo.ts`
- Check GPU memory usage

### Next.js build errors
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next` (or `rmdir /s .next` on Windows)
- Check Node.js version: `node --version` (should be 18+)

---

## Recommended: Start with Text Only

If you're new, start simple:

1. **Just run Ollama + Next.js** (no image/video)
2. Test the chat interface
3. Once working, add ComfyUI for images
4. Finally add CogVideo for videos

This way you can debug issues one service at a time.

---

## Port Summary

| Service | Port | URL |
|---------|------|-----|
| Ollama | 11434 | http://localhost:11434 |
| ComfyUI | 8188 | http://localhost:8188 |
| CogVideo | 7860 | http://localhost:7860 |
| Next.js | 3000 | http://localhost:3000 |
| Python Backend (if used) | 8000 | http://localhost:8000 |

