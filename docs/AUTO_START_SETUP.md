# Automatic Backend Service Setup

## Overview

The project now automatically starts ComfyUI and CogVideo services when needed. You have two options:

## Option 1: Manual Start (Recommended for First Time)

Run the batch script to start generation services:

```batch
START_GENERATION_SERVICES.bat
```

This will:
- Start ComfyUI on port 8188
- Start CogVideo on port 7860
- Open separate windows for each service

## Option 2: Automatic Start via Python Service Manager

Use the Python service manager to automatically start and manage services:

```bash
cd backend
python service_manager.py
```

This will:
- Automatically detect and start ComfyUI
- Automatically detect and start CogVideo
- Monitor services and restart if they crash
- Handle graceful shutdown on Ctrl+C

## Natural Language Detection

The system now automatically detects when users ask for image/video generation using natural language:

**Examples that work:**
- "can you generate image?"
- "can you create a video?"
- "generate image of a cat"
- "create video of sunset"
- "make an image"
- "draw a picture"

**Explicit commands still work:**
- `/image a cat playing piano`
- `/video a sunset`
- `generate image: a dog`

## How It Works

1. **User asks**: "can you generate image?"
2. **LLM responds**: Positively acknowledges the request
3. **System detects**: Natural language request in the conversation
4. **Generation starts**: Automatically triggers image/video generation
5. **Result displays**: Image/video appears in chat

## Setup Checklist

1. ✅ Run setup scripts:
   - `.\scripts\setup-comfyui.ps1`
   - `.\scripts\setup-cogvideo.ps1`

2. ✅ Download models:
   - ComfyUI: Place model in `ComfyUI/models/checkpoints/`
   - CogVideo: Download cogvideo2-2b model

3. ✅ Start services:
   - Run `START_GENERATION_SERVICES.bat` OR
   - Run `python backend/service_manager.py`

4. ✅ Start Next.js:
   ```bash
   npm run dev
   ```

5. ✅ Test:
   - Ask: "can you generate an image?"
   - Ask: "create a video of a sunset"

## Troubleshooting

**Services not starting:**
- Check if ComfyUI and CogVideo directories exist
- Verify Python is installed and in PATH
- Check if ports 8188 and 7860 are available

**Generation not working:**
- Verify services are running (check terminal windows)
- Test services directly:
  - ComfyUI: `curl http://localhost:8188/system_stats`
  - CogVideo: Check if port 7860 is listening

**Natural language not detected:**
- Try explicit commands: `/image [prompt]` or `/video [prompt]`
- Check browser console for errors
- Verify API routes are working

