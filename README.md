# AI Page Builder v2

**Production AI-powered visual page builder** with integrated CMS, multi-model AI generation, and enterprise-grade architecture. Built for real client platforms.

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/E2E%20Tests-12%20suites-brightgreen?style=flat)]()
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat)]()

---

## What it does

- Visual drag-and-drop page building with Puck editor
- AI page and block generation via Claude, Gemini, and OpenRouter
- In-browser AI inference with Transformers.js
- Git-backed CMS with full version history and restore
- Admin dashboard with pages, media, plugins, and settings
- Supabase auth with RLS policies on all tables

---

## Stack

```
Frontend      Next.js 16 · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Puck
AI            Claude · Gemini · OpenRouter · Transformers.js · GenKit
Backend       Next.js API routes · Supabase · PostgreSQL · Zod validation
Testing       Playwright E2E · Jest unit tests
Deployment    Vercel-ready
```

---

## Key numbers

| | |
|---|---|
| Block types | 10+ |
| API routes | 13+ |
| Database tables | 8 with RLS |
| E2E test suites | 12 |
| TypeScript coverage | 100% |

---

## Quick start

```bash
cp .env.example .env.local
# Add SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SECRET_KEY, GEMINI_API_KEY
npm install
npm run dev
# Open http://localhost:3000/edit/test
```

---

## Built by

> [Cerison Brown](https://github.com/CerisonAutomation) — Automation Engineer specialising in AI workflow engineering, systems integration, and production automation.
