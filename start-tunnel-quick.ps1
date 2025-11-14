# Quick Cloudflare Tunnel Starter
# This will show you the public URL

Write-Host "🌍 Starting Cloudflare Tunnel..." -ForegroundColor Cyan
Write-Host "This will expose your local Ollama server to the internet" -ForegroundColor Yellow
Write-Host ""

# Check if Ollama is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Ollama is running on port 11434" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Ollama might not be running on port 11434" -ForegroundColor Yellow
    Write-Host "   Make sure Ollama is running: ollama serve" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Starting tunnel..." -ForegroundColor Cyan
Write-Host "📋 COPY THE URL THAT APPEARS BELOW!" -ForegroundColor Yellow
Write-Host ""

# Start tunnel
.\cloudflared.exe tunnel --url http://localhost:11434

