#!/bin/bash
# AI Page Builder V2 — Vercel Production Deployment Script
# Usage: bash deploy-to-vercel.sh [GEMINI_API_KEY]

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI Page Builder V2 — Vercel Deployment${NC}"
echo -e "${BLUE}===========================================${NC}\n"

# Check if Gemini API key provided
if [ -z "$1" ] && [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${RED}❌ Error: Gemini API key required${NC}"
    echo ""
    echo "Usage: bash deploy-to-vercel.sh YOUR_GEMINI_API_KEY"
    echo ""
    echo "Or set environment variable:"
    echo "  export GEMINI_API_KEY='your-key'"
    echo "  bash deploy-to-vercel.sh"
    echo ""
    echo "Get your Gemini API key from: https://aistudio.google.com/app/apikey"
    exit 1
fi

# Set Gemini API key
if [ -n "$1" ]; then
    export GEMINI_API_KEY="$1"
fi

# Verify current directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the ai-page-builder-v2 directory:"
    echo "  cd ai-page-builder-v2"
    echo "  bash deploy-to-vercel.sh [GEMINI_API_KEY]"
    exit 1
fi

echo -e "${GREEN}✓ Working directory: $(pwd)${NC}\n"

# Step 1: Verify Node.js and npm
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org/${NC}"
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Install Node.js from https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo -e "${GREEN}✓ npm $(npm --version)${NC}\n"

# Step 2: Verify Supabase credentials in .env.local
echo -e "${BLUE}Step 2: Verifying environment variables...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local not found${NC}"
    echo "Creating .env.local from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✓ Created .env.local${NC}"
    else
        echo -e "${RED}❌ .env.example not found either${NC}"
        exit 1
    fi
fi

# Verify Supabase URL
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d= -f2)
    echo -e "${GREEN}✓ Supabase URL: $SUPABASE_URL${NC}"
else
    echo -e "${RED}❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local${NC}"
    exit 1
fi

# Add Gemini API key to .env.local if not already present
if grep -q "GEMINI_API_KEY" .env.local; then
    # Update existing key
    sed -i.bak "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$GEMINI_API_KEY/" .env.local
    echo -e "${GREEN}✓ Updated GEMINI_API_KEY in .env.local${NC}"
else
    # Add new key
    echo "GEMINI_API_KEY=$GEMINI_API_KEY" >> .env.local
    echo -e "${GREEN}✓ Added GEMINI_API_KEY to .env.local${NC}"
fi

echo ""

# Step 3: Install dependencies
echo -e "${BLUE}Step 3: Installing dependencies (npm install)...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

# Step 4: Build for production
echo -e "${BLUE}Step 4: Building for production (npm run build)...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}\n"
else
    echo -e "${RED}❌ Build failed. Check errors above.${NC}"
    exit 1
fi

# Step 5: Verify Vercel CLI installed
echo -e "${BLUE}Step 5: Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI ready${NC}\n"

# Step 6: Deploy to Vercel
echo -e "${BLUE}Step 6: Deploying to Vercel production...${NC}"
echo -e "${YELLOW}This will deploy to your production domain.${NC}"
echo -e "${YELLOW}Press Ctrl+C to cancel, or Enter to continue...${NC}\n"
read -r

vercel deploy --prod --env GEMINI_API_KEY="$GEMINI_API_KEY"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${BLUE}📊 What's next:${NC}"
    echo "  1. Visit your live URL above"
    echo "  2. Test creating a new page"
    echo "  3. Generate content with AI"
    echo "  4. Publish pages and share"
    echo ""
    echo -e "${BLUE}📖 Documentation:${NC}"
    echo "  - Vercel Dashboard: https://vercel.com/dashboard"
    echo "  - Supabase: https://app.supabase.com"
    echo "  - Monitoring: Check Vercel logs for errors"
    echo ""
    echo -e "${GREEN}🎉 Your app is now live!${NC}\n"
else
    echo -e "${RED}❌ Deployment failed. Check errors above.${NC}"
    exit 1
fi
