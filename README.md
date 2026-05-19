# Voice Flex

Voice Flex is a production-style visual MVP for a guided vocal training platform bundled with a physical SOVT vocal trainer.

The current phase intentionally uses mock seed data and browser `localStorage` instead of authentication, Prisma, Postgres, or payments. The app is structured so Clerk and Prisma can replace the demo layer later.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style primitives
- lucide-react icons
- Framer Motion
- Recharts
- Browser `localStorage` for MVP state

## Routes

- `/dashboard`
- `/programs`
- `/session`
- `/progress`
- `/calendar`
- `/library`
- `/settings`
- `/sign-in`
- `/sign-up`

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Environment Variables

No environment variables are required for this MVP.

Future backend phase:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
DIRECT_URL=
```

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Framework preset: Next.js.
4. Region recommendation for the future database/backend: US East, preferably `iad1`.
5. Build command: `npm run build`.
6. Output directory: `.next`.

## Future Roadmap

- Replace demo user with Clerk authentication.
- Add Prisma models for profiles, programs, exercises, sessions, journal entries, achievements, and progress.
- Connect Postgres through Neon or Supabase in US East.
- Add real program enrollment and session completion writes.
- Add premium billing and AI coach feedback.
- Add mobile QR onboarding for the physical Voice Flex product.
