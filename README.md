# Voice Flex

Guided SOVT voice training for people who bought a Voice Flex product (Pro, GO or Core) on Amazon. Customers unlock training with their Amazon order number. There's no account and no password.

## How it works

1. The customer enters their Amazon order number on the home page.
2. `/api/verify-order` looks the order up in Supabase (`amazon_order_access`). It has to be shipped and be a Voice Flex ASIN. The ASIN picks the training path: `/train/pro`, `/train/go` or `/train/core`. GO and Pro ASINs come from environment variables, Core ASINs are set in `lib/order-progress-server.ts`.
3. The first visit shows a setup walkthrough, then the guided session. Exercises, timings, images and audio live in the code (`lib/training-sessions.ts`, `lib/training-onboarding.ts`, `public/`).
4. Each finished exercise is saved in the browser and sent to `/api/progress/complete-exercise`, which updates `voiceflex_order_progress` and `voiceflex_daily_activity`.
5. The progress, milestones and calendar pages read it back through `/api/progress`.

Orders reach Supabase from a Google Sheet through the `sync-google-orders` Edge Function, which pg_cron runs every night at 03:00 UTC. That function lives in Supabase, not in this repo.

## Tech stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts and Supabase.

## Routes

Customer flow: `/`, `/train`, `/train/[product]`, `/train/[product]/progress`, `/train/[product]/milestones`, `/train/[product]/settings`.

Older email and password area, not linked from the customer flow: `/login`, `/dashboard`, `/programs`, `/session`, `/progress`, `/calendar`, `/library`, `/settings`.

## Environment variables

Server side (order check and progress):

```bash
VOICEFLEX_DB_URL=
VOICEFLEX_SERVICE_ROLE_KEY=
VOICE_FLEX_GO_ASIN=
VOICE_FLEX_PRO_ASIN=
```

Browser side (older login area):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Put the variables above in `.env.local` first.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Deployment

Vercel, connected to this repo. `main` deploys to production and every other branch gets its own preview URL. Previews use the same Supabase database as production unless the Preview environment variables in Vercel point somewhere else, so test with your own order number.
