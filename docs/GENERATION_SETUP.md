# Image & Video Generation Setup

This guide explains how to set up image and video generation for Kepler AI.

## Prerequisites

- NVIDIA RTX 4050 (6GB VRAM) or similar
- Python 3.8+ with pip
- CUDA 12.1+ installed
- Ollama already running (for text generation)

## Quick Start

### 1. Environment Variables

Create or update `.env.local`:

```env
LOCAL_LLM_URL=http://127.0.0.1:11434
COMFYUI_URL=http://localhost:8188
COGVIDEO_URL=http://localhost:7860
```

### 2. Setup ComfyUI (Image Generation)

**Windows:**
```powershell
.\scripts\setup-comfyui.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-comfyui.sh
./scripts/setup-comfyui.sh
```

**Manual Setup:**
1. Clone ComfyUI: `git clone https://github.com/comfyanonymous/ComfyUI.git`
2. Install dependencies: `pip install -r requirements.txt`
3. Download a model (e.g., `sd-turbo`) to `ComfyUI/models/checkpoints/`
4. Start ComfyUI: `python main.py --port 8188 --lowvram`

### 3. Setup CogVideo (Video Generation)

**Windows:**
```powershell
.\scripts\setup-cogvideo.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-cogvideo.sh
./scripts/setup-cogvideo.sh
```

**Manual Setup:**
1. Clone CogVideo: `git clone https://github.com/THUDM/CogVideo.git`
2. Install dependencies: `pip install -r requirements.txt`
3. Download `cogvideo2-2b` model
4. Start CogVideo API: `python -m cogvideo.cli.api --port 7860 --low-resource-mode`

### 4. Start Services

Start all services in separate terminals:

1. **Ollama** (if not already running):
   ```bash
   ollama serve
   ```

2. **ComfyUI**:
   ```bash
   cd ComfyUI
   python main.py --port 8188 --lowvram
   ```

3. **CogVideo**:
   ```bash
   cd CogVideo
   python -m cogvideo.cli.api --port 7860 --low-resource-mode
   ```

4. **Next.js App**:
   ```bash
   npm run dev
   ```

## Usage

### Image Generation

In the chat, use one of these commands:
- `/image a cat playing piano`
- `generate image: sunset over mountains`

### Video Generation

In the chat, use one of these commands:
- `/video a cat playing piano`
- `generate video: sunset over mountains`

## VRAM Constraints

With 6GB VRAM:
- **Image**: Max 512x512 resolution (768x768 if VRAM allows)
- **Video**: Max 8 frames, 256x256 resolution
- **Sequential**: Only one generation at a time

## Troubleshooting

### ComfyUI not responding
- Check if port 8188 is available
- Verify model is in `ComfyUI/models/checkpoints/`
- Try `--normalvram` instead of `--lowvram` if you have headroom

### CogVideo timeout
- Reduce frame count (default: 8)
- Lower resolution to 240x240
- Check GPU memory usage

### Files not displaying
- Ensure `public/generated/` and `public/videos/` directories exist
- Check file permissions
- Verify API routes are working

## API Endpoints

- `POST /api/image` - Generate image
- `GET /api/image/status/:jobId` - Check image status
- `POST /api/video` - Generate video
- `GET /api/video/status/:jobId` - Check video status

