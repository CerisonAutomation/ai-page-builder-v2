# MCP Configuration — Access Docs & Database in Conversations

**MCP = Model Context Protocol** — Allows Claude/Cursor to access external tools directly in conversations.

---

## ✅ CONFIGURED SERVERS

### 1. Linear (Project Management)
**Status:** Needs authentication
**What it does:** Access Linear issues, projects, and workflows directly

**Setup:**
```bash
assistant mcp auth linear
# Opens browser for OAuth login
# After login, tokens auto-saved
```

---

### 2. Supabase Local (Database)
**Status:** Ready (needs .env.local)
**What it does:** Query/manage pages, media, audit logs

**Setup:**
```bash
# 1. Ensure .env.local has these:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...

# 2. Tools available:
# - query_pages         (get all pages with filters)
# - get_page           (fetch one page by slug)
# - save_page          (create/update page)
# - list_pages         (with pagination)
# - delete_page        (soft delete)
# - get_versions       (version history)
# - list_media         (media library)
# - get_audit_logs     (track changes)
```

**Example Usage in Conversation:**
```
"Show me all published pages"
→ Uses query_pages tool with published=true filter

"Get page version history for page-id-123"
→ Uses get_versions tool

"Save this Puck data to the test page"
→ Uses save_page tool
```

---

## 🚀 AFTER SETUP: Restart Vellum

After running `assistant mcp auth linear` or setting up .env.local:

1. **Quit Vellum app** (Cmd+Q)
2. **Relaunch Vellum**
3. **Start new conversation**
4. Tools will be available automatically

---

## 📝 WHAT EACH TOOL DOES

### query_pages
```
Input: { filters?: { published?: bool }, limit?: 20 }
Output: { pages: Array<{id, slug, title, ...}> }
Use when: "Show me all pages", "List published pages"
```

### get_page
```
Input: { slug: string }
Output: { id, slug, title, data, published, ... }
Use when: "Get the homepage", "Show me the test page"
```

### save_page
```
Input: { slug, title, data, published? }
Output: { saved: true, page }
Use when: Creating or updating a page
```

### list_pages
```
Input: { published_only?: bool, limit?: 20, offset?: 0 }
Output: { pages: [], count: number }
Use when: Browse pages with pagination
```

### delete_page
```
Input: { slug }
Output: { deleted: true }
Use when: Remove a page (soft delete)
```

### get_versions
```
Input: { page_id, limit?: 10 }
Output: { versions: Array<{id, data, label, created_at}> }
Use when: See page history
```

### list_media
```
Input: { limit?: 20 }
Output: { media: Array<{id, filename, url, ...}> }
Use when: Browse uploaded images
```

### get_audit_logs
```
Input: { entity_id, limit?: 50 }
Output: { logs: Array<{action, user_id, changes, ...}> }
Use when: Track changes to a page
```

---

## 🔧 TROUBLESHOOTING

### "Supabase MCP Error: Connection closed"
**Cause:** Missing or invalid environment variables

**Fix:**
```bash
# Check .env.local has both:
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SECRET_KEY

# If missing, set them:
# 1. Get from Supabase dashboard
# 2. Add to .env.local
# 3. Quit & relaunch Vellum
```

### "Linear needs authentication"
**Fix:**
```bash
assistant mcp auth linear
# Browser window opens → Login → Done
```

### "Tool not available"
**Cause:** MCP server not reloaded

**Fix:**
```bash
# Quit Vellum completely
# Relaunch Vellum
# Start new conversation
```

---

## 📚 HOW TO USE IN CONVERSATIONS

### Example 1: Check Database State
```
User: "What pages do we have?"
Claude: Uses query_pages tool
→ Lists all pages with titles, status, dates
```

### Example 2: Review Audit Trail
```
User: "Show me who edited the homepage and when"
Claude: Uses get_page to get page ID
        Uses get_audit_logs to show changes
→ Lists all modifications with user + timestamp
```

### Example 3: Version Management
```
User: "What changes were made to the landing page?"
Claude: Uses get_page by slug "landing"
        Uses get_versions to show history
→ Shows all snapshots with timestamps
```

### Example 4: Database Queries
```
User: "I need to publish page test-123"
Claude: Uses save_page with published=true
→ Confirms page published
```

---

## 🔐 SECURITY NOTES

✅ **What's safe:**
- Querying data (get_page, query_pages, list_media)
- Creating/updating pages (save_page)
- Viewing audit logs
- Soft deletes

⚠️ **Be careful:**
- Don't expose credentials in conversation
- Keep SUPABASE_SECRET_KEY in .env.local (not shared)
- MCP server runs locally (no cloud calls)

---

## 📖 QUICK REFERENCE

| Tool | Input | Output |
|------|-------|--------|
| query_pages | filters, limit | pages[] |
| get_page | slug | page |
| save_page | slug, title, data | page |
| list_pages | published_only, limit, offset | pages[] |
| delete_page | slug | {deleted:true} |
| get_versions | page_id, limit | versions[] |
| list_media | limit | media[] |
| get_audit_logs | entity_id, limit | logs[] |

---

## 🎯 NEXT STEPS

1. **Add to .env.local:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SECRET_KEY=...
   ```

2. **Authenticate Linear (optional):**
   ```bash
   assistant mcp auth linear
   ```

3. **Quit & restart Vellum**

4. **Try in new conversation:**
   - "What pages exist?"
   - "Show me the test page"
   - "Get version history for page-id-xyz"

---

## 🛠️ ADVANCED: Custom Tools

Want to add more tools? Edit `mcp-supabase-server.js`:

```javascript
// Add new tool to tools/list response
{
  name: "my_new_tool",
  description: "What it does",
  inputSchema: { type: "object", properties: {...} }
}

// Add handler in executeTool()
case "my_new_tool": {
  // your logic here
}
```

Then restart: `assistant mcp add supabase-local ...`

---

**MCP Configured:** ✅ Supabase + Linear ready to use
**Next:** Set .env.local → Restart Vellum → Use in conversations
