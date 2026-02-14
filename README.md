# Proposal Calculator MVP

## Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Supabase (Postgres)
- Clerk (Auth)
- Zustand (state + persistence)
- Vitest (unit tests)

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Required env vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_API_KEY`

## Database
Run `supabase/schema.sql` in Supabase SQL editor.

## Implemented deliverables
- UI skeleton with requested component structure
- Zustand global state with local persistence
- Pure pricing engine in `src/lib/calcProposal.ts`
- Save draft API (`POST /api/proposals`) using Supabase + Clerk auth
- Export proposal as Markdown download
- Unit tests for minimum charge and multiplier behavior

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
