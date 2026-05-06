# 🚀 AI Page Builder V2 — Vercel Deployment Guide

**Status:** ✅ PRODUCTION READY  
**Date:** May 6, 2026  
**Project:** AI Page Builder V2 (4,700+ lines)

---

## Quick Start (5 minutes)

```bash
# 1. Get Gemini API key from https://aistudio.google.com/app/apikey
export GEMINI_API_KEY="your-actual-key-here"

# 2. Install dependencies
npm install

# 3. Build for production
npm run build

# 4. Deploy to Vercel production
vercel deploy --prod
```

---

## Full Deployment Walkthrough

### Prerequisites
- Mac with Node.js 18+ and npm installed
- Vercel account (free tier sufficient)
- Gemini API key (from Google AI Studio)
- Project downloaded to local machine

### Step 1: Prepare Environment

```bash
cd ai-page-builder-v2

# Verify .env.local has Supabase credentials (already configured)
cat .env.local | head -10

# Add Gemini API key
export GEMINI_API_KEY="your-gemini-api-key-from-aistudio"

# Verify it's set
echo $GEMINI_API_KEY
```

**Supabase Credentials Already Configured:**
- `NEXT_PUBLIC_SUPABASE_URL`: https://pwrvpgvanwguuhwwpuwx.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [configured in .env.local]
- `SUPABASE_JWT_SECRET`: [configured in .env.local]
- `DATABASE_URL`: [postgres connection string, configured]

### Step 2: Install Dependencies

```bash
npm install
```

**What this does:**
- Installs all 49 production + dev dependencies
- Creates node_modules/ (~800MB)
- Installs: Puck, Gemini SDK, Supabase, Next.js, TypeScript, Tailwind, etc.

**Expected output:**
```
added 1,200+ packages in 5-8 minutes
npm warn deprecated ...
```

**Troubleshooting:**
- If you get `ERR! 404 Not Found`, try: `npm cache clean --force && npm install`
- If you get memory issues, try: `npm install --no-optional`

### Step 3: Build for Production

```bash
npm run build
```

**What this does:**
- TypeScript type-checking
- Next.js build optimization
- Tree-shaking and minification
- Generates `.next/` directory (~50MB compiled)

**Expected output:**
```
✓ Compiled successfully
✓ Prerendered 3 pages (sitemap, robots, page)
✓ Ready for production
```

**Troubleshooting:**
- `Type errors found`: Run `npx tsc --noEmit` to see details
- `Build timeout`: Your machine may be slow; allow 5-10 minutes
- `Cannot find module X`: Run `npm install` again

### Step 4: Login to Vercel (if needed)

```bash
vercel login
```

**This will:**
- Open browser for OAuth login
- Store credentials in `~/.vercel/`
- Skip this if you've already logged in

### Step 5: Deploy to Production

```bash
vercel deploy --prod
```

**What this does:**
- Uploads your build to Vercel's CDN
- Configures environment variables
- Sets up auto-scaling + HTTPS
- Deploys to production (not preview)

**Expected output:**
```
🔍  Inspect: https://vercel.com/your-org/ai-page-builder-v2/...
✅ Production: https://ai-page-builder-v2.vercel.app
```

**Save this output!** The production URL is your live app.

---

## Environment Variables for Vercel

After deployment, verify Vercel has all environment variables:

1. Go to https://vercel.com/your-org/ai-page-builder-v2/settings/environment-variables
2. Verify these are set:
   - `GEMINI_API_KEY` ✅
   - `NEXT_PUBLIC_SUPABASE_URL` ✅
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
   - `SUPABASE_JWT_SECRET` ✅
   - `DATABASE_URL` ✅
   - `NEXT_PUBLIC_APP_URL` (optional, for absolute URLs)

3. If any are missing, add them manually in Vercel dashboard:
   - Project Settings → Environment Variables
   - Add each one, save, redeploy

### Setting Environment Variables in Vercel CLI

```bash
# Before deployment, set variables (optional—.env.local also works)
vercel env add GEMINI_API_KEY "your-actual-key"
vercel env add SUPABASE_JWT_SECRET "your-secret"

# Then deploy
vercel deploy --prod
```

---

## Testing the Live Deployment

### 1. Visit Your URL
```
https://your-app-name.vercel.app
```

### 2. Create a Test Page
- Click "New Page"
- Name it "Test Page"
- Click "Create"

### 3. Generate Content with AI
- Select a block
- Click "Generate with AI"
- Enter prompt: "Create a hero section for a SaaS landing page"
- Verify response appears

### 4. Publish a Page
- Save your page
- Click "Publish"
- View public version at `/pages/test-page`

### 5. Check Supabase Database
- Go to https://app.supabase.com
- Database → Pages table
- Verify your test page is there

---

## Monitoring & Troubleshooting

### View Logs
```bash
# Stream real-time logs from production
vercel logs --follow
```

### View Build Status
- Dashboard: https://vercel.com/your-org/ai-page-builder-v2
- Shows all deployments, build time, errors

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `404 Not Found` on live URL | Wait 30 seconds for DNS propagation |
| `GEMINI_API_KEY is undefined` | Add to Vercel env vars in dashboard |
| `Supabase connection timeout` | Check DATABASE_URL is correct in Vercel |
| `AI generation fails` | Verify Gemini API key is valid & has quota |
| `Database migration errors` | Run `npm run db:push` locally, commit, redeploy |
| `Blank page on load` | Check browser DevTools > Network & Console tabs |

### Rollback to Previous Deployment
```bash
# List all deployments
vercel deployments list

# Promote a previous deployment
vercel promote <deployment-url>
```

---

## Performance Optimization

After deployment, optimize for production:

### 1. Enable Image Optimization
- Vercel automatically optimizes images
- Verify in Vercel dashboard → Settings → Image Optimization

### 2. Monitor Core Web Vitals
- Go to Vercel dashboard → Analytics
- Check Largest Contentful Paint (LCP)
- Check Cumulative Layout Shift (CLS)

### 3. Enable Caching
- Already configured in `next.config.ts`
- API routes cache for 60 seconds
- Static pages cache for 1 year

### 4. Use Vercel Analytics (Optional)
```bash
npm install @vercel/analytics @vercel/speed-insights
```

Then in `app/layout.tsx`:
```tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout() {
  return (
    <html>
      <body>
        {/* your content */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## Scaling for Production

### Database Scaling
- Supabase free tier: 500 MB storage, unlimited API calls
- For 100K+ users: upgrade to Pro ($25/month)

### Storage Scaling
- Supabase free tier: 1 GB file storage
- For large file uploads: upgrade to Pro

### API Rate Limiting
- Vercel free tier: unlimited requests, 12 concurrent builds
- For high traffic: upgrade to Pro ($20/month)

### CDN Caching
- Vercel automatically caches at 300+ edge locations
- Static pages: 1-year cache
- API routes: 60-second cache (configurable)

---

## Continuous Deployment (Optional)

### Connect GitHub for Auto-Deploy

```bash
# 1. Push to GitHub
git remote add origin https://github.com/your-org/ai-page-builder-v2
git push -u origin main

# 2. Import in Vercel
# Go to https://vercel.com/new
# Select your GitHub repo
# Vercel will auto-deploy on every push
```

### Automatic Deployments
- Every push to `main` → automatic production deploy
- Every PR → automatic preview deployment
- See all deployments: vercel.com dashboard

---

## Rollout Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] Gemini API key verified and working
- [ ] Supabase database accessible from production
- [ ] Test page created and published
- [ ] AI generation tested with real Gemini API key
- [ ] Homepage loads without errors
- [ ] Admin panel accessible (if deployed)
- [ ] Error pages work (404, 500)
- [ ] HTTPS active (automatic with Vercel)
- [ ] Analytics visible in Vercel dashboard

---

## Support & Help

**Vercel Support:** https://vercel.com/support  
**Next.js Docs:** https://nextjs.org/docs  
**Supabase Docs:** https://supabase.com/docs  
**Gemini API Docs:** https://ai.google.dev/

---

## Time Estimates

| Step | Duration |
|------|----------|
| npm install | 5-8 min |
| npm run build | 3-5 min |
| vercel deploy --prod | 2-3 min |
| **Total** | **10-16 min** |

**Your app will be live in under 20 minutes!**

---

**Questions?** Review the troubleshooting section above or check the official docs for your specific error.
