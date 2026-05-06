# Quick Integration Example

## Minimal Setup (Copy-Paste)

### Step 1: Add to Editor Page

**File**: `app/(editor)/edit/[slug]/page.tsx`

```typescript
// Add these imports
import { VersionControl } from "@/components/editor/VersionControl";

// In your page component, wrap editor with version control:
export default async function EditPage({ params }: EditPageProps) {
  try {
    const page = await getPageBySlug(params.slug);
    const initialData = page?.data ?? emptyPage;
    const pageId = page?.id ?? null;

    return (
      <Suspense fallback={<EditorSkeleton />}>
        <div className="flex gap-4 h-screen">
          {/* Editor takes up most space */}
          <div className="flex-1">
            <PuckEditor
              slug={params.slug}
              pageId={pageId}
              initialData={initialData}
              title={page?.title ?? "New Page"}
              description={page?.description ?? ""}
            />
          </div>

          {/* Version Control sidebar on right */}
          <div className="w-96 border-l bg-white overflow-y-auto">
            <VersionControl pageId={pageId} slug={params.slug} />
          </div>
        </div>
      </Suspense>
    );
  } catch (error) {
    console.error("[EditPage]", error);
    return (
      <Suspense fallback={<EditorSkeleton />}>
        <PuckEditor
          slug={params.slug}
          pageId={null}
          initialData={emptyPage}
          title="New Page"
          description=""
        />
      </Suspense>
    );
  }
}
```

### Step 2: Run Database Migration

In Supabase SQL Editor, run:

```sql
-- ✅ Copy-paste entire content of:
-- /workspace/ai-page-builder-v2/sql/migrations/002-version-annotations.sql

-- This adds:
-- - annotation TEXT
-- - tags JSONB
-- - change_summary TEXT
-- - is_milestone BOOLEAN
-- - restored_from UUID
-- - version_change_log table
-- - necessary indexes
```

That's it! You now have:

✅ Auto-snapshots every 30 seconds
✅ Version history sidebar
✅ Search & filter
✅ Compare versions
✅ One-click restore
✅ Edit labels
✅ Delete versions
✅ Diff viewer

## Advanced: Use Hook in Component

If you want manual control in your own component:

```typescript
"use client";

import { useVersionControl } from "@/lib/hooks/useVersionControl";
import { usePuck } from "@measured/puck";

export function MyVersionButton() {
  const { state } = usePuck();
  const {
    createSnapshot,
    restoreVersion,
    compareVersions,
    versions,
  } = useVersionControl({
    pageId: "page-123",
    enabled: true,
  });

  return (
    <div className="space-y-2">
      {/* Manual Snapshot Button */}
      <button
        onClick={() =>
          createSnapshot(
            state.data,
            `Snapshot at ${new Date().toLocaleTimeString()}`
          )
        }
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Save Snapshot
      </button>

      {/* Restore to First Version */}
      <button
        onClick={() => {
          if (versions.length > 0) {
            restoreVersion(versions[versions.length - 1].id);
          }
        }}
        className="px-4 py-2 border rounded"
      >
        Restore to Earliest
      </button>

      {/* Compare with Version */}
      <button
        onClick={async () => {
          if (versions.length > 0) {
            const diff = await compareVersions(
              versions[0].id,
              state.data
            );
            console.log("Diff:", diff);
          }
        }}
        className="px-4 py-2 border rounded"
      >
        Compare with Latest
      </button>

      {/* List All Versions */}
      <div className="mt-4 border rounded p-3">
        <p className="text-sm font-medium mb-2">Recent Versions:</p>
        {versions.slice(0, 5).map((v) => (
          <div key={v.id} className="text-xs text-slate-600">
            {v.label} ({v.blocks_count} blocks)
          </div>
        ))}
      </div>
    </div>
  );
}
```

## API Usage Examples

### Get all versions
```bash
curl -X GET "http://localhost:3000/api/versions/page-id-123?limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

### Compare versions
```bash
curl -X POST "http://localhost:3000/api/versions/page-id-123/compare" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "versionId": "version-id-456",
    "currentData": {
      "content": [],
      "root": { "props": {} }
    }
  }'
```

### Restore version
```bash
curl -X POST "http://localhost:3000/api/versions/page-id-123/restore" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "versionId": "version-id-456",
    "label": "Restored homepage design"
  }'
```

### Update label
```bash
curl -X PATCH "http://localhost:3000/api/versions/page-id-123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "versionId": "version-id-456",
    "label": "New Label"
  }'
```

### Delete version
```bash
curl -X DELETE "http://localhost:3000/api/versions/page-id-123/version-id-456" \
  -H "Authorization: Bearer $TOKEN"
```

## Common Questions

### Q: Why isn't auto-snapshot creating versions?
A: Check that:
1. pageId is not null
2. You're authenticated (check auth.uid())
3. Page exists in database
4. Check browser console for fetch errors

### Q: How do I disable auto-snapshot?
A: In VersionControl component, comment out the auto-snapshot effect:

```typescript
// Disable auto-snapshot
/*
useEffect(() => {
  if (!pageId) return;
  const interval = setInterval(async () => {
    // ...
  }, 30000);
  return () => clearInterval(interval);
}, [pageId, state.data]);
*/
```

### Q: Can I change snapshot frequency?
A: In VersionControl component, change the interval:

```typescript
useEffect(() => {
  if (!pageId) return;
  
  // Change 30000 to desired milliseconds
  const interval = setInterval(async () => {
    // ...
  }, 5000); // 5 seconds instead of 30
  
  return () => clearInterval(interval);
}, [pageId, state.data]);
```

### Q: How do I export a version?
A: In VersionComparisonView, click "Export" button. Downloads JSON.

### Q: Can I restore without creating a backup?
A: Currently, restore always creates a backup. To change:

In `lib/db/versions.ts`, modify `restoreToVersion()`:

```typescript
// Remove this section to skip backup:
const beforeRestore = await createVersionSnapshot(
  pageId,
  page.data,
  userId,
  label || `Before restore from ${version.label || "earlier version"}`
);
```

### Q: How do I delete old versions automatically?
A: Add a cron job:

```typescript
// pages/api/cron/cleanup-versions.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createAdminClient();
  
  // Delete versions older than 30 days
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const { error } = await supabase
    .from("page_versions")
    .delete()
    .lt("created_at", cutoff.toISOString());
  
  if (error) return res.status(500).json({ error });
  return res.json({ success: true });
}
```

## Testing Checklist

- [ ] Create new page
- [ ] Wait 30 seconds
- [ ] Check sidebar for auto-snapshot
- [ ] Edit some blocks
- [ ] Click Compare on version
- [ ] See diff in comparison panel
- [ ] Click Restore
- [ ] Confirm dialog appears
- [ ] Check page data updated
- [ ] Verify backup snapshot created
- [ ] Edit label inline
- [ ] Search for version
- [ ] Filter by "Labeled"
- [ ] Delete a version
- [ ] Verify toast notifications work

## Full Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `lib/db/versions.ts` | DB operations | 327 |
| `components/editor/VersionControl.tsx` | Main UI | 511 |
| `components/editor/VersionDiffViewer.tsx` | Diff viewer | 301 |
| `components/editor/VersionComparisonView.tsx` | Comparison UI | 317 |
| `lib/hooks/useVersionControl.ts` | React hook | 251 |
| `app/api/versions/[pageId]/route.ts` | GET/PATCH/DELETE | 129 |
| `app/api/versions/[pageId]/compare/route.ts` | Compare | 53 |
| `app/api/versions/[pageId]/restore/route.ts` | Restore | 47 |
| `app/api/versions/auto-snapshot/route.ts` | Auto-save | 73 |
| `sql/migrations/002-version-annotations.sql` | DB schema | 42 |

**Total: ~2,050 lines of production code**

## What You Get

✅ Full version history UI
✅ Auto-snapshots every 30 seconds
✅ One-click restore with backups
✅ Detailed diff viewer
✅ Version comparison (3 modes)
✅ Label & search
✅ RLS-secure
✅ TypeScript types
✅ Error handling
✅ Toast notifications
✅ Responsive UI
✅ Performance optimized

Ready to use! Just copy-paste and run migration.
