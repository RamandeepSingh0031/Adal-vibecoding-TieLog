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
| ORM | Prisma 5 |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS 4 |
| Tests | Vitest + jsdom |
| Payments | Stripe |

---

## User Journey

### 1. Sign Up / Sign In
- **Authentication**: Email/Password or Google OAuth
- New users create an account and land on the dashboard
- Returning users authenticate and sync their data

### 2. Dashboard (Clusters)
- View all Clusters (top-level organization)
- Create, edit, delete Clusters
- Each Cluster contains Organizations

### 3. Cluster View (Organizations)
- View Organizations within a Cluster
- Create, edit, delete Organizations
- Each Organization contains People

### 4. Organization View (People)
- View People within an Organization
- Create, edit, delete People
- Add notes about each person

### 5. Notes
- Create text notes with tags
- Optional audio recording URL
- Notes can be linked to Cluster, Organization, or Person

### 6. Search
- Global search across all notes
- Filter by tags, dates, or content

### 7. Settings
- Profile management (name, avatar)
- Subscription management (Free/Pro/Lifetime tiers)

---

## Local Setup

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (for payments)

### Stripe Testing (Development)

Use Stripe **test keys** for local development:

1. Get test keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Update `.env.local`:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```
3. Test cards: `4242424242424242` (any future expiry + CVC)
4. For webhook testing, use [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```

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
| `npm run test:watch` | Run tests in watch mode |
| `npx tsc --noEmit` | TypeScript type check |
| `npx prisma validate` | Validate Prisma schema |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │  Next.js 16 │    │   Zustand   │    │  React Hook Form    │ │
│  │ (App Router)│    │   (State)   │    │  + Zod Validation   │ │
│  └──────┬──────┘    └─────────────┘    └─────────────────────┘ │
│         │                                                      │
│  ┌──────┴──────┐    ┌─────────────┐                            │
│  │   Dexie     │◄──►│  Supabase   │                            │
│  │ (IndexedDB) │    │   (Remote)  │                            │
│  └──────┬──────┘    └──────┬──────┘                            │
│         │                  │                                    │
│         │    ┌─────────────┴─────────────┐                      │
│         └───►│      Sync Engine           │◄──► PostgreSQL      │
│              │   (src/lib/sync.ts)       │    (Supabase)       │
│              └───────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Zustand Store → Dexie (IndexedDB)
                              │
                              ▼ (if online)
                     Supabase Sync with
                     exponential backoff
                              │
                              ▼
                     PostgreSQL (RLS enforced)
```

### Key Modules

| Module | Responsibility |
|--------|---------------|
| `src/lib/auth.ts` | Authentication (Supabase Auth) |
| `src/lib/supabase.ts` | Supabase client configuration |
| `src/lib/prisma.ts` | Prisma client for server-side DB |
| `src/lib/db.ts` | Database operations |
| `src/lib/sync.ts` | Offline-to-online sync engine |
| `src/store/appStore.ts` | Global state management |
| `src/hooks/useAuth.ts` | Authentication hook |

### Route Structure

```
src/app/
├── (authenticated)/
│   ├── dashboard/      # Main cluster view
│   ├── search/         # Global search
│   └── settings/       # User settings
├── api/
│   ├── checkout/       # Stripe checkout
│   ├── profile/       # Profile management
│   └── webhook/stripe/# Stripe webhooks
├── auth/
│   ├── signin/        # Sign in page
│   ├── signup/        # Sign up page
│   └── callback/      # OAuth callback
├── cluster/[id]/      # Cluster/Organization/Person view
└── pricing/           # Pricing page
```

---

## Database Schema

```
Profile (user profile)
  └── Clusters (user's clusters)
        ├── Organizations (within cluster)
        │     ├── People (within organization)
        │     │     └── Notes (linked to person)
        │     └── Notes (linked to organization)
        └── Notes (linked to cluster)
```

---

## Security

- **HTTP security headers** — CSP, X-Frame-Options, HSTS, and more ([`next.config.ts`](next.config.ts))
- **Supabase RLS** — all tables enforce row-level security scoped to the authenticated user
- **Data isolation** — server-side queries filter by `user_id` and `cluster_id` chains
- **Secrets** — environment variables only; never committed to source control (see `.env.example`)
- **Form validation** — Zod schemas validate all inputs server-side

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
