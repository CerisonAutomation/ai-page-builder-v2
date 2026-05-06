# 🌱 AI Page Builder V2 — Comprehensive Seed Data

Complete seed data package for testing the AI Page Builder V2 with realistic, production-ready test cases.

## 📊 What's Included

### **5 Sample Pages**
Each page demonstrates different block combinations and use cases:

1. **Home** (`/`)
   - Hero Section with background gradient
   - Stats block showing key metrics
   - Perfect for landing page testing
   - **Blocks:** HeroBlock, StatsBlock

2. **Features** (`/features`)
   - Showcase all core capabilities
   - Feature grid with icons
   - Feature list with descriptions
   - **Blocks:** HeroBlock, CardGridBlock, FeatureListBlock

3. **Pricing** (`/pricing`)
   - Three pricing tiers (Starter, Pro, Enterprise)
   - FAQ section for common questions
   - Highlighted "Pro" plan
   - **Blocks:** HeroBlock, PricingBlock, FAQBlock

4. **Blog** (`/blog`)
   - Gallery of recent posts
   - Timeline of company milestones
   - Team avatars with DiceBear API
   - **Blocks:** HeroBlock, GalleryBlock, TimelineBlock

5. **Contact** (`/contact`)
   - Three contact methods
   - Customer testimonials
   - Final CTA with secondary button
   - **Blocks:** HeroBlock, CardGridBlock, TestimonialBlock, CTABlock

### **All 10 Block Types Demonstrated**
✅ HeroBlock — Full-width hero sections  
✅ CardGridBlock — Feature cards in grid layout  
✅ FeatureListBlock — Vertical feature list  
✅ StatsBlock — Key metrics display  
✅ CTABlock — Call-to-action sections  
✅ FAQBlock — Accordion FAQ sections  
✅ PricingBlock — Pricing plans comparison  
✅ TestimonialBlock — Customer quotes  
✅ TimelineBlock — Chronological events  
✅ GalleryBlock — Image galleries  

### **20 Sample Images**
Realistic image URLs from:
- **Unsplash** — Professional photography (1920×1280, 800×800, 500×500)
- **DiceBear Avatars** — AI-generated avatars for testimonials

```
✓ Hero/background images
✓ Feature showcase images
✓ Product/workspace photos
✓ Avatar images for testimonials
✓ Gallery images for portfolio
```

### **Version History**
- **3-5 versions per page** showing page evolution
- Snapshot labels for easy identification
- Progressive block removal to show editing history
- Created by different test users

### **Audit Logs**
- **14 audit entries** tracking all changes
- Action types: CREATE, UPDATE, PUBLISH
- User attribution (Alice Johnson, Bob Smith)
- Complete change tracking with old/new values

### **Real-time Editor State** (Future)
Ready for `active_editors` table with:
- Current page being edited
- User presence indicators
- Cursor positions
- Block selections

---

## 📁 Generated Files

### **TypeScript Export**
**Location:** `lib/seed-data.ts`

```typescript
export const SEED_PAGES = [...];
export const SEED_PAGE_VERSIONS = [...];
export const SEED_AUDIT_LOGS = [...];
export const SEED_MEDIA = [...];
```

**Usage in your code:**
```typescript
import { SEED_PAGES, SEED_PAGE_VERSIONS } from '@/lib/seed-data';

// Use in tests
const testPage = SEED_PAGES[0];
```

### **SQL INSERT Statements**
**Location:** `sql/seed-inserts.sql`

```sql
-- Automatically generated seed data
-- 5 pages × 20 versions = 100+ records
-- 19 media items
-- 14 audit log entries

SET session_replication_role = replica;

INSERT INTO media (...) VALUES (...);
INSERT INTO pages (...) VALUES (...);
INSERT INTO page_versions (...) VALUES (...);
INSERT INTO audit_logs (...) VALUES (...);

SET session_replication_role = DEFAULT;
```

---

## 🚀 How to Use

### **Option 1: Apply SQL Directly to Supabase**

1. Open [Supabase Dashboard](https://supabase.com)
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy entire content from `sql/seed-inserts.sql`
5. Click **Run** button
6. ✅ Done! All seed data inserted

### **Option 2: Import in TypeScript/Tests**

```typescript
import { SEED_PAGES, SEED_PAGE_VERSIONS } from '@/lib/seed-data';

describe('Page Builder', () => {
  it('renders seed pages correctly', () => {
    const page = SEED_PAGES[0];
    expect(page.slug).toBe('home');
    expect(page.title).toContain('AI Page Builder');
    expect(JSON.parse(page.data).content.length).toBeGreaterThan(0);
  });

  it('has version history', () => {
    const versions = SEED_PAGE_VERSIONS.filter(v => v.page_id === SEED_PAGES[0].id);
    expect(versions.length).toBeGreaterThanOrEqual(3);
  });
});
```

### **Option 3: Node.js Seeding Script**

```typescript
import { createClient } from '@supabase/supabase-js';
import { SEED_PAGES, SEED_MEDIA, SEED_PAGE_VERSIONS, SEED_AUDIT_LOGS } from './lib/seed-data';

const supabase = createClient(URL, KEY);

async function seedDatabase() {
  // Insert media
  const { error: mediaError } = await supabase
    .from('media')
    .insert(SEED_MEDIA);
  
  // Insert pages
  const { error: pagesError } = await supabase
    .from('pages')
    .insert(SEED_PAGES);
  
  // Insert versions
  const { error: versionsError } = await supabase
    .from('page_versions')
    .insert(SEED_PAGE_VERSIONS);
  
  // Insert audit logs
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert(SEED_AUDIT_LOGS);

  console.log('Seeding complete!', { mediaError, pagesError, versionsError, auditError });
}
```

---

## 📊 Data Statistics

| Metric | Count |
|--------|-------|
| **Pages** | 5 |
| **Page Versions** | 20 |
| **Block Instances** | 30+ |
| **Block Types** | 10 |
| **Media Items** | 19 |
| **Audit Log Entries** | 14 |
| **Test Users** | 2 |
| **Published Pages** | 4/5 |

---

## 🔧 Data Structure

### **Pages Table Schema**
```json
{
  "id": "uuid",
  "slug": "string (unique)",
  "title": "string",
  "description": "string",
  "data": {
    "content": [
      {
        "_template": "HeroBlock | CardGridBlock | ...",
        "_id": "block-0",
        // Block-specific props
      }
    ],
    "root": {
      "props": {
        "title": "string",
        "description": "string"
      }
    }
  },
  "published": "boolean",
  "published_at": "timestamp | null",
  "created_by": "uuid (user)",
  "updated_by": "uuid (user)",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "deleted_at": "timestamp | null"
}
```

### **Media Table Schema**
```json
{
  "id": "uuid",
  "bucket_path": "media/0.jpg",
  "filename": "image-0.jpg",
  "mimetype": "image/jpeg",
  "size": 516612,
  "width": 1920,
  "height": 1280,
  "alt_text": "Sample image 1",
  "uploaded_by": "uuid (user)",
  "created_at": "timestamp",
  "deleted_at": "timestamp | null"
}
```

### **Page Versions Table Schema**
```json
{
  "id": "uuid",
  "page_id": "uuid (foreign key)",
  "data": "{ same as pages.data }",
  "label": "Snapshot 1",
  "created_by": "uuid (user)",
  "created_at": "timestamp"
}
```

### **Audit Logs Table Schema**
```json
{
  "id": "uuid",
  "action": "CREATE | UPDATE | PUBLISH",
  "entity_type": "pages",
  "entity_id": "uuid",
  "user_id": "uuid",
  "changes": {
    "old": { "title": "Old Title" },
    "new": { "title": "New Title" }
  },
  "created_at": "timestamp"
}
```

---

## 🧪 Testing Use Cases

### **Visual Editor Testing**
```typescript
test('loads page with all block types', () => {
  const page = SEED_PAGES[1]; // Features page
  const blocks = JSON.parse(page.data).content;
  
  expect(blocks).toContainEqual(expect.objectContaining({
    _template: 'HeroBlock'
  }));
  expect(blocks).toContainEqual(expect.objectContaining({
    _template: 'CardGridBlock'
  }));
  expect(blocks).toContainEqual(expect.objectContaining({
    _template: 'FeatureListBlock'
  }));
});
```

### **Version History Testing**
```typescript
test('can restore previous versions', () => {
  const page = SEED_PAGES[0];
  const versions = SEED_PAGE_VERSIONS.filter(v => v.page_id === page.id);
  
  expect(versions.length).toBeGreaterThan(1);
  
  // Older versions should have fewer blocks
  const firstVersion = versions[0];
  const lastVersion = versions[versions.length - 1];
  
  const firstBlocks = JSON.parse(firstVersion.data).content.length;
  const lastBlocks = JSON.parse(lastVersion.data).content.length;
  
  expect(firstBlocks).toBeLessThanOrEqual(lastBlocks);
});
```

### **Image Handling Testing**
```typescript
test('all image URLs are valid', () => {
  SEED_PAGES.forEach(page => {
    const blocks = JSON.parse(page.data).content;
    blocks.forEach(block => {
      if (block._template === 'GalleryBlock') {
        block.images.forEach(url => {
          expect(url).toMatch(/https:\/\//);
        });
      }
      if (block.bgImage) {
        expect(block.bgImage).toMatch(/https:\/\//);
      }
    });
  });
});
```

### **Audit Trail Testing**
```typescript
test('audit logs track all page changes', () => {
  const homePage = SEED_PAGES[0];
  const logs = SEED_AUDIT_LOGS.filter(l => l.entity_id === homePage.id);
  
  expect(logs.some(l => l.action === 'CREATE')).toBe(true);
  expect(logs.some(l => l.action === 'PUBLISH')).toBe(true);
});
```

---

## 🔐 Security Notes

### **Test User IDs**
- Alice Johnson: `550e8400-e29b-41d4-a716-446655440001`
- Bob Smith: `550e8400-e29b-41d4-a716-446655440002`

These are **test fixtures only** — replace with real user IDs in production.

### **RLS Policies Respected**
All seed data respects Supabase Row-Level Security:
- Published pages are readable by anyone
- Unpublished pages readable only by creator
- Versions readable only by page creator
- All media readable (soft delete support)

---

## 🔄 Regenerating Seed Data

### **Modify the Script**
Edit `scripts/seed-data.ts`:

```typescript
// Add more pages
const PAGES: PageConfig[] = [
  // ... existing pages ...
  {
    slug: "new-page",
    title: "New Page",
    description: "Description",
    blocks: [/* ... */]
  }
];
```

### **Run the Generator**
```bash
# TypeScript execution
npx tsx scripts/seed-data.ts

# Or with Node
node -e "require('./scripts/seed-data.ts')"
```

### **Files Updated**
- ✅ `sql/seed-inserts.sql`
- ✅ `lib/seed-data.ts`

---

## 📝 Page Details

### **Home Page** (`/`)
```
Blocks: 2
- HeroBlock: "Build Beautiful Pages in Minutes"
  - Background gradient
  - CTA button → /signup
- StatsBlock: 4 metrics
  - 50K+ Pages Created
  - 99.9% Uptime
  - 10M+ Blocks Rendered
  - 24/7 Support
```

### **Features Page** (`/features`)
```
Blocks: 3
- HeroBlock: "Powerful Features for Creators"
- CardGridBlock: 6 feature cards (3 columns)
  - Visual Editor, AI Content, 100+ Blocks
  - Version History, Real-time Collab, Analytics
- FeatureListBlock: 4 detailed features
  - Enterprise Security, Lightning Fast
  - Mobile Optimized, SEO Ready
```

### **Pricing Page** (`/pricing`)
```
Blocks: 3
- HeroBlock: "Simple, Transparent Pricing"
- PricingBlock: 3 plans
  - Starter ($0) - highlighted: false
  - Pro ($29) - highlighted: true ⭐
  - Enterprise (Custom)
- FAQBlock: 4 questions
  - Free trial, Payment methods
  - Cancellation, Annual discounts
```

### **Blog Page** (`/blog`)
```
Blocks: 3
- HeroBlock: "The Creator's Blog"
- GalleryBlock: 6 images (3 columns)
  - Workspace, office, design, avatars
- TimelineBlock: 4 events
  - V2 Launch, 1M Pages, Collab, Gemini
```

### **Contact Page** (`/contact`)
```
Blocks: 4
- HeroBlock: "Let's Talk"
- CardGridBlock: 3 contact methods
  - Email, Chat, Status
- TestimonialBlock: 3 testimonials
  - Sarah Chen (Founder)
  - Alex Rodriguez (Manager)
  - Jordan Blake (CEO)
- CTABlock: "Ready to Create?"
  - Primary: Start Free
  - Secondary: Watch Demo
```

---

## 🎯 Next Steps

### **For Development**
1. Apply seed data to Supabase
2. Test all 10 block types render correctly
3. Verify version history functionality
4. Check audit log tracking

### **For QA/Testing**
1. Use published pages for front-end testing
2. Use unpublished pages for editor testing
3. Test version rollback with multiple versions
4. Verify image loading from CDN

### **For E2E Testing**
1. Import `SEED_PAGES` in test files
2. Use page slugs to navigate
3. Verify block props match expectations
4. Test audit log generation

---

## ✅ Validation Checklist

- [x] All 10 block types included
- [x] 20 realistic CDN image URLs
- [x] 5 distinct pages with real use cases
- [x] Version history for each page
- [x] Complete audit trail
- [x] Test user fixtures
- [x] RLS-compliant data
- [x] SQL INSERT statements
- [x] TypeScript export
- [x] Generation script
- [x] Comprehensive documentation

---

## 📚 Resources

- **Schema:** `/sql/schema.sql`
- **Block Config:** `/lib/puck/config.ts`
- **Generation Script:** `/scripts/seed-data.ts`
- **TypeScript Export:** `/lib/seed-data.ts`
- **SQL Inserts:** `/sql/seed-inserts.sql`

---

**Generated:** May 6, 2026  
**AI Page Builder V2** • Production-Ready Seed Data
