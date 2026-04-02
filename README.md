# Kepler AI 🚀

> A **local-first, full-stack AI chat application** — combining real-time LLM conversations with on-device AI image and video generation, all in a sleek ChatGPT-like interface.

Kepler AI runs entirely on your own hardware. No cloud subscriptions. No data leaving your machine. Just a powerful, privacy-first AI assistant powered by **Ollama**, **ComfyUI**, and **Next.js 14**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **Real-time Streaming Chat** | Token-by-token streaming responses from local LLMs via Server-Sent Events (SSE) |
| 🎨 **AI Image Generation** | Text-to-image powered by ComfyUI + SD Turbo (Stable Diffusion) |
| 🎥 **AI Video Generation** | Text-to-video powered by ComfyUI + AnimateDiff |
| 🧠 **Intent Detection** | Auto-detects when you ask for images/videos — no special commands needed |
| 🔄 **Live Job Polling** | Non-blocking background generation with real-time status updates |
| 🌐 **Remote Access** | Cloudflare Tunnel support — share your local AI from anywhere |
| ☁️ **Vercel Deployable** | Frontend deploys to Vercel; backend exposed via tunnel or cloud GPU |
| 📱 **Fully Responsive** | Mobile-friendly chat UI with sidebar navigation |
| 🌙 **Dark Mode** | First-class dark mode support throughout the interface |
| ✍️ **Markdown + Code Highlighting** | Renders rich markdown with syntax-highlighted code blocks via Shiki |

---

## 🏗️ System Architecture

Kepler is built as a **microservice-style local stack**. The frontend never calls AI services directly — everything routes through the AI Gateway.

```
┌─────────────┐     SSE / REST     ┌──────────────────────────┐
│             │ ─────────────────► │   Next.js 14 Frontend    │
│    User     │                    │   (Vercel / localhost)   │
│  (Browser)  │ ◄───────────────── │   App Router + TypeScript│
└─────────────┘     Streamed UI    └──────────┬───────────────┘
                                              │ REST / SSE Proxy
                                              ▼
                                   ┌──────────────────────────┐
                                   │    AI Gateway (Python)   │
                                   │    FastAPI @ port 9000   │
                                   │  ┌──────────────────────┐│
                                   │  │ /chat  → Ollama      ││
                                   │  │ /image → ComfyUI     ││
                                   │  │ /video → ComfyUI     ││
                                   │  └──────────────────────┘│
                                   └────┬──────────┬───────────┘
                                        │          │
                           SSE Stream   │          │  HTTP + WebSocket
                                        ▼          ▼
                              ┌─────────────┐  ┌──────────────┐
                              │   Ollama    │  │   ComfyUI    │
                              │ qwen2.5 LLM │  │  SD Turbo /  │
                              │ port 11434  │  │  AnimateDiff │
                              └─────────────┘  │  port 8188   │
                                               └──────────────┘
```

### Service Map

| Service | Technology | Port | Purpose |
|---|---|---|---|
| **Frontend** | Next.js 14 (TypeScript) | `3000` | Chat UI, media rendering, polling |
| **AI Gateway** | FastAPI (Python) | `9000` | Central API proxy & job orchestrator |
| **LLM Engine** | Ollama (`qwen2.5`) | `11434` | Text generation & intent detection |
| **Image/Video Engine** | ComfyUI | `8188` | Stable Diffusion & AnimateDiff inference |

---

## 🛠️ Tech Stack

### Frontend
| Tech | Version | Purpose |
|---|---|---|
| **Next.js** | `^14.2` | App Router, SSR, API Routes |
| **React** | `^18.3` | UI component system |
| **TypeScript** | `^5.5` | Type-safe frontend |
| **Tailwind CSS** | `^3.4` | Utility-first styling |
| **Shadcn UI / Radix UI** | Latest | Accessible UI primitives |
| **Lucide React** | `^0.400` | Icon library |
| **react-markdown** | `^9.0` | Markdown rendering |
| **Shiki** | `^1.0` | Syntax highlighting for code blocks |
| **remark-gfm** | `^4.0` | GitHub Flavored Markdown support |

### Backend — AI Gateway
| Tech | Version | Purpose |
|---|---|---|
| **FastAPI** | `>=0.111` | Async Python web framework |
| **Uvicorn** | `>=0.30` | ASGI server |
| **httpx** | `>=0.27` | Async HTTP client for service calls |
| **Pydantic** | `>=2.7` | Request/response validation |

### Backend — Generation Service (Legacy Direct)
| Tech | Version | Purpose |
|---|---|---|
| **FastAPI** | `0.109.2` | Direct generation API |
| **Websockets** | `12.0` | ComfyUI WebSocket protocol |
| **websocket-client** | `1.7.0` | Synchronous WS connection |
| **Requests** | `2.31.0` | HTTP calls to Ollama |

### Local AI Services
| Service | Purpose |
|---|---|
| **Ollama** | Runs local LLMs — default model: `qwen2.5:latest` |
| **ComfyUI** | Node-graph AI inference engine |
| **SD Turbo** (`sd_turbo.safetensors`) | Fast Stable Diffusion model for image generation |
| **AnimateDiff** (`mm_sd_v15_v2.ckpt`) | Motion module for video/animation generation |

### Deployment
| Tool | Purpose |
|---|---|
| **Vercel** | Frontend deployment (serverless Next.js) |
| **Cloudflare Tunnel** | Expose local GPU services to the internet (free) |
| **Windows Batch Scripts** | One-click local startup orchestration |

---

## 📂 Project Structure

```
Kepler/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # Server-side API Routes (proxies to Gateway)
│   │   ├── chat/
│   │   │   └── route.ts          # SSE streaming proxy → Gateway /chat
│   │   ├── image/
│   │   │   ├── route.ts          # Trigger image generation → Gateway /image
│   │   │   └── status/[jobId]/
│   │   │       └── route.ts      # Poll image job status
│   │   ├── video/
│   │   │   ├── route.ts          # Trigger video generation → Gateway /video
│   │   │   └── status/[jobId]/
│   │   │       └── route.ts      # Poll video job status
│   │   └── generated/            # (Static generated media serving)
│   ├── chat/
│   │   └── page.tsx              # Main chat UI page
│   ├── globals.css               # Global styles + dark mode variables
│   └── layout.tsx                # Root layout
│
├── components/                   # Reusable React components
│   ├── ChatMessage.tsx           # Individual chat bubble (text/image/video)
│   ├── ChatList.tsx              # Scrollable message list
│   ├── ChatInput.tsx             # Text input with send button
│   ├── MediaDisplay.tsx          # Image/video render with loading state
│   ├── Sidebar.tsx               # Navigation sidebar
│   ├── CodeBlock.tsx             # Syntax-highlighted code block
│   └── ui/                       # Shadcn UI primitives
│
├── lib/                          # Core frontend utilities & clients
│   ├── llm.ts                    # SSE streaming client, message types
│   ├── generation.ts             # Intent parser, image/video trigger hooks
│   ├── job-store.ts              # In-memory job tracking (client side)
│   ├── comfyui.ts                # ComfyUI workflow definitions & API
│   ├── cogvideo.ts               # CogVideo workflow integration
│   └── system_prompt.ts          # System prompt configuration
│
├── gateway/                      # AI Gateway — FastAPI microservice
│   ├── main.py                   # FastAPI app, route registration (port 9000)
│   ├── utils.py                  # Job store, health checks
│   ├── requirements.txt          # Python dependencies
│   ├── routes/
│   │   ├── chat.py               # POST /chat — SSE proxy to Ollama
│   │   ├── image.py              # POST /image + GET /image/status/{jobId}
│   │   └── video.py              # POST /video + GET /video/status/{jobId}
│   └── services/
│       ├── ollama_service.py     # Async SSE streaming from Ollama
│       ├── comfy_service.py      # ComfyUI job trigger, poll, base64 fetch
│       └── routing_service.py    # Optional intent-based routing logic
│
├── backend/                      # Legacy direct backend (FastAPI, port 8000)
│   ├── main.py                   # Synchronous image/video generation endpoints
│   ├── utils.py                  # WebSocket connection to ComfyUI
│   ├── requirements.txt          # Python dependencies
│   └── start_services.py         # Service manager
│
├── ComfyUI/                      # Local ComfyUI installation (git submodule / clone)
│
├── docs/                         # Documentation assets
│
├── START_ALL_SERVICES.bat        # 🚀 One-click: starts all 4 services
├── START_GATEWAY.bat             # Starts the AI Gateway only
├── START_GENERATION_SERVICES.bat # Starts ComfyUI (and optionally backend)
├── START_TUNNEL.bat              # Starts Cloudflare Tunnel for remote access
│
├── .env.local                    # Local environment configuration
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind theme config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Node.js dependencies
```

---

## ⚙️ How It Works

### 🗨️ Text Chat Flow

1. User types a message in `ChatInput.tsx`
2. `lib/generation.ts::parseGenerationCommand()` checks if it's an image/video request
3. If it's plain text → `lib/llm.ts::streamLLMResponse()` POSTs to `/api/chat`
4. Next.js API route proxies the request to the **AI Gateway** (`http://127.0.0.1:9000/chat`)
5. Gateway streams the response from **Ollama** as Server-Sent Events (SSE)
6. Frontend decodes the token stream and progressively updates the message bubble
7. If the LLM's response itself contains an image/video intent, generation is auto-triggered

### 🎨 Image / Video Generation Flow

```
User: "generate an image of a sunset"
        │
        ▼
parseGenerationCommand() → { type: 'image', prompt: 'a sunset' }
        │
        ▼
POST /api/image  →  Gateway POST /image
        │               │
        │               ▼
        │       trigger_image_job()
        │           - Builds SD Turbo ComfyUI workflow JSON
        │           - POST to ComfyUI /prompt
        │           - Returns { job_id }
        │           - Starts background async poll_comfyui()
        │
        ▼
Frontend gets { jobId }
Adds "Generating image..." placeholder message (MediaDisplay.tsx)
        │
        ▼  every 2 seconds
GET /api/image/status/[jobId]  →  Gateway GET /image/status/{jobId}
        │
        ▼ (when completed)
ComfyUI output fetched as raw bytes
        → base64 encoded Data URL (data:image/png;base64,...)
        → stored in job store
        │
        ▼
Frontend replaces placeholder with <img> rendered from base64 data URL
```

The base64 Data URL approach ensures **cross-origin compatibility** — works both locally and when the gateway is behind a Cloudflare tunnel.

---

## 🔧 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **[Ollama](https://ollama.ai)** installed and running
- **Ollama model** pulled (default: `qwen2.5`)
  ```bash
  ollama pull qwen2.5
  ```
- **[ComfyUI](https://github.com/comfyanonymous/ComfyUI)** installed in `./ComfyUI`
- **ComfyUI models** placed in `ComfyUI/models/`:
  - `checkpoints/sd_turbo.safetensors` — for image generation
  - `animatediff_models/mm_sd_v15_v2.ckpt` — for video generation

---

## 🚀 Setup & Running

### 1. Install Node.js dependencies

```bash
npm install
```

### 2. Install Gateway dependencies

```bash
cd gateway
pip install -r requirements.txt
cd ..
```

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
# Local development defaults
AI_GATEWAY_URL=http://127.0.0.1:9000
LOCAL_LLM_URL=http://127.0.0.1:11434
COMFYUI_URL=http://127.0.0.1:8188

# For Vercel + Cloudflare Tunnel (production):
# AI_GATEWAY_URL=https://your-tunnel-id.trycloudflare.com
```

### 4. Start all services

**Option A — One-click (Recommended for Windows):**
```bat
START_ALL_SERVICES.bat
```
This script automatically:
1. Checks if Ollama is running (starts it if not)
2. Starts image & video generation services (ComfyUI)
3. Starts the AI Gateway (port 9000)
4. Starts Next.js dev server (port 3000)

**Option B — Manual startup:**
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start ComfyUI
cd ComfyUI && python main.py

# Terminal 3: Start AI Gateway
cd gateway && uvicorn main:app --host 0.0.0.0 --port 9000 --reload

# Terminal 4: Start Next.js
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deployment

### Option 1: Vercel + Cloudflare Tunnel *(Free — Recommended)*

This is the recommended approach if you want to access Kepler from anywhere while keeping **all AI inference on your local GPU**.

**Architecture:**
```
Browser → Vercel (Next.js frontend) → Cloudflare Tunnel → Your Local Machine (Gateway + Ollama + ComfyUI)
```

**Steps:**

**Step 1:** Install `cloudflared`
```bat
winget install --id Cloudflare.cloudflared
```

**Step 2:** Start your local services
```bat
START_ALL_SERVICES.bat
```

**Step 3:** Start the Cloudflare Tunnel (exposes Gateway port 9000)
```bat
START_TUNNEL.bat
```
Copy the generated URL (e.g., `https://xxxx.trycloudflare.com`).

**Step 4:** Deploy the frontend to Vercel
```bash
npx vercel --prod
```

**Step 5:** Set environment variable on Vercel
In your Vercel dashboard → Project Settings → Environment Variables:
```
AI_GATEWAY_URL = https://xxxx.trycloudflare.com
```

**Notes:**
- The Cloudflare Tunnel URL changes each time you restart `START_TUNNEL.bat`. For a permanent URL, use a named tunnel with a `cloudflared` config file.
- All inference stays on your hardware — Vercel only serves the UI
- Free tier on both Vercel and Cloudflare works perfectly for personal use

---

### Option 2: Cloud GPU *(Production / Always-On)*

For 24/7 availability without keeping your local machine running:

1. Spin up a GPU instance (e.g., **RunPod**, **Vast.ai**, **Lambda Labs**, **AWS g4dn**)
2. Install Ollama + ComfyUI + the Gateway on the cloud instance
3. Set `AI_GATEWAY_URL` in Vercel to point to your cloud instance's public IP/domain
4. (Optional) Put NGINX in front of the Gateway as a reverse proxy with SSL

---

## 🎛️ Customization

### Change the LLM Model

Edit `gateway/services/ollama_service.py`:
```python
"model": "llama3.2",  # or mistral, gemma2, phi4, etc.
```
Then pull the model:
```bash
ollama pull llama3.2
```

### Change Image Resolution

The default is 512×512 (optimized for SD Turbo speed). Edit `gateway/services/comfy_service.py`:
```python
def create_image_workflow(prompt: str, width: int = 768, height: int = 768):
```

### Change the Image Model

In `comfy_service.py`, update the checkpoint name:
```python
"4": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "your_model.safetensors"}},
```
Place the model in `ComfyUI/models/checkpoints/`.

### Add a System Prompt

Edit `lib/system_prompt.ts` to give the AI a persona or set of instructions.

### Theming

Modify `app/globals.css` for CSS custom properties and `tailwind.config.js` for the design token system.

---

## 🔑 Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `AI_GATEWAY_URL` | `http://127.0.0.1:9000` | URL of the AI Gateway service |
| `LOCAL_LLM_URL` | `http://127.0.0.1:11434` | Ollama API base URL |
| `COMFYUI_URL` | `http://127.0.0.1:8188` | ComfyUI server URL |

---

## 🗺️ Roadmap

- [ ] Persistent chat history (local SQLite or IndexedDB)
- [ ] Multiple model selection UI
- [ ] Image-to-image and inpainting support
- [ ] File/document upload for RAG-style Q&A
- [ ] Named Cloudflare Tunnel for a persistent public URL
- [ ] Docker Compose setup for one-command deployment

---

## 📋 License

MIT — Do whatever you want. Ship it, fork it, hack it.

---

*Built with ❤️ using Ollama, ComfyUI, Next.js, and FastAPI.*
