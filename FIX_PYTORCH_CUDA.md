# Fix: "Torch not compiled with CUDA enabled" Error

## Problem
ComfyUI is crashing with:
```
AssertionError: Torch not compiled with CUDA enabled
```

This means PyTorch was installed without CUDA support, but you need it for your NVIDIA GPU.

## Quick Fix

**Run this PowerShell script:**
```powershell
.\FIX_PYTORCH_CUDA.ps1
```

This will:
1. ✅ Uninstall the CPU-only PyTorch
2. ✅ Install PyTorch with CUDA 13.0 support
3. ✅ Verify CUDA is working

## Manual Fix

If the script doesn't work, do it manually:

1. **Navigate to ComfyUI:**
   ```powershell
   cd ComfyUI
   ```

2. **Uninstall old PyTorch:**
   ```powershell
   pip uninstall torch torchvision torchaudio -y
   ```

3. **Install CUDA-enabled PyTorch:**
   ```powershell
   pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu130
   ```

4. **Verify it works:**
   ```powershell
   python -c "import torch; print('CUDA available:', torch.cuda.is_available())"
   ```
   
   Should output: `CUDA available: True`

## After Fixing

1. **Start ComfyUI:**
   ```powershell
   cd ComfyUI
   python main.py --port 8188 --lowvram
   ```

2. **Or use the batch script:**
   ```batch
   START_GENERATION_SERVICES.bat
   ```

3. **Test image generation again** in your chat!

## Why This Happened

The setup script used `--index-url` instead of `--extra-index-url`, which can cause pip to install the CPU-only version. The fix script uses the correct method to ensure CUDA support.

## Still Having Issues?

- Check your CUDA version: `nvidia-smi`
- Make sure you have CUDA 12.0+ installed
- Try CUDA 12.1 if 13.0 doesn't work:
  ```powershell
  pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu121
  ```

