# 3X3 Unites — Gamification mockup

A Next.js + Supabase mockup of the **3X3 Unites** "From the Streets to the Top" gamification platform. Built around the official 3X3 Unites brandbook (street/urban, black + white + neon green / orange / blue).

> **Mockup status**: this version runs entirely on an in-memory store seeded with ~30 fake participants, 10 journey steps, 8 side challenges, 6 badges, 5 rewards and 20 demo photos. The Supabase schema is provided in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) so the production wiring can be plugged in later (with a real cm.nl webhook).

## Quick start

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Demo flow

1. Hit **Log in** (top right) and pick any seeded participant — or pick **Admin Salina** to see the admin views.
2. As a participant: open `/dashboard`, `/journey`, `/scan`, `/challenges`, `/photos`, `/leaderboard`, `/rewards`, `/profile`.
3. As **Admin**: open `/admin` → `Participants` and use **"Simulate cm.nl ticket purchase"** to create a new participant (the same place where a real cm.nl webhook would later plug in). Generate printable QR codes via `/admin/qr-codes`.

### Scanning QR codes locally

- Use any phone QR scanner pointed at the printable codes from `/admin/qr-codes`, or simply type a code like `JOURNEY-01` into the manual-entry field on `/scan`.
- Try the hidden `PANNA-HIDDEN-01` code to trigger the panna_qr challenge.

## Tech stack

- Next.js 16 (App Router, TypeScript, Server Components)
- Tailwind CSS v4 (theme tokens follow brandbook §2.2 palette)
- `next/font` with **Bebas Neue** display + **Inter** body + **JetBrains Mono**
- `html5-qrcode` (camera scan) + `qrcode` (admin QR generation)
- `zod` for API input validation
- Mockup data layer in `src/lib/data/store.ts` (mutable singleton, swap for Supabase via `@supabase/ssr` later)

## Brand palette (from 3X3 Unites brandbook §2.2)

- Primary: `#000000`, `#FFFFFF`, `#F3EEE4`, `#BEFF00` (signature green)
- Secondary: `#FF6701` (events — used on the Streets-to-the-Top journey), `#00FFFF` (education — used on leader-related challenges)

## Project layout

```
src/
  app/
    page.tsx                  landing
    dashboard/                participant dashboard
    journey/                  10-step journey view
    scan/                     QR scanner (camera + manual)
    challenges/[id]/          per-type renderers
    photos/                   photo contest wall
    leaderboard/              top-100
    rewards/                  catalog + claim flow
    profile/                  badges, claimed rewards, edit name
    admin/                    KPIs, participants, challenges, QR codes, photos, rewards
    api/
      scan/                   POST /api/scan
      challenges/[id]/attempt
      rewards/[id]/claim
      cm/mock-purchase        simulated cm.nl webhook
  components/                 design system primitives + headers/footers
  lib/
    data/                     types + seed + in-memory store
    i18n/                     NL/EN dictionaries + cookie locale
    supabase/                 env + server/browser/service clients (@supabase/ssr)
    session.ts                cookie-based mock auth
    award-points.ts           centralized badge evaluation
  middleware.ts               refreshes Supabase Auth cookies when env is set
supabase/migrations/0001_init.sql   real Postgres schema for later
```

## Supabase koppelen (stap-voor-stap)

De app werkt **zonder** Supabase (in-memory mock). Zodra je echte data wilt:

1. **Maak een project** op [supabase.com](https://supabase.com) → *New project*.
2. **Run het schema**: in het Supabase-dashboard → *SQL Editor* → plak de inhoud van [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → *Run*.  
   Pas daarna eventueel triggers toe om `profiles` te vullen vanuit `auth.users` (nu zijn profielen los van Auth; voor productie wil je meestal `id = auth.uid()`).
3. **API keys**: *Project Settings* → *API* → kopieer **Project URL** en de **anon** (legacy) of **publishable** key (nieuw).
4. **Lokaal env**: kopieer `.env.example` naar `.env.local` en vul in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` **of** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. **Auth URL’s** (als je Supabase Auth gebruikt): *Authentication* → *URL configuration* → zet **Site URL** op `http://localhost:3000` (prod: jouw domein). Voeg **Redirect URLs** toe voor magic links / OAuth.
6. **Code**: helpers staan al in [`src/lib/supabase/`](src/lib/supabase/) — gebruik `createSupabaseServerClient()` in Server Components / Route Handlers en `createSupabaseBrowserClient()` in Client Components. [`src/middleware.ts`](src/middleware.ts) vernieuwt de sessie-cookies zodra env is gezet.
7. **Data-laag**: vervang de aanroepen in [`src/lib/data/store.ts`](src/lib/data/store.ts) door Supabase-queries (zelfde signatures houden = minder wijzigingen in pages).

Optioneel server-only: `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` voor webhooks (bv. cm.nl) — nooit `NEXT_PUBLIC_` gebruiken.

Officiële handleiding: [Supabase + Next.js (SSR)](https://supabase.com/docs/guides/auth/server-side/nextjs).

## Going to production

1. Supabase project + schema (zie **Supabase koppelen** hierboven).
2. Vervang `src/lib/data/store.ts` door echte database-aanroepen; gebruik RLS en `getUser()` / `getClaims()` voor autorisatie op de server.
3. Wire de echte cm.nl webhook (rename `/api/cm/mock-purchase`, HMAC/secret verifiëren met `CM_WEBHOOK_SECRET`).
