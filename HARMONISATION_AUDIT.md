# 🔄 HARMONISATION & STANDARDISATION AUDIT
**Status:** COMPREHENSIVE REVIEW IN PROGRESS

## 1. GenKit SDK INTEGRATION
### Current State
- ✅ Using `@genkit-ai/googleai` plugin
- ✅ Model: `gemini-2.0-flash` (free tier)
- ✅ Two flows: generateBlock, generatePage
- ⚠️ Missing: error handling, retry logic, streaming

### Issues to Fix
- [ ] No structured logging in flows
- [ ] No input sanitisation before GenKit
- [ ] Missing fallback models (Flash → Pro)
- [ ] No streaming response support
- [ ] Missing token counting

### Standards to Apply
- All flows use `defineFlow` with typed schemas
- All outputs validated with Zod before dispatch
- Error messages user-friendly, not API raw
- Structured logging: level, context, duration
- Retry logic: 3x with exponential backoff

---

## 2. MCP (Model Context Protocol) STANDARDISATION
### Current State
- ✅ Supabase MCP server created
- ✅ Media MCP server created
- ⚠️ No Linear MCP authentication
- ❌ No error handling standardisation across MCPs

### Issues to Fix
- [ ] Inconsistent error response formats
- [ ] Missing input validation in MCP tools
- [ ] No rate limiting in MCP calls
- [ ] Missing tool descriptions (clarity)
- [ ] No pagination standardisation

### Standards to Apply
- Error: `{ code: string, message: string, context: object }`
- Input validation: Zod in every tool
- Pagination: `limit`, `offset`, `total` on all list tools
- Tool response: `{ status, data, error?, metadata? }`
- Auth: All tools verify user context

---

## 3. SUPABASE INTEGRATION STANDARDISATION
### Current State
- ✅ Schema with RLS policies
- ✅ Client types (public, server, admin)
- ⚠️ No consistent error handling
- ❌ No unified query patterns

### Issues to Fix
- [ ] Inconsistent error wrapping
- [ ] No cursor-based pagination (only offset)
- [ ] Missing `updated_at` triggers on all tables
- [ ] No soft delete standardisation
- [ ] Missing audit log triggers

### Standards to Apply
- All errors: `throw new AppError(code, message, context)`
- Pagination: offset + limit, or cursor-based
- All tables: `created_at`, `updated_at`, `deleted_at`
- Soft deletes: query with `is("deleted_at", null)` always
- Audit: auto-log INSERT, UPDATE, DELETE via trigger

---

## 4. API ROUTE STANDARDISATION
### Current State
- ✅ Zod validation on save routes
- ⚠️ Inconsistent response formats
- ❌ No unified error handling

### Issues to Fix
- [ ] No consistent error response format
- [ ] Missing 429 rate limit responses
- [ ] No middleware for common tasks
- [ ] Missing request ID tracking

### Standards to Apply
```typescript
Success: { status: 200, data: T }
Error: { status: number, error: { code, message, details } }
RateLimit: { status: 429, retryAfter: number }
```

---

## 5. BLOCK SYSTEM CONSISTENCY
### Current State
- ✅ 10 blocks implemented
- ✅ Strict types with AllBlockProps
- ⚠️ Some blocks missing images
- ❌ No lazy loading

### Issues to Fix
- [ ] Gallery block: no image optimization
- [ ] All blocks: no lazy loading
- [ ] Blocks: missing accessibility (alt text, ARIA)
- [ ] No responsive validation

### Standards to Apply
- All blocks: responsive (mobile first)
- All blocks: lazy load children
- All blocks with images: webp + fallback + alt
- All blocks: WCAG 2.1 AA compliance
- All blocks: defaultProps include accessibility

---

## 6. REALTIME SYNC STANDARDISATION
### Current State
- ✅ Supabase Realtime subscriptions planned
- ❌ Not implemented
- ❌ No offline queue

### Standards to Apply
- Single channel per page: `page:${pageId}`
- Events: `page:updated`, `editor:changed`, `editor:lock`
- Queue offline changes in localStorage
- Sync on reconnect with conflict resolution
- Broadcast to `active_editors` table

---

## 7. ERROR HANDLING STANDARDISATION
### Current State
- ❌ Inconsistent error handling
- ❌ No AppError class
- ❌ No error codes (magic strings)

### Standards to Apply
```typescript
// AppError class
class AppError extends Error {
  code: string;
  status: number;
  context: object;
}

// Error codes
AUTH_REQUIRED = 401
FORBIDDEN = 403
NOT_FOUND = 404
VALIDATION_ERROR = 400
RATE_LIMITED = 429
INTERNAL_ERROR = 500
```

---

## 8. LOGGING STANDARDISATION
### Current State
- ❌ Basic `console.error` only
- ❌ No log levels
- ❌ No structured logging

### Standards to Apply
```typescript
// All logs: { timestamp, level, context, message, duration }
log.debug("Fetching page", { slug, userId })
log.info("Page saved", { pageId, version }, 145) // 145ms
log.warn("Slow query", { query, duration: 2000 })
log.error("AI failed", { prompt, error }, 0, err)
```

---

## 9. TESTING STANDARDISATION
### Current State
- ✅ E2E tests exist
- ❌ No unit tests
- ❌ No snapshot tests

### Standards to Apply
- E2E: 360° coverage (auth, edit, AI, save, publish, view)
- Unit: all utilities, hooks, DB functions
- Integration: API routes with mocked Supabase
- Snapshots: block renders, API responses

---

## 10. TYPE SAFETY STANDARDISATION
### Current State
- ✅ TypeScript strict mode
- ⚠️ Some `any` types
- ❌ No branded types for IDs

### Standards to Apply
- No `any` types (use `unknown` + type guard)
- Branded types: `type PageId = string & { __brand: "PageId" }`
- All DB returns: `type DbResult<T> = { data: T; error?: AppError }`
- Zod schemas for all I/O

---

## AUDIT CHECKLIST

### GenKit
- [ ] Structured error handling with codes
- [ ] Retry logic (3x exponential backoff)
- [ ] Input sanitisation before API call
- [ ] Streaming support
- [ ] Token counting for cost tracking
- [ ] Fallback model (Flash → Pro)
- [ ] Structured logging with duration

### MCP
- [ ] Consistent error format across all tools
- [ ] Zod validation on all tool inputs
- [ ] Pagination standardised (limit, offset, total)
- [ ] Tool descriptions clear and complete
- [ ] Rate limiting per user
- [ ] Auth verification in every tool

### Supabase
- [ ] Unified error handling class
- [ ] Cursor pagination on list functions
- [ ] All tables: created_at, updated_at, deleted_at
- [ ] Audit triggers on all tables
- [ ] Realtime subscriptions configured
- [ ] Connection pooling configured

### API Routes
- [ ] Unified response format
- [ ] Middleware for auth, logging, rate limit
- [ ] Request ID tracking
- [ ] 429 rate limit responses
- [ ] Structured error codes

### Blocks
- [ ] All 10 blocks lazy load children
- [ ] All blocks responsive (mobile first)
- [ ] All blocks: webp images + fallback + alt
- [ ] All blocks: WCAG 2.1 AA
- [ ] Gallery block: image optimization

### Testing
- [ ] E2E 360° coverage
- [ ] Unit tests for utilities
- [ ] Integration tests for API
- [ ] Snapshot tests for renders

### Type Safety
- [ ] No `any` types
- [ ] Branded types for entity IDs
- [ ] Zod schemas for all I/O
- [ ] Db result types

---

## NEXT STEPS (Priority Order)

### PHASE 1: Core Fixes (2 hours)
1. Create `AppError` class + error codes
2. Create `Logger` utility + structured logging
3. Standardise API route responses
4. Add Zod validation to MCP tools
5. Fix GenKit error handling

### PHASE 2: Data Layer (2 hours)
6. Standardise Supabase query patterns
7. Add cursor pagination
8. Create `DbResult<T>` type
9. Verify audit triggers

### PHASE 3: Features (2 hours)
10. Lazy load in all blocks
11. Realtime sync subscription
12. Image optimization (Gallery)
13. Accessibility audit (WCAG)

### PHASE 4: Testing (1 hour)
14. Complete E2E coverage
15. Unit tests for utilities
16. Type safety audit (no any)

---

**Total Effort:** ~7 hours for perfect production system
**Status:** READY TO EXECUTE

