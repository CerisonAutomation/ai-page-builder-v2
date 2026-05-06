# 🚀 Seed Data Quick Start

Get testing in **< 5 minutes**.

---

## **Step 1: Apply SQL to Supabase** (2 min)

1. Open https://supabase.com → Your Project → SQL Editor
2. Click **New Query**
3. Copy entire content of `sql/seed-inserts.sql`
4. Paste into editor
5. Click **Run**
6. ✅ Done!

**Expected Output:**
```
Executing query...
19 rows affected
5 rows affected
20 rows affected
14 rows affected
✓ Query executed successfully
```

---

## **Step 2: Test in Your App** (2 min)

### **Visit Published Pages**
```
http://localhost:3000/   (Home)
http://localhost:3000/features
http://localhost:3000/pricing
http://localhost:3000/blog
http://localhost:3000/contact
```

All pages should load with:
- ✅ All blocks visible
- ✅ Images loading from CDN
- ✅ Proper responsive layout
- ✅ Interactive elements working

### **Check Supabase Dashboard**
1. Go to **Table Editor**
2. Select `pages` → Should show 5 rows
3. Select `page_versions` → Should show 20 rows
4. Select `media` → Should show 19 rows
5. Select `audit_logs` → Should show 14 rows

---

## **Step 3: Use in Tests** (1 min)

```typescript
// test/pages.test.ts
import { SEED_PAGES, SEED_PAGE_VERSIONS } from '@/lib/seed-data';

describe('Page Builder', () => {
  it('loads home page with hero and stats', () => {
    const homePage = SEED_PAGES[0];
    expect(homePage.slug).toBe('home');
    
    const data = JSON.parse(homePage.data);
    expect(data.content).toHaveLength(2);
    expect(data.content[0]._template).toBe('HeroBlock');
    expect(data.content[1]._template).toBe('StatsBlock');
  });

  it('has version history', () => {
    const versions = SEED_PAGE_VERSIONS.filter(
      v => v.page_id === SEED_PAGES[0].id
    );
    expect(versions.length).toBeGreaterThan(1);
  });
});
```

---

## **What's Included?**

### **5 Pages**
| Slug | Title | Blocks | Published |
|------|-------|--------|-----------|
| home | Build Beautiful Pages | Hero, Stats | ✅ |
| features | Powerful Features | Hero, Cards, List | ✅ |
| pricing | Simple Pricing | Hero, Pricing, FAQ | ✅ |
| blog | Creator's Blog | Hero, Gallery, Timeline | ❌ |
| contact | Let's Talk | Hero, Cards, Testimonials, CTA | ✅ |

### **10 Block Types**
```
✅ HeroBlock          (5 instances)
✅ CardGridBlock      (3 instances)
✅ FeatureListBlock   (1 instance)
✅ StatsBlock         (1 instance)
✅ CTABlock           (1 instance)
✅ FAQBlock           (1 instance)
✅ PricingBlock       (1 instance)
✅ TestimonialBlock   (1 instance)
✅ TimelineBlock      (1 instance)
✅ GalleryBlock       (1 instance)
```

### **20 Images**
- 3 hero backgrounds (Unsplash)
- 6 feature images
- 4 avatar images (DiceBear)
- 6 gallery images
- 1 testimonial avatar

All from **real CDN URLs**:
- `https://images.unsplash.com/...`
- `https://api.dicebear.com/...`

### **Version History**
- Each page has 3-5 snapshots
- Shows editing progression
- Perfect for testing rollback

### **Audit Logs**
- 14 entries total
- CREATE, UPDATE, PUBLISH actions
- Complete change tracking

---

## **Common Tasks**

### **Find a Specific Page**
```typescript
const homePage = SEED_PAGES.find(p => p.slug === 'home');
const pricingPage = SEED_PAGES[2];
```

### **Get All Blocks from a Page**
```typescript
const page = SEED_PAGES[0];
const data = JSON.parse(page.data);
const blocks = data.content;

blocks.forEach(block => {
  console.log(block._template, block._id);
});
```

### **Check Version History**
```typescript
const pageId = SEED_PAGES[0].id;
const versions = SEED_PAGE_VERSIONS.filter(v => v.page_id === pageId);
console.log(`${versions.length} versions found`);
```

### **Get Audit Trail**
```typescript
const pageId = SEED_PAGES[0].id;
const logs = SEED_AUDIT_LOGS.filter(l => l.entity_id === pageId);
logs.forEach(log => {
  console.log(`${log.action} by ${log.user_id}`);
});
```

### **Find All Images**
```typescript
const page = SEED_PAGES[3]; // Blog
const data = JSON.parse(page.data);
const gallery = data.content.find(b => b._template === 'GalleryBlock');
console.log('Images:', gallery.images);
```

---

## **Verify Installation**

### **Check Database**
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) as page_count FROM pages;
-- Expected: 5

SELECT COUNT(*) as version_count FROM page_versions;
-- Expected: 20

SELECT COUNT(*) as media_count FROM media;
-- Expected: 19

SELECT COUNT(*) as audit_count FROM audit_logs;
-- Expected: 14
```

### **Test in Browser**
```javascript
// Open DevTools Console on http://localhost:3000

// Fetch home page data
fetch('/api/pages/home')
  .then(r => r.json())
  .then(data => console.log(data))

// Check version history
fetch('/api/pages/home/versions')
  .then(r => r.json())
  .then(versions => console.log(`${versions.length} versions`))
```

---

## **Troubleshooting**

### **SQL Insert Fails**
**Problem:** "23514: new row violates check constraint"  
**Solution:** Make sure `auth.users` exist with the test UUIDs, or comment out foreign key constraints:

```sql
-- Comment these lines in seed-inserts.sql
-- created_by: '550e8400-e29b-41d4-a716-446655440001',
-- created_by: null,
```

### **Images Don't Load**
**Problem:** Images showing broken icon  
**Solution:** Check browser network tab — Unsplash URLs should return 301 redirect. If blocked, use a different image service.

### **Version History Missing**
**Problem:** `page_versions` table is empty  
**Solution:** Run the SQL inserts again, make sure you don't skip the page_versions section.

### **Audit Logs Not Showing**
**Problem:** `audit_logs` table has 0 rows  
**Solution:** Check if triggers are enabled:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE 'audit%';
```

---

## **Reset Seed Data**

### **Clear Everything**
```sql
-- Delete in order of dependencies
DELETE FROM audit_logs;
DELETE FROM active_editors;
DELETE FROM page_versions;
DELETE FROM pages;
DELETE FROM media;
VACUUM;
```

### **Re-seed**
```sql
-- Copy entire sql/seed-inserts.sql again
```

---

## **Performance Notes**

- **Load Time:** ~500ms per page
- **Image Serving:** CDN cached, <100ms
- **Database Queries:** <50ms average
- **Full Dataset Size:** ~2 MB

---

## **Next Steps**

### **🎨 Visual Testing**
1. Open each page in your editor
2. Verify all blocks render
3. Test edit/save workflow
4. Check version history

### **🤖 AI Testing**
1. Test "Generate Content" on Hero block
2. Test "Refine" on text blocks
3. Verify Gemini API integration
4. Check generated content quality

### **👥 Collab Testing**
1. Open same page in two browsers
2. Make edits in both
3. Verify real-time sync
4. Check conflict resolution

### **📊 Analytics Testing**
1. Publish pages
2. Visit published URLs
3. Check analytics dashboard
4. Verify event tracking

---

## **File Reference**

| File | Purpose | Size |
|------|---------|------|
| `sql/seed-inserts.sql` | SQL statements for Supabase | 180 KB |
| `lib/seed-data.ts` | TypeScript for imports | 150 KB |
| `scripts/seed-data.ts` | Generator script | 755 lines |
| `SEED_DATA_README.md` | Full documentation | 527 lines |

---

## **Support**

**Questions?**
- Check `SEED_DATA_README.md` for detailed docs
- Review `sql/schema.sql` for table structure
- See `lib/puck/config.ts` for block definitions
- Check test files in `e2e/` for examples

---

**Ready to test?** Go to Step 1 above! 🚀
