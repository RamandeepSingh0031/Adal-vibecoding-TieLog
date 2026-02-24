# TieLog

> A private, offline-first journal for capturing notes about the people you meet.

[![CI](https://github.com/your-org/the-logbook/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/the-logbook/actions/workflows/ci.yml)

---

## What is TieLog?

TieLog is a single-player relationship journal built for partnership professionals. It lets you capture text and audio notes about people without the overhead of a CRM. Organize contacts into **Clusters → Organizations → People**, jot notes offline, and sync silently when you reconnect.

**Core values:** Privacy first · Offline is king · Speed over features

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Auth + Backend | Supabase (PostgreSQL + Auth) |
| Local DB | Dexie (IndexedDB) |
| ORM | Prisma 7 |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS 4 |
| Tests | Vitest + jsdom |

---

## Local Setup

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- A [Supabase](https://supabase.com) project

### 1. Clone & install

```bash
git clone https://github.com/your-org/the-logbook
cd the-logbook
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and database URLs
```

See [`.env.example`](.env.example) for all required variables.

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push        # Apply schema to your Supabase project
```

### 4. Run the development server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Tests with coverage report |
| `npx tsc --noEmit` | TypeScript type check |
| `npx prisma validate` | Validate Prisma schema |

---

## Architecture

```
Browser (client)
  └── Dexie (IndexedDB) — always available, works offline
        ↕ sync (background, online-only)
  Supabase (PostgreSQL + Auth)
    └── Row Level Security enforces user data isolation
```

All writes go to IndexedDB first. When online, the sync engine (`src/lib/sync.ts`) pushes pending changes to Supabase with automatic exponential-backoff retry.

---

## Security

- **HTTP security headers** — CSP, X-Frame-Options, HSTS, and more ([`next.config.ts`](next.config.ts))
- **Supabase RLS** — all tables enforce row-level security scoped to the authenticated user
- **Data isolation** — server-side queries filter by `user_id` and `cluster_id` chains
- **Secrets** — environment variables only; never committed to source control (see `.env.example`)

> ⚠️ **E2EE is a planned milestone.** Note content is currently transmitted over TLS and stored encrypted at rest by Supabase. True client-side end-to-end encryption is tracked as a future sprint.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
4. Ensure CI passes: `npm run lint && npm test && npx tsc --noEmit`
5. Open a pull request against `main`

---

## Privacy

See [`PRIVACY.md`](PRIVACY.md) for our full data-handling policy.

## License

[MIT](LICENSE)
