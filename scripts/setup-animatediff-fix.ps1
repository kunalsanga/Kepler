# Robust setup script for AnimateDiff using relative paths
Write-Host "Setting up AnimateDiff for ComfyUI (Robust Mode)..." -ForegroundColor Cyan

# Ensure we are in the project root
$ScriptPath = $PSScriptRoot
$ProjectRoot = Split-Path $ScriptPath -Parent
Set-Location $ProjectRoot

Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray

$ComfyPath = "ComfyUI"
$CustomNodesPath = "$ComfyPath\custom_nodes"

# Verify ComfyUI exists
if (-not (Test-Path $ComfyPath)) {
    Write-Host "Error: ComfyUI folder not found in current directory!" -ForegroundColor Red
    exit 1
}

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
    
    # Try to install requirements
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
    New-Item -ItemType Directory -Force -Path $ModelPath | Out-Null
}

$ModelFile = "$ModelPath\mm_sd_v15_v2.ckpt"
if (-not (Test-Path $ModelFile)) {
    Write-Host "Downloading mm_sd_v15_v2.ckpt (Motion Model)..." -ForegroundColor Yellow
    
    # Use curl as fallback if Invoke-WebRequest fails with path issues
    try {
        Invoke-WebRequest -Uri "https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v15_v2.ckpt" -OutFile $ModelFile
    } catch {
        Write-Host "PowerShell download failed, trying curl..." -ForegroundColor Yellow
        curl -L -o "$ModelFile" "https://huggingface.co/guoyww/animatediff/resolve/main/mm_sd_v15_v2.ckpt"
    }
    
    if (Test-Path $ModelFile) {
        Write-Host "Model downloaded." -ForegroundColor Green
    } else {
        Write-Host "Failed to download model!" -ForegroundColor Red
    }
} else {
    Write-Host "Motion model already exists." -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ AnimateDiff setup complete!" -ForegroundColor Green
Write-Host "⚠️  PLEASE RESTART 'START_GENERATION_SERVICES.bat' NOW!" -ForegroundColor Red
