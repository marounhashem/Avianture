# Deploy Avianture to Railway (PowerShell version for Windows users).
#
# Prerequisites:
#   1. A VALID Railway account API token (NOT an OAuth App secret).
#      Get one from: https://railway.app/account/tokens  ->  Create Token
#   2. Railway CLI installed: npm install -g @railway/cli
#
# Usage:
#   $env:RAILWAY_TOKEN = "your-fresh-account-token-here"
#   .\scripts\deploy-to-railway.ps1
$ErrorActionPreference = "Stop"

if (-not $env:RAILWAY_TOKEN) {
  Write-Host "Error: RAILWAY_TOKEN is not set." -ForegroundColor Red
  Write-Host 'Get a fresh token from https://railway.app/account/tokens and set it first:'
  Write-Host '  $env:RAILWAY_TOKEN = "your-token"'
  exit 1
}

if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
  npm install -g @railway/cli
}

Write-Host "-> Verifying Railway token..." -ForegroundColor Cyan
railway whoami
if ($LASTEXITCODE -ne 0) {
  Write-Host "Token rejected. Verify it at https://railway.app/account/tokens" -ForegroundColor Red
  exit 1
}

$ProjectName = "avianture"

Write-Host "-> Creating or linking Railway project: $ProjectName" -ForegroundColor Cyan
railway init --name $ProjectName
if ($LASTEXITCODE -ne 0) { railway link }

Write-Host "-> Adding Postgres database plugin" -ForegroundColor Cyan
railway add --database postgres
if ($LASTEXITCODE -ne 0) { Write-Host "  (database may already exist - continuing)" -ForegroundColor Yellow }

Write-Host "-> Generating NEXTAUTH_SECRET and setting env vars" -ForegroundColor Cyan
$NextAuthSecret = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
railway variables set NEXTAUTH_SECRET=$NextAuthSecret
railway variables set NODE_ENV=production

Write-Host "-> Deploying application (first build runs prisma db push + next build)" -ForegroundColor Cyan
railway up --detach

Write-Host ""
Write-Host "Deployment initiated." -ForegroundColor Green
Write-Host ""
Write-Host "Next manual steps:" -ForegroundColor Yellow
Write-Host "  1. Wait ~2-3 minutes for build to finish"
Write-Host "  2. Copy the deployed URL (https://<something>.up.railway.app)"
Write-Host "  3. Set NEXTAUTH_URL to that URL:"
Write-Host '       railway variables set NEXTAUTH_URL="https://<your-url>"'
Write-Host "  4. Redeploy: railway up --detach"
Write-Host "  5. Seed demo data: railway run npm run db:seed"
Write-Host ""
Write-Host "Demo accounts will be:" -ForegroundColor Cyan
Write-Host "  Operator: marounhashem@gmail.com / Avianture2026!"
Write-Host "  Handler:  handler.dxb@avianture.demo / Avianture2026!"
Write-Host "  Handler:  handler.lclk@avianture.demo / Avianture2026!"
Write-Host "  Crew:     pilot@avianture.demo / Avianture2026!"
