# Routes Documentation

## Overview
This document lists all routes in the TieLog application with their protected status.

## Pages

| Route | File | Protected | Notes |
|-------|------|-----------|-------|
| `/` | `src/app/page.tsx` | ❌ Public | Landing page |
| `/auth/signin` | `src/app/auth/signin/page.tsx` | ❌ Public | Sign in page |
| `/auth/signup` | `src/app/auth/signup/page.tsx` | ❌ Public | Sign up page |
| `/auth/callback` | `src/app/auth/callback/route.ts` | ❌ Public | OAuth callback handler |
| `/pricing` | `src/app/pricing/page.tsx` | ❌ Public | Pricing page |
| `/dashboard` | `src/app/(authenticated)/dashboard/page.tsx` | ✅ Protected | Dashboard (requires auth) |
| `/settings` | `src/app/(authenticated)/settings/page.tsx` | ✅ Protected | User settings (requires auth) |
| `/search` | `src/app/(authenticated)/search/page.tsx` | ✅ Protected | Search page (requires auth) |
| `/cluster/[id]` | `src/app/cluster/[id]/page.tsx` | ✅ Protected | Cluster detail (requires auth) |

## API Routes

| Route | File | Protected | Notes |
|-------|------|-----------|-------|
| `/api/healthz` | `src/app/api/healthz/route.ts` | ❌ Public | Health check, no auth required |
| `/api/webhook/stripe` | `src/app/api/webhook/stripe/route.ts` | ❌ Public | Stripe webhook (verifies signature) |
| `/api/checkout` | `src/app/api/checkout/route.ts` | ✅ Protected | Creates Stripe checkout session |
| `/api/profile` | `src/app/api/profile/route.ts` | ✅ Protected | User profile operations |

## Authentication Mechanism

- **Client-side auth**: Uses Supabase Auth (via `src/lib/auth.ts` and `src/hooks/useAuth.ts`)
- **Protected routes**: Grouped under `(authenticated)` folder in App Router
- **No middleware**: Authentication is handled client-side (no `middleware.ts`)
- **Auth state**: Managed via `supabase.auth.getSession()` and `supabase.auth.getUser()`

## Notes

- Routes under `(authenticated)` display a Sidebar component for navigation
- Protected API routes likely verify session via Supabase client
- OAuth providers supported: Google, GitHub (via `signInWithOAuth`)
