# Fix: "Image generation failed" Error

## Problem
You're seeing "Image generation failed" when trying to generate images. This means ComfyUI is not running.

## Quick Fix

**Run this command:**
```batch
START_GENERATION_SERVICES.bat
```

This will start:
- ✅ ComfyUI on port 8188 (for images)
- ✅ CogVideo on port 7860 (for videos)

**Keep the terminal windows open!**

## Verify It's Working

After running `START_GENERATION_SERVICES.bat`, you should see:
1. A new terminal window for ComfyUI
2. A new terminal window for CogVideo
3. Both showing they're running on their respective ports

## Test Again

Once services are running, try again:
- "can you create an image of red flowers"
- `/image red flowers`

## If You Don't Have ComfyUI Set Up Yet

1. **Setup ComfyUI:**
   ```powershell
   .\scripts\setup-comfyui.ps1
   ```

2. **Download a model:**
   - Go to `ComfyUI/models/checkpoints/`
   - Download a model like `sd-turbo.safetensors`

3. **Then run:**
   ```batch
   START_GENERATION_SERVICES.bat
   ```

## Error Messages Now

The system now shows helpful error messages:
- ✅ "ComfyUI is not running. Please start it by running START_GENERATION_SERVICES.bat"
- ✅ Tips on how to fix the issue

## Still Having Issues?

1. Check if ports are in use:
   - Port 8188 (ComfyUI)
   - Port 7860 (CogVideo)

2. Check ComfyUI terminal for errors

3. Verify ComfyUI directory exists:
   ```batch
   dir ComfyUI
   ```

4. Test ComfyUI directly:
   ```bash
   curl http://localhost:8188/system_stats
   ```

