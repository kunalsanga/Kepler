# Setup Permanent Cloudflare Tunnel for Ollama
# This creates a NAMED tunnel that never expires (unlike temporary --url tunnels)

Write-Host "🚀 Setting up PERMANENT Cloudflare Tunnel for Ollama" -ForegroundColor Green
Write-Host ""

# Step 1: Check if cloudflared is installed
Write-Host "Step 1: Checking cloudflared installation..." -ForegroundColor Yellow
try {
    $cloudflaredVersion = cloudflared --version 2>&1
    Write-Host "✅ cloudflared is installed: $cloudflaredVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ cloudflared is not installed!" -ForegroundColor Red
    Write-Host "Install it with: winget install cloudflare.cloudflared" -ForegroundColor Yellow
    exit 1
}

# Step 2: Login to Cloudflare (if not already)
Write-Host ""
Write-Host "Step 2: Checking Cloudflare authentication..." -ForegroundColor Yellow
$cloudflaredPath = "$env:USERPROFILE\.cloudflared"
if (-not (Test-Path "$cloudflaredPath\cert.pem")) {
    Write-Host "⚠️  Not logged in. Running cloudflared login..." -ForegroundColor Yellow
    cloudflared tunnel login
} else {
    Write-Host "✅ Already authenticated with Cloudflare" -ForegroundColor Green
}

# Step 3: Get tunnel name
Write-Host ""
$tunnelName = Read-Host "Enter a name for your tunnel (e.g., my-llm, kunal-ollama, qwen-bot)"
if ([string]::IsNullOrWhiteSpace($tunnelName)) {
    $tunnelName = "my-llm"
    Write-Host "Using default name: $tunnelName" -ForegroundColor Yellow
}

# Step 4: Check if tunnel already exists
Write-Host ""
Write-Host "Step 3: Creating named tunnel '$tunnelName'..." -ForegroundColor Yellow
$tunnelExists = cloudflared tunnel list 2>&1 | Select-String $tunnelName
if ($tunnelExists) {
    Write-Host "⚠️  Tunnel '$tunnelName' already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to use it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Exiting. Please choose a different name." -ForegroundColor Red
        exit 1
    }
} else {
    cloudflared tunnel create $tunnelName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create tunnel!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Tunnel '$tunnelName' created successfully!" -ForegroundColor Green
}

# Step 5: Get subdomain
Write-Host ""
$subdomain = Read-Host "Enter your desired subdomain (e.g., myai-bot, kunal-llm, qwen-bot)"
if ([string]::IsNullOrWhiteSpace($subdomain)) {
    $subdomain = "myai-bot"
    Write-Host "Using default subdomain: $subdomain" -ForegroundColor Yellow
}

# Step 6: Create config directory
Write-Host ""
Write-Host "Step 4: Creating config file..." -ForegroundColor Yellow
$configDir = "$env:USERPROFILE\.cloudflared"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

# Step 7: Create config.yml
$configPath = "$configDir\config.yml"
$credentialsFile = "$configDir\$tunnelName.json"

$configContent = @"
tunnel: $tunnelName
credentials-file: $credentialsFile

ingress:
  - hostname: $subdomain.trycloudflare.com
    service: http://localhost:11434
  - service: http_status:404
"@

Set-Content -Path $configPath -Value $configContent
Write-Host "✅ Config file created at: $configPath" -ForegroundColor Green

# Step 8: Display instructions
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ PERMANENT TUNNEL SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start the tunnel:" -ForegroundColor White
Write-Host "   cloudflared tunnel run $tunnelName" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Your PERMANENT URL will be:" -ForegroundColor White
Write-Host "   https://$subdomain.trycloudflare.com" -ForegroundColor Green
Write-Host ""
Write-Host "3. Test it:" -ForegroundColor White
Write-Host "   curl https://$subdomain.trycloudflare.com/api/tags" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Update Vercel:" -ForegroundColor White
Write-Host "   - Go to Vercel Dashboard → Settings → Environment Variables" -ForegroundColor Cyan
Write-Host "   - Set LLM_API_URL = https://$subdomain.trycloudflare.com" -ForegroundColor Cyan
Write-Host "   - Redeploy your project" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Keep the tunnel running!" -ForegroundColor Yellow
Write-Host "   The tunnel must stay running for Vercel to access your Ollama." -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 To run tunnel in background:" -ForegroundColor White
Write-Host "   Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cloudflared tunnel run $tunnelName'" -ForegroundColor Cyan
Write-Host ""

