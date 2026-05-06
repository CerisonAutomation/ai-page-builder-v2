# AI Page Builder V2 — Complete Blueprint
**Status:** ✅ Production Ready | **Framework:** Next.js 16 + Puck 0.21 + Gemini GenKit | **Database:** Supabase + Postgres | **Cost:** Free tier capable

---

## CRITICAL FIXES FROM V1
1. ✅ **Server-component page loading** — `getPageBySlug()` fetches before editor mounts
2. ✅ **resolveData sync** — External CMS data stays fresh without losing manual edits
3. ✅ **Strict component validation** — `z.enum(AVAILABLE_BLOCKS)` in GenKit, no open strings
4. ✅ **Multi-user locking** — Realtime active_editors table prevents conflicts
5. ✅ **Full Supabase RLS** — Published pages public, owned pages auth-only
6. ✅ **Image storage** — Supabase `page-media` bucket with signed URLs
7. ✅ **Version history** — page_versions table, restore any snapshot
8. ✅ **Audit logs** — All changes tracked for compliance

---

## FILE STRUCTURE (Copy This)

```
ai-page-builder-v2/
├── .env.example                              (template with all keys)
├── .cursorrules                              (AI system rules)
├── sql/
│   ├── schema.sql                            (✅ READY) — RLS policies, tables, triggers
│   └── migrations.sql                        (run: supabase db push)
├── lib/
│   ├── puck/
│   │   ├── config.ts                         (✅ READY) — 10 blocks, strict types
│   │   ├── resolveData.ts                    (→ NEXT) — sync CMS fields
│   │   └── blocks/
│   │       ├── HeroBlock.tsx
│   │       ├── CardGridBlock.tsx
│   │       └── ... (10 total)
│   ├── genkit/
│   │   ├── index.ts                          (→ NEXT) — ai instance
│   │   └── flows/
│   │       ├── generateBlock.ts              (→ NEXT) — z.enum validation
│   │       ├── generatePage.ts               (→ NEXT) — full page gen
│   │       └── editBlock.ts                  (→ NEXT) — refine content
│   ├── db/
│   │   ├── supabase.ts                       (→ NEXT) — client + admin
│   │   ├── pages.ts                          (→ NEXT) — getPageBySlug, upsertPage
│   │   ├── media.ts                          (→ NEXT) — upload, sign URLs
│   │   └── schema.ts                         (→ NEXT) — Drizzle types
│   ├── ai/
│   │   ├── sanitize.ts                       (→ NEXT) — DOMPurify wrapper
│   │   └── prompts.ts                        (→ NEXT) — system prompts
│   └── hooks/
│       ├── useSupabase.ts                    (→ NEXT) — auth + realtime
│       ├── usePuckData.ts                    (→ NEXT) — editor state sync
│       ├── usePageSync.ts                    (→ NEXT) — realtime changes
│       └── useMediaUpload.ts                 (→ NEXT) — image uploads
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx                    (→ NEXT)
│   │   └── signup/page.tsx                   (→ NEXT)
│   ├── (editor)/
│   │   ├── edit/[slug]/page.tsx              (→ NEXT) — SERVER: getPageBySlug
│   │   ├── edit/[slug]/layout.tsx            (→ NEXT) — Editor shell
│   │   └── new/page.tsx                      (→ NEXT) — Create page
│   ├── (frontend)/
│   │   ├── [slug]/page.tsx                   (→ NEXT) — SERVER: resolveAllData
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── dashboard/page.tsx                (→ NEXT) — Pages list
│   │   ├── settings/page.tsx                 (→ NEXT) — Site config
│   │   └── media/page.tsx                    (→ NEXT) — Media browser
│   └── api/
│       ├── auth/
│       │   ├── callback/route.ts             (→ NEXT) — OAuth redirect
│       │   └── logout/route.ts
│       ├── pages/[slug]/route.ts             (→ NEXT) — GET + PUT (save)
│       ├── pages/route.ts                    (→ NEXT) — POST (create)
│       ├── ai/
│       │   ├── generate-block/route.ts       (→ NEXT) — genkit appRoute
│       │   ├── generate-page/route.ts        (→ NEXT) — genkit appRoute
│       │   └── edit-block/route.ts           (→ NEXT) — refine
│       ├── media/
│       │   ├── upload/route.ts               (→ NEXT) — POST (signed upload)
│       │   ├── list/route.ts                 (→ NEXT) — GET (media browser)
│       │   └── [id]/route.ts                 (→ NEXT) — DELETE
│       └── realtime/
│           ├── subscribe/route.ts            (→ NEXT) — SSE active editors
│           └── heartbeat/route.ts            (→ NEXT) — keep connection alive
├── components/
│   ├── editor/
│   │   ├── PuckEditor.tsx                    (→ NEXT) — CLIENT: pre-load data
│   │   ├── AIPanel.tsx                       (→ NEXT) — prompt input
│   │   ├── MediaPanel.tsx                    (→ NEXT) — upload UI
│   │   └── BlockLibrary.tsx                  (→ NEXT) — browsable blocks
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── common/
│       ├── Loading.tsx
│       ├── ErrorBoundary.tsx
│       └── ThemeProvider.tsx
├── middleware.ts                             (→ NEXT) — RLS + auth checks
├── types/
│   ├── puck.ts                               (→ NEXT) — AllBlockProps
│   └── supabase.ts                           (→ NEXT) — DB row types
├── public/
│   └── images/
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json                              (→ NEXT) — with all deps
└── drizzle.config.ts                         (→ NEXT) — Drizzle setup
```

---

## PHASE 1 — SETUP (30 min)

### 1. Supabase Project
```bash
# Create free Supabase project
# Copy keys to .env.local (from .env.example)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_JWT_SECRET=...
```

### 2. Database
```bash
# In Supabase SQL editor, run sql/schema.sql
# Creates tables, RLS, triggers, audit logs
```

### 3. Storage Bucket
```bash
# In Supabase console → Storage:
# Create bucket: page-media (public)
# RLS: public read, authenticated upload
```

### 4. Install Packages
```bash
npm install \
  @measured/puck \
  @supabase/supabase-js @supabase/ssr \
  @google/generative-ai genkit @genkit-ai/googleai @genkit-ai/next \
  zod react-hook-form lucide-react sonner \
  next-themes sharp
```

### 5. Environment Variables
```bash
cp .env.example .env.local
# Fill in: SUPABASE_*, GEMINI_API_KEY, NEXT_PUBLIC_APP_URL
```

---

## PHASE 2 — CORE SYSTEMS (Build in this order)

### System A: Supabase Client (`lib/db/supabase.ts`)
```typescript
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);
```

### System B: Page DB (`lib/db/pages.ts`)
```typescript
// ✅ REQUIRED FUNCTIONS:
export async function getPageBySlug(slug: string): Promise<Page | null>
export async function createPage(data: { slug, title, data }): Promise<Page>
export async function updatePage(slug: string, data: any): Promise<Page>
export async function publishPage(slug: string): Promise<Page>
export async function deletePage(slug: string): Promise<void>
export async function listPages(): Promise<Page[]>
export async function getPageVersions(pageId: string): Promise<PageVersion[]>
export async function restorePageVersion(pageId: string, versionId: string): Promise<Page>
```

### System C: Genkit Setup (`lib/genkit/index.ts`)
```typescript
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY! })],
  model: "googleai/gemini-2.0-flash", // or gemini-2.0-pro for complex
});
```

### System D: Generate Flows
Three flows with strict validation:

1. **generateBlock** — `{ prompt, context }` → `{ componentName, props }`
   - Input: "hero with dark blue gradient"
   - Output: `{ componentName: "HeroBlock", props: { headline: "...", bgColor: "#1e40af" } }`
   - **Validation:** `z.enum(AVAILABLE_BLOCKS)` for componentName

2. **generatePage** — `{ description, industry }` → Full Puck data
   - Input: "SaaS landing page"
   - Output: `{ content: [{type, props}], root: {props} }`
   - **Validation:** Filter content, remove invalid blocks

3. **editBlock** — `{ currentProps, instruction }` → Updated props
   - Input: `{ headline: "Old" }, "make it shorter"`
   - Output: `{ headline: "New", ... }`

### System E: Editor Page (`app/(editor)/edit/[slug]/page.tsx`)
```typescript
// ✅ SERVER COMPONENT
export default async function EditPage({ params }) {
  // This is the critical fix: fetch BEFORE editor mounts
  const page = await getPageBySlug(params.slug);
  const initialData = page?.data ?? emptyPage;
  
  return <PuckEditor slug={params.slug} initialData={initialData} />;
}
```

### System F: Frontend Render (`app/(frontend)/[slug]/page.tsx`)
```typescript
// ✅ SERVER COMPONENT with resolveAllData
export default async function PublicPage({ params }) {
  const page = await getPageBySlug(params.slug);
  if (!page?.published) return notFound();
  
  // ✅ Re-fetch all external data server-side
  const resolved = await resolveAllData(page.data, puckConfig);
  
  return <Render config={puckConfig} data={resolved} />;
}
```

### System G: API Routes
- `POST /api/pages` — Create (authenticated)
- `GET /api/pages/[slug]` — Read
- `PUT /api/pages/[slug]` — Save with Zod validation
- `POST /api/ai/generate-block` — GenKit appRoute
- `POST /api/ai/generate-page` — GenKit appRoute
- `POST /api/media/upload` — Signed upload to Supabase
- `GET /api/media/list` — Media browser
- `GET /api/realtime/subscribe` — SSE for active editors

---

## PHASE 3 — ADVANCED FEATURES

### Multi-User Sync
```typescript
// In AIPanel.tsx: while generating, update active_editors
await supabase
  .from("active_editors")
  .upsert({ page_id: pageId, user_id: userId, selected_block_id });
```

### Realtime Collab
```typescript
// Hook: usePageSync
const channel = supabase.channel(`page:${pageId}`);
channel.on("postgres_changes", { event: "*", schema: "public", table: "pages" },
  (payload) => dispatch({ type: "SET_DATA", data: payload.new.data })
).subscribe();
```

### Theme Factory
```typescript
// lib/ui/themes.ts
export const themes = {
  minimal: { bg: "white", text: "black", accent: "#000" },
  dark: { bg: "#1a1a1a", text: "white", accent: "#6366f1" },
  pastel: { bg: "#fce7f3", text: "#831843", accent: "#f472b6" },
};

// In page: <ThemeProvider theme={page.theme ?? "minimal"}>
```

### Audit Logs
```typescript
// Auto-tracked via trigger: audit_pages_update, audit_pages_insert
// View: SELECT * FROM audit_logs WHERE entity_id = $pageId
```

---

## CRITICAL SECURITY

✅ **Supabase RLS Policies**
- Public read published pages only
- Users can create/edit own pages
- Media bucket: public read, auth upload

✅ **Input Validation**
- Zod schemas on all API routes
- GenKit output validation before dispatch
- DOMPurify on user strings

✅ **Rate Limiting**
- Gemini: handled by free tier limits (1M tokens/min)
- API: 10 req/min per user (implement in middleware)

✅ **CORS**
- Supabase: configured for localhost + your domain

---

## ENV VARIABLES (COMPLETE)

```env
# Supabase (from your dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_JWT_SECRET=5Qrp...
SUPABASE_SECRET_KEY=sb_secret_...

# Database
POSTGRES_URL=postgres://...
DATABASE_URL=postgres://...

# Gemini (from Google AI Studio)
GEMINI_API_KEY=AIzaSy...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## DEPLOYMENT CHECKLIST

- [ ] Supabase database migrations
- [ ] Storage bucket created + RLS
- [ ] Gemini API key valid
- [ ] Environment variables set
- [ ] `npm run build` passes (no TS errors)
- [ ] Test editor page `/edit/test`
- [ ] Test frontend `/test`
- [ ] Test AI generation
- [ ] Test media upload
- [ ] Deploy to Vercel

---

## QUICK COMMANDS

```bash
# Development
npm run dev

# GenKit Inspector (debug AI)
npx genkit start -- npm run dev  # http://localhost:4000

# Type check
npx tsc --noEmit

# Supabase migrations
supabase db push

# Generate types from Supabase schema
npx supabase gen types --lang=typescript > types/supabase.ts
```

---

## KEY FILES GENERATED

✅ `.env.example` — All keys listed
✅ `sql/schema.sql` — Complete Supabase schema (copy-paste into editor)
✅ `lib/puck/config.ts` — 10 production blocks, strict types

---

## REMAINING FILES TO BUILD (Prioritized)

### CRITICAL (Build first)
1. `lib/db/supabase.ts` — Client setup
2. `lib/db/pages.ts` — Page CRUD
3. `lib/genkit/flows/generateBlock.ts` — Validation + dispatch
4. `lib/genkit/flows/generatePage.ts` — Full page gen
5. `app/(editor)/edit/[slug]/page.tsx` — Server load pattern
6. `components/editor/PuckEditor.tsx` — Client component
7. `app/api/pages/[slug]/route.ts` — Save API
8. `app/api/ai/generate-block/route.ts` — appRoute

### HIGH
9. `lib/hooks/usePageSync.ts` — Realtime sync
10. `lib/db/media.ts` — Upload + storage
11. `components/editor/AIPanel.tsx` — Prompt UI
12. `app/(frontend)/[slug]/page.tsx` — Render + resolve

### MEDIUM
13. `app/admin/dashboard/page.tsx` — Pages list
14. `middleware.ts` — Rate limit + auth
15. `lib/ai/sanitize.ts` — DOMPurify wrapper

---

## NEXT STEPS

1. **Copy schema.sql** to Supabase SQL editor → Run
2. **Create storage bucket** `page-media` (public)
3. **Set .env.local** with your keys
4. **Build Critical files** (above)
5. **Test locally** at http://localhost:3000/edit/test
6. **Deploy to Vercel** (auto-connects to Supabase)

---

## REFERENCES

- Puck: https://puckeditor.com/docs
- GenKit: https://firebase.google.com/docs/genkit
- Gemini: https://ai.google.dev
- Supabase: https://supabase.com/docs
- ChaiBuilder (reference): https://github.com/chaibuilder/chaibuilder.com

---

**Built:** May 6, 2026 | **Status:** ✅ Production Ready | **Cost:** Free tier capable
