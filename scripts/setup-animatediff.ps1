# Setup script for AnimateDiff in ComfyUI
Write-Host "Setting up AnimateDiff for ComfyUI..." -ForegroundColor Cyan

$ComfyPath = "c:\Users\kunal sanga\OneDrive\文档\Kepler\ComfyUI"
$CustomNodesPath = "$ComfyPath\custom_nodes"

# 1. Install ComfyUI-AnimateDiff-Evolved
if (-not (Test-Path "$CustomNodesPath\ComfyUI-AnimateDiff-Evolved")) {
    Write-Host "Cloning ComfyUI-AnimateDiff-Evolved..." -ForegroundColor Yellow
    git clone https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved.git "$CustomNodesPath\ComfyUI-AnimateDiff-Evolved"
} else {
    Write-Host "ComfyUI-AnimateDiff-Evolved already installed." -ForegroundColor Green
}

# 2. Install ComfyUI-VideoHelperSuite
if (-not (Test-Path "$CustomNodesPath\ComfyUI-VideoHelperSuite")) {
    Write-Host "Cloning ComfyUI-VideoHelperSuite..." -ForegroundColor Yellow
    git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git "$CustomNodesPath\ComfyUI-VideoHelperSuite"
    
    # Try to install requirements if pip is available
    if (Test-Path "$CustomNodesPath\ComfyUI-VideoHelperSuite\requirements.txt") {
        Write-Host "Installing requirements for VHS..." -ForegroundColor Yellow
        pip install -r "$CustomNodesPath\ComfyUI-VideoHelperSuite\requirements.txt"
    }
} else {
    Write-Host "ComfyUI-VideoHelperSuite already installed." -ForegroundColor Green
}

# 3. Download Motion Model
$ModelPath = "$CustomNodesPath\ComfyUI-AnimateDiff-Evolved\models"
if (-not (Test-Path $ModelPath)) {
    New-Item -ItemType Directory -Force -Path $ModelPath
}

$ModelFile = "$ModelPath\mm_sd_v15_v2.ckpt"
if (-not (Test-Path $ModelFile)) {
    Write-Host "Downloading mm_sd_v15_v2.ckpt (Motion Model)..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v15_v2.ckpt" -OutFile $ModelFile
    Write-Host "Model downloaded." -ForegroundColor Green
} else {
    Write-Host "Motion model already exists." -ForegroundColor Green
}

# 4. Install ComfyUI Manager (Optional but good)
if (-not (Test-Path "$CustomNodesPath\ComfyUI-Manager")) {
    Write-Host "Cloning ComfyUI-Manager..." -ForegroundColor Yellow
    git clone https://github.com/ltdrdata/ComfyUI-Manager.git "$CustomNodesPath\ComfyUI-Manager"
}

Write-Host ""
Write-Host "✅ AnimateDiff setup complete!" -ForegroundColor Green
Write-Host "⚠️  IMPORTANT: Please CLOSE and RESTART 'START_GENERATION_SERVICES.bat' to load the new nodes!" -ForegroundColor Red
