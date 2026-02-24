# Changelog

All notable changes to TieLog are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- `GET /api/healthz` — liveness + readiness probe endpoint for uptime monitoring
- `src/lib/logger.ts` — structured JSON logger compatible with Vercel Log Drains; replaces raw `console.*` calls
- `src/components/ErrorBoundary.tsx` — React error boundary with friendly fallback UI and structured logging
- `.env.example` — environment variable template for contributors
- `.github/workflows/ci.yml` — GitHub Actions CI pipeline (lint, typecheck, Prisma validate, unit tests)
- `vitest.config.ts` — Vitest test runner configuration with jsdom and V8 coverage
- `src/__tests__/sync.test.ts` — unit tests for sync engine (isolation, retry logic, empty-queue short-circuit)
- `src/__tests__/logger.test.ts` — unit tests for structured logger output
- `PRIVACY.md` — GDPR-style data-handling and privacy policy

### Changed
- **`src/lib/sync.ts`** — **Critical fix:** `fetchFromSupabase()` now filters `organizations`, `people`, and `notes` by ownership chain (`cluster_id`/`organization_id`) instead of fetching all records; adds exponential-backoff retry to `syncToSupabase()`
- **`next.config.ts`** — Added HTTP security headers: CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`
- **`src/components/NoteEditor.tsx`** — Fixed audio blob memory leak: `URL.revokeObjectURL()` called on unmount and `audioUrl` change; memoized callbacks with `useCallback`
- **`src/components/Sidebar.tsx`** — Added `aria-current="page"` to active nav links; `aria-expanded` and `aria-label` to profile dropdown button
- **`package.json`** — Added `test`, `test:watch`, and `test:coverage` scripts; added `vitest`, `@vitest/coverage-v8`, `jsdom` devDependencies
- **`README.md`** — Replaced boilerplate with project-specific setup guide, architecture overview, and contributing instructions

### Security
- Data isolation bug: user A could no longer load user B's organizations/people/notes (was fetching all rows without user scoping)
- CSP header blocks unauthorized script sources, inline eval is limited to Next.js development mode

---

## [0.1.0] — 2026-02-20

### Added
- Initial MVP: landing page, authentication (email + OAuth), cluster → organization → person hierarchy
- Offline-first architecture with Dexie IndexedDB + Supabase sync queue
- Note editor with audio recording via MediaRecorder API
- Real-time online/offline detection
- Pricing page (Starter / Pro / Lifetime tiers)
