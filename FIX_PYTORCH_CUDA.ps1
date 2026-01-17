# Fix PyTorch CUDA Installation for ComfyUI
# This script fixes the "Torch not compiled with CUDA enabled" error

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fixing PyTorch CUDA Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ComfyUI directory exists
if (-not (Test-Path "ComfyUI")) {
    Write-Host "[ERROR] ComfyUI directory not found!" -ForegroundColor Red
    Write-Host "Please run setup-comfyui.ps1 first" -ForegroundColor Yellow
    exit 1
}

Set-Location ComfyUI

Write-Host "[1/3] Uninstalling old PyTorch..." -ForegroundColor Yellow
pip uninstall torch torchvision torchaudio -y

Write-Host "[2/3] Installing PyTorch with CUDA 13.0 support..." -ForegroundColor Yellow
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu130

Write-Host "[3/3] Verifying CUDA support..." -ForegroundColor Yellow
python -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}'); print(f'CUDA version: {torch.version.cuda if torch.cuda.is_available() else \"N/A\"}')"

Write-Host ""
Write-Host "✅ PyTorch CUDA fix complete!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now start ComfyUI with:" -ForegroundColor Cyan
Write-Host "  python main.py --port 8188 --lowvram" -ForegroundColor White

Set-Location ..

