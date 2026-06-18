# City Agent

City Agent is a Next.js relocation app that matches people to neighborhoods in Toronto, Mumbai, and New York City from a short lifestyle prompt.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Neon Postgres for development
- AWS Aurora PostgreSQL + PostGIS later
- Drizzle ORM
- Groq for preference extraction and grounded chat
- TomTom for neighborhood place enrichment
- MapLibre + OpenFreeMap for maps

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database

The current MVP schema is intentionally small:

```txt
cities
neighborhood_profiles
user_profiles
```

Set `DATABASE_URL` and `TOMTOM_API_KEY` in `.env`, then run:

```bash
npm run db:setup:minimal
npm run db:enrich
npm run db:fill:groq
```

The schema documentation lives in `db-schema.md`.

## Main Files

- `components/Onboarding.tsx` - three-step onboarding flow.
- `app/results/page.tsx` - match results, sliders, map, nearby places, and chat.
- `app/api/extract-preferences/route.ts` - Groq preference extraction.
- `app/api/user-profile/route.ts` - demo profile persistence and match caching.
- `app/api/match/route.ts` - deterministic neighborhood matching.
- `app/api/chat/route.ts` - grounded chat endpoint.
- `lib/db/schema-minimal.ts` - current Drizzle schema.
- `lib/db/enrich-location-profiles.ts` - TomTom + seed data enrichment.
- `lib/db/fill-location-profiles-with-groq.ts` - Groq enrichment for neighborhood profile JSON.
- `lib/matching/score.ts` - cosine similarity and budget scoring.
