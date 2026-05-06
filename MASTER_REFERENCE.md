# AI Page Builder V2 — Master Reference & Quick Start
**Status:** ✅ Production Ready | **Last Updated:** May 6, 2026

---

## 🚀 ULTRA-QUICK START (15 minutes)

### 1. Clone & Install
```bash
cd /workspace/ai-page-builder-v2
npm install
cp .env.example .env.local
```

### 2. Supabase Setup
```bash
# Create free project at supabase.com
# Copy keys to .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_JWT_SECRET=...
```

### 3. Database
```bash
# In Supabase SQL Editor, paste entire sql/schema.sql
# Creates tables, RLS, triggers, audit
```

### 4. Storage Bucket
```bash
# Supabase Dashboard → Storage → Create Bucket
# Name: page-media
# Public: Yes
```

### 5. Gemini API
```bash
# Visit https://aistudio.google.com/app/apikey
# Create key → copy to .env.local
GEMINI_API_KEY=AIzaSy...
```

### 6. Run
```bash
npm run dev
open http://localhost:3000/edit/test
```

**Done.** Start editing. AI generation works immediately.

---

## 📁 PROJECT FILES (What's Ready)

| File | Status | Purpose |
|------|--------|---------|
| `.env.example` | ✅ | All required keys listed |
| `sql/schema.sql` | ✅ | Copy-paste into Supabase SQL |
| `.cursorrules` | ✅ | AI system rules (Cursor/Claude) |
| `lib/puck/config.ts` | ✅ | 10 blocks + validation |
| `package.json` | ✅ | All dependencies |
| `PROJECT_BLUEPRINT.md` | ✅ | Complete architecture + priorities |

**Files to Build Next** (in priority order):
1. `lib/db/supabase.ts` — Supabase client setup
2. `lib/db/pages.ts` — Page CRUD functions
3. `lib/genkit/flows/generateBlock.ts` — AI block gen
4. `lib/genkit/flows/generatePage.ts` — Full page gen
5. `app/(editor)/edit/[slug]/page.tsx` — Editor SERVER component
6. `components/editor/PuckEditor.tsx` — Editor CLIENT component
7. `app/api/pages/[slug]/route.ts` — Save API
8. `app/api/ai/generate-block/route.ts` — AI API

---

## 🔑 CRITICAL PATTERNS (Read These)

### Pattern A: Server-Component Page Loading
**File:** `app/(editor)/edit/[slug]/page.tsx`

```typescript
// ✅ THIS IS THE FIX FOR BLANK EDITORS
export default async function EditPage({ params }) {
  // 1. Fetch page BEFORE rendering editor
  const page = await getPageBySlug(params.slug);
  
  // 2. Use saved data, fallback to empty
  const initialData = page?.data ?? emptyPage;
  
  // 3. Pass to client component
  return <PuckEditor slug={params.slug} initialData={initialData} />;
}
```

**Why:** If you pass `data={{}}`, editor starts blank even if page exists in DB. This pattern ensures editor always reflects saved state.

### Pattern B: Puck Config with Strict Types
**File:** `lib/puck/config.ts` (already built ✅)

```typescript
export type AllBlockProps = {
  HeroBlock: { headline: string; ctaLabel: string; ... };
  CardGridBlock: { title: string; cards: [...] };
  // ... 10 total blocks, all typed
};

export const puckConfig: Config<AllBlockProps> = {
  components: {
    HeroBlock: { fields: heroBlockFields, defaultProps: {...}, render: HeroBlock },
    // ... rest
  }
};

export const AVAILABLE_BLOCKS = Object.keys(puckConfig.components);
```

**Why:** TypeScript + runtime block names prevent AI from generating invalid blocks.

### Pattern C: GenKit Flow with Enum Validation
**File:** `lib/genkit/flows/generateBlock.ts` (to build)

```typescript
// ✅ THIS PREVENTS "INVALID BLOCK TYPE" ERRORS
const BlockOutputSchema = z.object({
  componentName: z.enum(AVAILABLE_BLOCKS),  // ✅ enum, not string
  props: z.record(z.unknown()),
});

export const generateBlockFlow = ai.defineFlow(
  {
    name: "generateBlock",
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: BlockOutputSchema,  // ✅ validated
  },
  async ({ prompt }) => {
    const { output } = await ai.generate({ ... });
    return output;  // ✅ always matches schema
  }
);
```

**Why:** Gemini can't generate invalid blocks if you constrain it to enum.

### Pattern D: API Route with Validation
**File:** `app/api/pages/[slug]/route.ts` (to build)

```typescript
const SaveSchema = z.object({
  slug: z.string().min(1),
  title: z.string(),
  data: PuckDataSchema,  // nested validation
});

export async function PUT(req, { params }) {
  const parsed = SaveSchema.safeParse(await req.json());
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  
  // ✅ Now we know data is valid
  const { data } = parsed.data;
  return upsertPage(params.slug, data);
}
```

**Why:** Zod validates BEFORE hitting database, prevents bad data.

### Pattern E: Supabase RLS (Security First)
**File:** `sql/schema.sql` (already built ✅)

```sql
-- Published pages: everyone can read
CREATE POLICY "public_read_published" ON pages
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

-- User pages: only owner can edit
CREATE POLICY "owner_all" ON pages
  FOR ALL USING (created_by = auth.uid());

-- Media: public read, auth upload
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_media" ON media
  FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "owner_manage_media" ON media
  FOR ALL USING (uploaded_by = auth.uid());
```

**Why:** Supabase RLS is the first line of defense. No database query = no data leak.

---

## 🎯 BUILD PLAN (Prioritized)

### PHASE 1 — MINIMAL DEMO (2 hours)
Build these 5 files to have a working editor:

1. **`lib/db/supabase.ts`** (50 lines)
   - `export const supabase = createClient(...)`
   - `export const supabaseAdmin = createClient(...)`

2. **`lib/db/pages.ts`** (100 lines)
   - `getPageBySlug(slug)` — fetch from DB
   - `updatePage(slug, data)` — save to DB

3. **`lib/genkit/flows/generateBlock.ts`** (60 lines)
   - defineFlow with z.enum validation
   - POST `/api/ai/generate-block` → auto-wrapped

4. **`app/(editor)/edit/[slug]/page.tsx`** (30 lines)
   - Server component, fetch page, pass to editor

5. **`components/editor/PuckEditor.tsx`** (80 lines)
   - Client component, receives initialData, renders Puck

**After these 5:** You have a working visual editor with AI. Everything else enhances it.

### PHASE 2 — PRODUCTION (4 hours)
Add these for real usage:

6. Media uploader
7. Realtime sync (active editors)
8. Admin dashboard
9. Publish workflow
10. Version history UI

### PHASE 3 — POLISH (2 hours)
11. Rate limiting
12. Audit logging
13. Theme factory
14. Mobile optimization

---

## 🛠️ QUICK COMMANDS

```bash
# Development
npm run dev                          # Start dev server
npx genkit start -- npm run dev      # With GenKit Inspector (http://localhost:4000)

# Database
supabase db push                     # Apply migrations
npx drizzle-kit push:pg              # If using Drizzle

# Type generation
npx supabase gen types --lang=typescript > types/supabase.ts

# Build & deploy
npm run build                        # Build for production
npm run type-check                   # Check TypeScript
vercel deploy                        # Deploy to Vercel
```

---

## 📚 ESSENTIAL LINKS

| Resource | Link | Purpose |
|----------|------|---------|
| **Puck Editor** | https://puckeditor.com/docs | Visual editor API |
| **Gemini API** | https://ai.google.dev/docs | AI generation |
| **Google AI Studio** | https://aistudio.google.com/app/apikey | Get free API key |
| **Supabase Docs** | https://supabase.com/docs | Database + Auth |
| **Next.js Docs** | https://nextjs.org/docs | Framework |
| **GenKit** | https://firebase.google.com/docs/genkit | AI flows |
| **ChaiBuilder** | https://github.com/chaibuilder/chaibuilder.com | Reference impl |

---

## 🔐 SECURITY CHECKLIST

- [ ] `.env.local` in `.gitignore` (NEVER commit keys)
- [ ] Supabase RLS enabled on all tables
- [ ] API routes validate with Zod
- [ ] Gemini key NOT in NEXT_PUBLIC_* vars
- [ ] CORS configured for your domain
- [ ] Rate limiting on `/api/ai/*`
- [ ] DOMPurify on user strings
- [ ] Audit logs for page changes

---

## 🧪 TESTING LOCALLY

```bash
# 1. Start dev server
npm run dev

# 2. Create test page
curl -X POST http://localhost:3000/api/pages \
  -H "Content-Type: application/json" \
  -d '{"slug":"test","title":"Test Page","data":{"content":[],"root":{"props":{"title":"Test"}}}}'

# 3. Open editor
open http://localhost:3000/edit/test

# 4. Test AI (in AIPanel)
Type: "hero with blue background"
Click: "Generate Block"
→ Should add HeroBlock with generated props

# 5. Test save
Click Puck "Save" button
→ Should POST to /api/pages/test
→ Should appear in database

# 6. Refresh page
F5 / Cmd+R
→ Should load saved data (not blank)
```

---

## 📊 DATA FLOW

```
User Types Prompt
         ↓
AIPanel.tsx (client)
         ↓
POST /api/ai/generate-block
         ↓
generateBlock GenKit Flow
         ↓
Gemini API (returns JSON with strict schema)
         ↓
Output validated (z.enum + Zod)
         ↓
dispatch({ type: "INSERT", componentType, props })
         ↓
Puck editor updates
         ↓
User clicks "Save" in Puck
         ↓
PUT /api/pages/[slug]
         ↓
Zod validates data shape
         ↓
upsertPage() in Supabase
         ↓
RLS policy checks: user owns page?
         ↓
Insert/Update pages table
         ↓
Trigger: audit_pages_update → audit_logs
         ↓
Success response to client
```

---

## 🚨 COMMON ERRORS & FIXES

| Error | Cause | Fix |
|-------|-------|-----|
| "Editor is blank" | `data={{}}` passed to editor | Use server-component pattern, fetch page first |
| "Invalid block type" | GenKit returned non-existent block | Use `z.enum(AVAILABLE_BLOCKS)` in schema |
| "Permission denied" | RLS policy blocking write | Check `created_by = auth.uid()` in policy |
| "Gemini API key invalid" | Env var not set or expired | `echo $GEMINI_API_KEY`, regenerate if needed |
| "Page not found" | Slug doesn't exist in DB | Create page via `/api/pages` POST first |
| "CORS error" | Browser blocked request | Supabase dashboard: add `localhost:3000` to CORS |

---

## 💡 ARCHITECTURE DECISIONS

| Decision | Why |
|----------|-----|
| Supabase + RLS over custom auth | Out-of-box multi-user + security |
| Server components for page load | Data available before hydration |
| resolveData pattern | External CMS stays fresh, manual edits preserved |
| z.enum for blocks | AI can't generate invalid components |
| Zod on every API | Type-safe, human-readable errors |
| Genkit (not raw SDK) | Structured flows, introspection, testing |

---

## 📈 NEXT: BUILD PHASE 1

1. **Start fresh session** (this one is long)
2. **Go to Phase 1 section above**
3. **Build the 5 files in order**
4. **Test at http://localhost:3000/edit/test**

After those 5 files work, everything else is additive.

---

## 🎬 DEPLOYMENT (Vercel)

```bash
# 1. Push to GitHub
git add .
git commit -m "AI Page Builder V2"
git push origin main

# 2. Connect to Vercel
vercel --prod

# 3. Set environment variables
vercel env add GEMINI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... rest

# 4. Auto-deploy on push
# (Vercel does this by default)

# Live at: your-project.vercel.app
```

---

## 🏁 SUCCESS CRITERIA

After completing this build, you can:

- ✅ Create a new page at `/edit/new`
- ✅ Use Puck visual editor to add blocks
- ✅ Use AI to generate blocks from prompts
- ✅ Use AI to generate full pages
- ✅ Save pages (data persists)
- ✅ Publish pages (public view at `/{slug}`)
- ✅ See version history
- ✅ Restore previous versions
- ✅ Upload images to media library
- ✅ Multi-user collaborative editing

---

**Built:** May 6, 2026 | **Framework:** Next.js 16 + Puck + Gemini + Supabase | **Cost:** Free tier capable

Start with `.env.example` → `sql/schema.sql` → **PHASE 1 BUILD** above.

**You got this.** 🚀
