# PowerShell setup script for ComfyUI

Write-Host "Setting up ComfyUI for Kepler AI..." -ForegroundColor Cyan

# Check if ComfyUI directory exists
if (-not (Test-Path "ComfyUI")) {
    Write-Host "Cloning ComfyUI repository..." -ForegroundColor Yellow
    git clone https://github.com/comfyanonymous/ComfyUI.git
    Set-Location ComfyUI
} else {
    Write-Host "ComfyUI directory exists, updating..." -ForegroundColor Yellow
    Set-Location ComfyUI
    git pull
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "Installing PyTorch with CUDA support..." -ForegroundColor Yellow
pip uninstall torch torchvision torchaudio -y
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu130
Write-Host "Installing ComfyUI requirements..." -ForegroundColor Yellow
pip install -r requirements.txt

# Create models directory if it doesn't exist
if (-not (Test-Path "models\checkpoints")) {
    New-Item -ItemType Directory -Path "models\checkpoints" -Force | Out-Null
}

Write-Host ""
Write-Host "✅ ComfyUI setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Download a model (e.g., sd-turbo) to ComfyUI\models\checkpoints\"
Write-Host "2. Start ComfyUI with: python main.py --port 8188 --lowvram"
Write-Host "3. Set COMFYUI_URL=http://localhost:8188 in your .env.local"

