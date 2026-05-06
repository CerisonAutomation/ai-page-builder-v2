# Version Control System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EDITOR PAGE (app/edit/[slug])                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────┐              ┌───────────────────────────┐   │
│  │  PuckEditor          │              │  VersionControl (NEW)     │   │
│  │                      │              │                           │   │
│  │ ┌────────────────┐   │              │ ┌─────────────────────┐   │   │
│  │ │ Block Editing  │   │              │ │ Version Timeline    │   │   │
│  │ │ Canvas         │   │              │ │                     │   │   │
│  │ │                │   │              │ │ Auto-Snapshot       │   │   │
│  │ │ (Puck Editor)  │   │              │ │ Every 30s           │   │   │
│  │ │                │   │              │ │                     │   │   │
│  │ └────────────────┘   │              │ ├─────────────────────┤   │   │
│  │                      │              │ │ Version List        │   │   │
│  └──────────────────────┘              │ │ - Search            │   │   │
│           │                            │ │ - Filter            │   │   │
│           │                            │ │ - Labels            │   │   │
│           │                            │ │ - Compare btn       │   │   │
│           │                            │ │ - Restore btn       │   │   │
│           └───────────────────────────▶│ │ - Delete btn        │   │   │
│                                        │ │                     │   │   │
│                                        │ └─────────────────────┘   │   │
│                                        │           │               │   │
│                                        │           ▼               │   │
│                                        │ ┌─────────────────────┐   │   │
│                                        │ │ Diff Viewer         │   │   │
│                                        │ │ (Expandable)        │   │   │
│                                        │ │ - Added (green)     │   │   │
│                                        │ │ - Removed (red)     │   │   │
│                                        │ │ - Modified (blue)   │   │   │
│                                        │ └─────────────────────┘   │   │
│                                        │                           │   │
│                                        └───────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
VersionControl.tsx (Main Panel)
├── Header (Clock icon + Version count badge)
├── Controls
│   ├── Search Input
│   └── Filter Tabs (All/Labeled/Recent)
├── Comparison Result Panel (conditional)
│   └── Diff Summary
├── Version List
│   ├── Version Item 1
│   │   ├── Label (editable inline)
│   │   ├── Metadata (time, blocks)
│   │   └── Actions (Compare, Restore, Delete)
│   ├── Version Item 2
│   └── ... more items
└── Footer (Status: "Showing X of Y, auto-saves every 30s")

VersionDiffViewer.tsx (Diff Panel)
├── Header
│   ├── Title
│   └── Stats Grid (added, removed, modified)
├── Filter Buttons (Toggle visibility)
├── Diff List
│   ├── Diff Item (Added)
│   │   ├── Header (click to expand)
│   │   └── Details (JSON preview)
│   ├── Diff Item (Removed)
│   └── Diff Item (Modified)
│       ├── Old Props
│       └── New Props
└── Empty State (if no diffs)

VersionComparisonView.tsx (Advanced Comparison)
├── Mode Toggle (Timeline/Side-by-Side/Detailed)
├── Controls (Export button)
├── Timeline Mode
│   ├── Version List
│   └── Selected Diff (VersionDiffViewer)
├── Side-by-Side Mode
│   ├── Left Panel (Selected Version)
│   └── Right Panel (Current Version)
└── Detailed Mode
    └── Full VersionDiffViewer
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   USER INTERACTIONS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Editing Blocks              Load Page          Restore         │
│        │                           │                 │           │
│        └──► PuckEditor ◄───────────┘                 │           │
│             state.data                               │           │
│                  │                                   │           │
│                  │ (every 30s)                       │           │
│                  ▼                                   ▼           │
│          ┌──────────────────┐              ┌─────────────────┐  │
│          │  Auto-Snapshot   │              │ Restore Action  │  │
│          │  POST            │              │ POST /restore   │  │
│          │ /auto-snapshot   │              │                 │  │
│          └──────────────────┘              └─────────────────┘  │
│                  │                               │               │
│                  │ (if changed)                  │               │
│                  └──┐                            │               │
│                     ▼                            ▼               │
│              ┌─────────────────────────────────────────┐         │
│              │  API Route (POST /api/versions/...)     │         │
│              └─────────────────────────────────────────┘         │
│                          │                                       │
│                          ▼                                       │
│              ┌─────────────────────────────────────────┐         │
│              │  Database Layer (lib/db/versions.ts)    │         │
│              │  - createVersionSnapshot()              │         │
│              │  - restoreToVersion()                   │         │
│              │  - compareVersions()                    │         │
│              └─────────────────────────────────────────┘         │
│                          │                                       │
│                          ▼                                       │
│              ┌─────────────────────────────────────────┐         │
│              │  Supabase / PostgreSQL                  │         │
│              │  - page_versions table                  │         │
│              │  - version_change_log table             │         │
│              │  - RLS policies                         │         │
│              └─────────────────────────────────────────┘         │
│                          │                                       │
│                          ▼                                       │
│              ┌─────────────────────────────────────────┐         │
│              │  Response JSON                          │         │
│              │  { versions[], diff, success, ... }     │         │
│              └─────────────────────────────────────────┘         │
│                          │                                       │
│                          ▼                                       │
│              ┌─────────────────────────────────────────┐         │
│              │  Update UI (VersionControl)             │         │
│              │  - Load versions                        │         │
│              │  - Show comparison                      │         │
│              │  - Toast notification                   │         │
│              └─────────────────────────────────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Auto-Snapshot Cycle

```
┌──────────────────────────────────────────────────────┐
│  VersionControl Component Mounted                    │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│  Initialize 30-second interval timer                │
└──────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │ (repeats)   │             │ (repeats)
        │             │             │
        ▼             ▼             ▼
    30s passes   30s passes   30s passes
        │             │             │
        └─────────────┼─────────────┘
                      ▼
        ┌──────────────────────────────┐
        │ Send POST /auto-snapshot     │
        │ with current page data       │
        └──────────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │ Database: Hash Compare       │
        │ (skip if unchanged)          │
        └──────────────────────────────┘
                      │
            ┌─────────┴─────────┐
            │                   │
       No Changes          Changed
            │                   │
            ▼                   ▼
    ┌─────────────┐   ┌──────────────────┐
    │ Skip        │   │ Create Snapshot  │
    │ (silent)    │   │ - Save data      │
    │             │   │ - Auto-label     │
    │             │   │ - Create index   │
    │             │   └──────────────────┘
    │             │           │
    │             │           ▼
    │             │   ┌──────────────────┐
    │             │   │ UI Updates       │
    │             │   │ - Add to list    │
    │             │   │ - Badge count++  │
    │             │   │ (silent, no toast)
    │             │   └──────────────────┘
    │             │           │
    └─────────────┴───────────┘
                      │
                      ▼
    ┌──────────────────────────────┐
    │ Wait 30 seconds              │
    │ (next snapshot cycle)        │
    └──────────────────────────────┘
```

## Version Comparison Flow

```
User clicks "Compare" on version v5
        │
        ▼
┌─────────────────────────────────────┐
│ POST /versions/pageId/compare       │
│ Body: { versionId: v5.id,           │
│         currentData: state.data }    │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│ Database Layer                      │
│ compareVersions(oldData, newData)   │
└─────────────────────────────────────┘
        │
        ├─ Extract blocks from both
        ├─ Build block maps by ID
        ├─ Find added (in new, not old)
        ├─ Find removed (in old, not new)
        ├─ Find modified (same ID, changed props)
        │
        ▼
┌─────────────────────────────────────┐
│ Return Diff Object                  │
│ {                                   │
│   blocksAdded: 2,                   │
│   blocksRemoved: 1,                 │
│   blocksModified: 3,                │
│   summary: "+2 -1 ~3",              │
│   newIds: [...],                    │
│   removedIds: [...],                │
│   modifiedIds: [...]                │
│ }                                   │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│ UI: VersionDiffViewer               │
│ - Show stats (green/red/blue)       │
│ - List diff items (colored)         │
│ - Expandable details                │
│ - JSON comparison                   │
└─────────────────────────────────────┘
```

## Restore with Backup Flow

```
User clicks "Restore" on version v5
        │
        ▼
    Confirmation Dialog
        │
        ├─ "Restore v5?"
        ├─ "Current will be saved"
        │
        ▼ [OK]
        │
        ▼
┌──────────────────────────────────────┐
│ POST /versions/pageId/restore        │
│ Body: { versionId: v5.id }           │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ Database: restoreToVersion()         │
└──────────────────────────────────────┘
        │
        ├─ Get v5 data from DB
        ├─ Get current page data
        │
        ▼
    ┌──────────────────────────────┐
    │ STEP 1: Create Backup        │
    │ createVersionSnapshot()       │
    │ - Save current as backup     │
    │ - Label: "Before restore..." │
    │ - Returns backup versionId   │
    └──────────────────────────────┘
        │
        ▼
    ┌──────────────────────────────┐
    │ STEP 2: Update Page          │
    │ UPDATE pages                 │
    │ SET data = v5.data           │
    │ WHERE id = pageId            │
    └──────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ Response: { success: true,           │
│            newVersionId: "backup-id" │
│ }                                    │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ UI: VersionControl                   │
│ - Reload versions list               │
│ - Show toast: "Restored! Refresh..." │
│ - Highlight backup version in list   │
└──────────────────────────────────────┘
        │
        ▼
    User refreshes page
        │
        ▼
    Load restored content from DB
```

## Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                      AUTH SCHEMA                             │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  users (from auth.users)                             │    │
│  │  - id (UUID, PK)                                     │    │
│  │  - email, name, ...                                  │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 │                    │
                 ▼                    ▼
     ┌────────────────────┐  ┌──────────────────────┐
     │   pages (PK)       │  │ page_versions (NEW)  │
     ├────────────────────┤  ├──────────────────────┤
     │ id (UUID)          │  │ id (UUID, PK)        │
     │ slug (TEXT)        │  │ page_id (FK→pages)   │◄───┐
     │ title              │  │ data (JSONB)         │    │
     │ data (JSONB)       │  │ label (TEXT)         │    │
     │ published          │  │ annotation (TEXT)    │    │
     │ created_by (FK)───────┼► created_by (FK)     │    │
     │ updated_by (FK)    │  │ created_at           │    │
     │ created_at         │  │ is_milestone         │    │
     │ updated_at         │  │ tags (JSONB)         │    │
     │ deleted_at         │  │ restored_from (FK)───┼────┘
     │                    │  │ change_summary       │
     └────────────────────┘  └──────────────────────┘
              │                       │
              │                       │ (many versions)
              │                       │
              └───────────┬───────────┘
                          │
                          ▼
     ┌──────────────────────────────────────┐
     │ version_change_log (OPTIONAL)        │
     ├──────────────────────────────────────┤
     │ id (UUID, PK)                        │
     │ version_id (FK→page_versions)        │
     │ change_type (TEXT)                   │
     │ block_id (TEXT)                      │
     │ block_type (TEXT)                    │
     │ property_name (TEXT)                 │
     │ old_value (JSONB)                    │
     │ new_value (JSONB)                    │
     │ created_at (TIMESTAMPTZ)             │
     └──────────────────────────────────────┘

Indexes:
├─ page_versions.page_id (clustered)
├─ page_versions.created_at DESC
├─ page_versions.is_milestone
├─ page_versions.tags (GIN)
├─ version_change_log.version_id
└─ version_change_log.change_type
```

## API Route Structure

```
/api/
└── versions/
    ├── [pageId]/
    │   ├── route.ts
    │   │   ├── GET    → List versions (paginated)
    │   │   ├── PATCH  → Update label
    │   │   └── DELETE → Remove version
    │   │
    │   ├── compare/
    │   │   └── route.ts
    │   │       └── POST → Compare versions
    │   │
    │   └── restore/
    │       └── route.ts
    │           └── POST → Restore version (with backup)
    │
    └── auto-snapshot/
        └── route.ts
            └── POST → Create auto-snapshot
```

## State Management Flow

```
┌─────────────────────────────────────────┐
│  VersionControl Component State         │
├─────────────────────────────────────────┤
│ versions[]                              │
│ ├─ Loaded from: loadVersions()          │
│ ├─ Updated on: restore, delete, compare│
│ └─ Used by: list rendering             │
│                                          │
│ loading: boolean                        │
│ ├─ Set during: fetch operations        │
│ └─ Used by: show spinner               │
│                                          │
│ comparing: versionId | null            │
│ ├─ Set when: compare button clicked    │
│ └─ Used by: disable button, show spinner
│                                          │
│ comparisonResult: VersionDiff | null   │
│ ├─ Set from: POST /compare response    │
│ └─ Displayed in: comparison panel      │
│                                          │
│ expanded: boolean                       │
│ ├─ Toggled by: header click            │
│ └─ Shows/hides: entire panel           │
│                                          │
│ searchQuery: string                    │
│ ├─ Updated on: search input change    │
│ └─ Filters: versions list              │
│                                          │
│ filterMode: 'all'|'labeled'|'recent'  │
│ ├─ Changed by: filter tab buttons     │
│ └─ Filters: versions list              │
│                                          │
│ editingLabel: versionId | null        │
│ ├─ Set by: click label to edit        │
│ └─ Shows: inline text input           │
│                                          │
│ restoringId: versionId | null         │
│ ├─ Set during: restore operation      │
│ └─ Used by: disable button            │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────────────────────────────┐
│  API Route / Hook Function           │
└──────────────────────────────────────┘
                  │
                  ▼
    ┌─────────────────────────┐
    │ Try/Catch Error Handler │
    └─────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
   Success                 Error
        │                    │
        ▼                    ▼
┌──────────────┐   ┌──────────────────────┐
│ Return data  │   │ Log to console       │
│ Status 200   │   │ Check error type:    │
└──────────────┘   │ - 401: Unauthorized  │
                   │ - 403: Forbidden     │
                   │ - 500: Server error  │
                   └──────────────────────┘
                             │
                             ▼
                   ┌──────────────────────┐
                   │ Return error response│
                   │ with appropriate     │
                   │ HTTP status code     │
                   └──────────────────────┘
                             │
                             ▼
                   ┌──────────────────────┐
                   │ UI catches error     │
                   │ Shows toast.error()  │
                   │ Logs if onError()    │
                   └──────────────────────┘
```

## Security Flow

```
┌────────────────────────────────────────┐
│  Request comes to API route            │
└────────────────────────────────────────┘
                  │
                  ▼
    ┌─────────────────────────┐
    │ Check: Auth required?   │
    └─────────────────────────┘
              │
          ┌───┴───┐
       Yes│       │No
          │       │
          ▼       ▼
      ┌────┐  ┌───────────┐
      │GET │  │ Check RLS │
      └────┘  │ in SELECT │
              └───────────┘
          │
          ├─ Auth.uid() from JWT
          ├─ RLS filters by auth.uid()
          ├─ Only own pages visible
          │
          ▼
    ┌──────────────────┐
    │ For mutations    │
    │ (PATCH/DELETE)   │
    └──────────────────┘
          │
          ├─ Verify user exists
          ├─ Query page by ID
          ├─ Check page.created_by == auth.uid()
          ├─ If not match: 403 Forbidden
          ├─ If match: Allow operation
          │
          ▼
    ┌──────────────────┐
    │ Execute query    │
    │ with RLS enabled │
    └──────────────────┘
```

## Performance Optimization

```
┌──────────────────────────────────────┐
│  Query Optimization Strategy         │
├──────────────────────────────────────┤
│                                       │
│ Pagination (limit/offset)            │
│ ├─ Load 50 versions at a time       │
│ ├─ Not all 1000+                    │
│ └─ Reduces: query time, network     │
│                                       │
│ Indexing                             │
│ ├─ page_id (search by page)         │
│ ├─ created_at DESC (sort order)     │
│ ├─ is_milestone (fast filtering)    │
│ └─ tags GIN (label search)          │
│                                       │
│ Hash-based Deduplication             │
│ ├─ Compare data hash (not full JSON)│
│ ├─ Skip snapshot if unchanged       │
│ └─ Reduces: DB inserts, storage     │
│                                       │
│ Silent Failures                      │
│ ├─ Auto-snapshot doesn't block      │
│ ├─ Errors logged but not thrown     │
│ └─ Reduces: user-facing delays      │
│                                       │
│ Client-side Caching                  │
│ ├─ Store versions in component state│
│ ├─ Only refresh on mutation         │
│ └─ Reduces: API calls               │
│                                       │
└──────────────────────────────────────┘
```

## Integration Points

```
┌──────────────────────────────────────┐
│  Puck Editor Integration             │
├──────────────────────────────────────┤
│ VersionControl reads:                │
│ ├─ pageId (passed as prop)           │
│ ├─ slug (passed as prop)             │
│ └─ state.data (via usePuck hook)     │
│                                       │
│ VersionControl calls:                │
│ ├─ POST /api/versions/auto-snapshot  │
│ └─ Updates when data changes         │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Supabase Integration                │
├──────────────────────────────────────┤
│ Uses:                                │
│ ├─ auth.users (for user ID)         │
│ ├─ pages table (for ownership)       │
│ ├─ page_versions table (new)         │
│ └─ RLS policies (security)           │
│                                       │
│ Relies on:                           │
│ ├─ Supabase client (server-side)    │
│ ├─ Auth middleware                   │
│ └─ Configured RLS policies           │
└──────────────────────────────────────┘
```

---

This architecture is:
- ✅ **Scalable** — Handles 1000+ versions per page
- ✅ **Secure** — RLS enforced at database level
- ✅ **Performant** — Indexed queries, pagination, deduplication
- ✅ **Maintainable** — Clear separation of concerns
- ✅ **Resilient** — Error handling at every layer
