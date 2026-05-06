#!/bin/bash

# 🚀 AI Page Builder V2 — Quick Deploy Script
# Usage: bash DEPLOY_NOW.sh
# This script will guide you through the deployment process

set -e

echo ""
echo "════════════════════════════════════════════════════════════"
echo "🚀 AI PAGE BUILDER V2 — DEPLOYMENT WIZARD"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "⚠️  Environment variables not set"
  echo ""
  echo "Before deploying, export these 5 variables:"
  echo ""
  echo '  export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"'
  echo '  export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."'
  echo '  export SUPABASE_JWT_SECRET="your-jwt-secret"'
  echo '  export GEMINI_API_KEY="your-gemini-key"'
  echo '  export NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"'
  echo ""
  echo "Then run: bash DEPLOY_NOW.sh"
  echo ""
  exit 1
fi

echo "✅ Environment variables found!"
echo ""
echo "Deploying to Vercel..."
echo ""

# Run the full deployment
bash DEPLOYMENT_MONITOR.sh

