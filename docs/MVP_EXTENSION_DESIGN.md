# Kepler AI MVP Extension: Image + Video Generation

## 1. High-Level Architecture

```
┌─────────────────┐
│  Next.js Frontend │
│  (React/TypeScript)│
└────────┬──────────┘
         │ HTTP
         │
┌────────▼─────────────────────────────────────┐
│  Next.js API Routes (app/api/)               │
│  ├─ /api/chat        → Ollama (existing)     │
│  ├─ /api/image       → ComfyUI               │
│  └─ /api/video       → CogVideo              │
└────────┬─────────────────────────────────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
┌───▼───┐ ┌──▼──────┐  ┌────▼──────┐  ┌───▼────┐
│ Ollama│ │ ComfyUI │  │ CogVideo  │  │ Storage│
│:11434 │ │ :8188   │  │ :7860     │  │ /tmp   │
└───────┘ └─────────┘  └───────────┘  └────────┘
```

**Services:**
- Ollama: Qwen-2.5 (existing, port 11434)
- ComfyUI: Stable Diffusion (new, port 8188)
- CogVideo: Video generation (new, port 7860)
- Next.js: Orchestrates all services

---

## 2. Image Generation Setup (ComfyUI)

**Install:**
```bash
git clone https://github.com/comfyanonymous/ComfyUI
cd ComfyUI
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
pip install -r requirements.txt
```

**Model:**
- Use `sd-turbo` or `sd-xl-turbo` (smaller, faster)
- Download to `ComfyUI/models/checkpoints/`

**VRAM Settings:**
- `--lowvram` flag
- `--normalvram` if 6GB allows
- Resolution: 512x512 max (768x768 if VRAM allows)

**Start:**
```bash
python main.py --port 8188 --lowvram
```

**API Endpoint:** `http://localhost:8188/prompt`

---

## 3. Video Generation Setup (CogVideo)

**Install:**
```bash
git clone https://github.com/THUDM/CogVideo
cd CogVideo
pip install -r requirements.txt
```

**Low-VRAM Mode:**
- Use `cogvideo2-2b` (2B params, ~4GB VRAM)
- Enable `--low-resource-mode`
- Frame count: 4-8 frames max
- Resolution: 256x256 or 320x240

**Start:**
```bash
python -m cogvideo.cli.api --port 7860 --low-resource-mode
```

**Limits:**
- Max 8 frames per video
- 256x256 resolution
- ~30-60s generation time
- Sequential processing (no batch)

**API Endpoint:** `http://localhost:7860/generate`

---

## 4. Backend API Outline

**Routes (app/api/):**

```
POST /api/image
  Body: { prompt: string, width?: number, height?: number }
  Returns: { imageUrl: string, jobId: string }
  Proxy → ComfyUI /prompt

GET /api/image/status/:jobId
  Returns: { status: 'pending'|'completed'|'failed', imageUrl?: string }
  Poll ComfyUI queue

POST /api/video
  Body: { prompt: string, frames?: number }
  Returns: { videoUrl: string, jobId: string }
  Proxy → CogVideo /generate

GET /api/video/status/:jobId
  Returns: { status: 'pending'|'completed'|'failed', videoUrl?: string }
  Poll CogVideo status
```

**Storage:**
- Save outputs to `public/generated/` (images) and `public/videos/` (videos)
- Cleanup old files (>24h) via cron or on-demand

---

## 5. End-to-End Flow Example

**User Request:** "Generate a video of a cat playing piano"

**Flow:**
1. User sends message → `/api/chat`
2. Qwen-2.5 responds: "I'll create an image first, then animate it"
3. Frontend calls `/api/image` with prompt: "cat playing piano"
4. ComfyUI generates image → saved to `public/generated/img_123.png`
5. Frontend displays image
6. Frontend calls `/api/video` with same prompt
7. CogVideo generates 8-frame video → saved to `public/videos/vid_123.mp4`
8. Frontend displays video player

**Timeline:**
- Image: ~5-10s
- Video: ~30-60s
- Total: ~40-70s

**Error Handling:**
- If ComfyUI fails → return error, skip video
- If CogVideo fails → show image only
- Queue management: one job per service at a time (MVP)

---

**END OF DESIGN**

