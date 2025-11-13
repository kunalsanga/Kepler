# Cloudflare Tunnel Setup Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "🌍 Cloudflare Tunnel Setup Script" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Please run PowerShell as Administrator" -ForegroundColor Yellow
    Write-Host "Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    exit 1
}

# Step 1: Check if cloudflared is installed
Write-Host "1️⃣ Checking cloudflared installation..." -ForegroundColor Green
try {
    $version = cloudflared --version 2>&1
    Write-Host "   ✅ cloudflared is installed: $version" -ForegroundColor Green
} catch {
    Write-Host "   ❌ cloudflared not found. Installing..." -ForegroundColor Red
    
    # Try winget first
    Write-Host "   📦 Trying winget..." -ForegroundColor Yellow
    try {
        winget install cloudflare.cloudflared --accept-package-agreements --accept-source-agreements
        Write-Host "   ✅ Installed via winget" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  winget failed. Trying Chocolatey..." -ForegroundColor Yellow
        try {
            choco install cloudflared -y
            Write-Host "   ✅ Installed via Chocolatey" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Automatic installation failed." -ForegroundColor Red
            Write-Host "   Please install manually:" -ForegroundColor Yellow
            Write-Host "   1. Download from: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
            Write-Host "   2. Extract cloudflared.exe" -ForegroundColor Yellow
            Write-Host "   3. Add to PATH or use full path" -ForegroundColor Yellow
            exit 1
        }
    }
}

# Step 2: Check Ollama
Write-Host ""
Write-Host "2️⃣ Checking Ollama..." -ForegroundColor Green
try {
    $ollamaTest = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Ollama is running on port 11434" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Ollama not responding on port 11434" -ForegroundColor Yellow
    Write-Host "   Please ensure Ollama is running:" -ForegroundColor Yellow
    Write-Host "   - Run: ollama serve" -ForegroundColor Yellow
    Write-Host "   - Or check if Ollama service is running" -ForegroundColor Yellow
    $continue = Read-Host "   Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Step 3: Authenticate
Write-Host ""
Write-Host "3️⃣ Authenticating with Cloudflare..." -ForegroundColor Green
Write-Host "   This will open your browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
cloudflared tunnel login
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Authentication successful" -ForegroundColor Green
} else {
    Write-Host "   ❌ Authentication failed" -ForegroundColor Red
    exit 1
}

# Step 4: Create tunnel
Write-Host ""
Write-Host "4️⃣ Creating tunnel..." -ForegroundColor Green
$tunnelName = Read-Host "   Enter tunnel name (default: my-llm)"
if ([string]::IsNullOrWhiteSpace($tunnelName)) {
    $tunnelName = "my-llm"
}

cloudflared tunnel create $tunnelName
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Tunnel '$tunnelName' created successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ Tunnel creation failed" -ForegroundColor Red
    exit 1
}

# Step 5: Create config file
Write-Host ""
Write-Host "5️⃣ Creating configuration file..." -ForegroundColor Green
$configPath = Join-Path $PSScriptRoot "..\cloudflared.yml"
$userProfile = $env:USERPROFILE
$credentialsPath = Join-Path $userProfile ".cloudflared"

# Find the credentials file
$credFiles = Get-ChildItem -Path $credentialsPath -Filter "*.json" -ErrorAction SilentlyContinue
if ($credFiles.Count -eq 0) {
    Write-Host "   ⚠️  Could not find credentials file automatically" -ForegroundColor Yellow
    Write-Host "   Please find it in: $credentialsPath" -ForegroundColor Yellow
    $credFile = Read-Host "   Enter full path to credentials file"
} else {
    $credFile = $credFiles[0].FullName
    Write-Host "   ✅ Found credentials file: $credFile" -ForegroundColor Green
}

# Create config
$configContent = @"
tunnel: $tunnelName
credentials-file: $credFile

ingress:
  - service: http://localhost:11434
"@

$configContent | Out-File -FilePath $configPath -Encoding UTF8
Write-Host "   ✅ Configuration saved to: $configPath" -ForegroundColor Green

# Step 6: Test tunnel
Write-Host ""
Write-Host "6️⃣ Testing tunnel (quick mode)..." -ForegroundColor Green
Write-Host "   Starting temporary tunnel..." -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop and continue setup" -ForegroundColor Yellow
Write-Host ""

$job = Start-Job -ScriptBlock {
    param($tunnelName)
    cloudflared tunnel run $tunnelName --url http://localhost:11434
} -ArgumentList $tunnelName

Start-Sleep -Seconds 5

# Check if job is running
if ($job.State -eq "Running") {
    Write-Host "   ✅ Tunnel is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Check the tunnel output above for the public URL" -ForegroundColor White
    Write-Host "2. Copy the URL (looks like: https://llm-xxxxx.trycloudflare.com)" -ForegroundColor White
    Write-Host "3. Add it to Vercel environment variables as LLM_API_URL" -ForegroundColor White
    Write-Host "4. For permanent setup, use: cloudflared tunnel run $tunnelName" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Enter to stop the test tunnel and continue..." -ForegroundColor Yellow
    Read-Host
    Stop-Job $job
    Remove-Job $job
} else {
    Write-Host "   ⚠️  Tunnel may have issues. Check output above." -ForegroundColor Yellow
}

# Step 7: Service setup (optional)
Write-Host ""
Write-Host "7️⃣ Set up as Windows Service? (Recommended for 24/7 operation)" -ForegroundColor Green
$setupService = Read-Host "   Install as service? (y/n)"
if ($setupService -eq "y") {
    Write-Host "   📝 Installing service..." -ForegroundColor Yellow
    
    # Create service config
    $serviceConfig = @"
tunnel: $tunnelName
credentials-file: $credFile

ingress:
  - service: http://localhost:11434
"@
    
    $serviceConfigPath = Join-Path $env:ProgramData "cloudflared\config.yml"
    New-Item -ItemType Directory -Path (Split-Path $serviceConfigPath) -Force | Out-Null
    $serviceConfig | Out-File -FilePath $serviceConfigPath -Encoding UTF8
    
    cloudflared service install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Service installed successfully" -ForegroundColor Green
        Write-Host "   Start service with: net start cloudflared" -ForegroundColor Yellow
        Write-Host "   Or use Services app (services.msc)" -ForegroundColor Yellow
    } else {
        Write-Host "   ⚠️  Service installation had issues" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   Tunnel Name: $tunnelName" -ForegroundColor White
Write-Host "   Config File: $configPath" -ForegroundColor White
Write-Host "   Credentials: $credFile" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To start tunnel:" -ForegroundColor Cyan
Write-Host "   cloudflared tunnel run $tunnelName" -ForegroundColor White
Write-Host ""
Write-Host "📚 See DEPLOYMENT_CLOUDFLARE.md for full instructions" -ForegroundColor Yellow

