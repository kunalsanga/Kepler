# PowerShell setup script for CogVideo

Write-Host "Setting up CogVideo for Kepler AI..." -ForegroundColor Cyan

# Check if CogVideo directory exists
if (-not (Test-Path "CogVideo")) {
    Write-Host "Cloning CogVideo repository..." -ForegroundColor Yellow
    git clone https://github.com/THUDM/CogVideo.git
    Set-Location CogVideo
} else {
    Write-Host "CogVideo directory exists, updating..." -ForegroundColor Yellow
    Set-Location CogVideo
    git pull
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host ""
Write-Host "✅ CogVideo setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Download the cogvideo2-2b model"
Write-Host "2. Start CogVideo API with: python -m cogvideo.cli.api --port 7860 --low-resource-mode"
Write-Host "3. Set COGVIDEO_URL=http://localhost:7860 in your .env.local"

