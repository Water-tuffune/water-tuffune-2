param(
  [switch]$Docker,
  [switch]$Help
)

if ($Help) {
  Write-Host "Water Tuffune - Deployment Script"
  Write-Host ""
  Write-Host "Usage: .\deploy.ps1 [options]"
  Write-Host ""
  Write-Host "Options:"
  Write-Host "  -Docker    Build and deploy using Docker"
  Write-Host "  -Help      Show this help message"
  Write-Host ""
  Write-Host "Without options, deploys directly using Node.js."
  exit 0
}

if ($Docker) {
  Write-Host "==> Building Docker image..." -ForegroundColor Cyan
  docker-compose build

  Write-Host "==> Starting container..." -ForegroundColor Cyan
  docker-compose up -d

  Write-Host "==> App running at http://localhost:5000" -ForegroundColor Green
  exit 0
}

Write-Host "==> Installing dependencies..." -ForegroundColor Cyan
Push-Location frontend
npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host "==> Building frontend..." -ForegroundColor Cyan
Push-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host "==> Installing backend dependencies..." -ForegroundColor Cyan
Push-Location backend
npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

if (-not (Test-Path "backend/.env")) {
  Write-Host "==> Creating .env file..." -ForegroundColor Yellow
  Copy-Item ".env.example" "backend/.env"
  Write-Host "    WARNING: Update JWT_SECRET in backend/.env for production!" -ForegroundColor Yellow
}

Write-Host "==> Starting server..." -ForegroundColor Cyan
Push-Location backend
node server.js
Pop-Location
