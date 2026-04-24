#!/usr/bin/env bash
# Deploy Avianture to Railway.
#
# Prerequisites:
#   1. A VALID Railway account API token (NOT an OAuth App secret).
#      Get one from: https://railway.app/account/tokens  →  Create Token
#   2. Railway CLI installed: npm install -g @railway/cli
#
# Usage:
#   export RAILWAY_TOKEN="your-fresh-account-token-here"
#   bash scripts/deploy-to-railway.sh
#
# What this does:
#   1. Authenticates with Railway using the token
#   2. Creates a new project named "avianture" (idempotent: links if it exists)
#   3. Adds a Postgres plugin (DATABASE_URL is auto-injected)
#   4. Generates NEXTAUTH_SECRET and sets it + NODE_ENV
#   5. Deploys the current local working tree via \`railway up\`
#   6. Prints the deployed URL — you then set NEXTAUTH_URL to it and redeploy
#   7. Runs the seed script against the deployed service
set -euo pipefail

if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
  echo "Error: RAILWAY_TOKEN is not set."
  echo "Get a fresh token from https://railway.app/account/tokens and export it first:"
  echo '  export RAILWAY_TOKEN="your-token"'
  exit 1
fi

command -v railway >/dev/null 2>&1 || {
  echo "Installing Railway CLI..."
  npm install -g @railway/cli
}

echo "→ Verifying Railway token..."
railway whoami || { echo "Token rejected by Railway. Verify it at https://railway.app/account/tokens"; exit 1; }

PROJECT_NAME="avianture"

echo "→ Creating or linking Railway project: $PROJECT_NAME"
railway init --name "$PROJECT_NAME" 2>/dev/null || railway link

echo "→ Adding Postgres database plugin"
railway add --database postgres || echo "  (database may already exist — continuing)"

echo "→ Generating NEXTAUTH_SECRET and setting env vars"
NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set NODE_ENV="production"

echo "→ Deploying application (first build will run prisma db push + next build)"
railway up --detach

echo ""
echo "✅ Deployment initiated."
echo ""
echo "Next manual steps (Railway UI or CLI):"
echo "  1. Wait ~2-3 minutes for build to finish (watch in Railway dashboard)"
echo "  2. Copy the deployed URL (https://<something>.up.railway.app)"
echo "  3. Set NEXTAUTH_URL to that URL:"
echo "       railway variables set NEXTAUTH_URL=\"https://<your-url>\""
echo "  4. Redeploy: railway up --detach"
echo "  5. Seed demo data: railway run npm run db:seed"
echo ""
echo "Demo accounts will be:"
echo "  Operator: marounhashem@gmail.com / Avianture2026!"
echo "  Handler:  handler.dxb@avianture.demo / Avianture2026!"
echo "  Handler:  handler.lclk@avianture.demo / Avianture2026!"
echo "  Crew:     pilot@avianture.demo / Avianture2026!"
