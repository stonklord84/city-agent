# Polaris

Polaris is a relocation app for people moving to a new city. Instead of browsing generic neighborhood lists, users describe a place they liked living, choose what they want close by, set a budget, and get matched with neighborhoods that fit their lifestyle.

The current launch cities are:

- New York City
- Toronto
- Mumbai

The app was built for a Vercel v0 + AWS database hackathon, with Aurora PostgreSQL used as the AWS database layer.

## What It Does

Polaris guides the user through a short onboarding flow:

1. Pick a destination city.
2. Describe a previous place they liked living.
3. Choose lifestyle signals like parks, transit, coffee, groceries, nightlife, quiet streets, and social energy.
4. Set rent budget and tradeoffs.
5. View matched neighborhoods on a map with nearby practical places.

After results load, users can:

- compare top neighborhood matches
- view rent and lifestyle fit evidence
- see nearby places such as parks, groceries, restaurants, pharmacies, and transit anchors
- ask the AI city agent follow-up questions

## Matching Algorithm

The matcher uses a simple weighted scoring system.

Each neighborhood has stored feature scores, such as:

- walkability
- transit
- nightlife
- safety / quiet
- cafes
- parks
- young professional fit
- affordability
- diversity

The user onboarding answers are converted into a preference vector. Polaris then compares the user vector against each neighborhood vector and combines that with budget fit.

At a high level: 

> final score = lifestyle similarity + budget fit + match reasons

Each match also includes short reasons explaining why that neighborhood was suggested.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Drizzle ORM
- AWS Aurora PostgreSQL with PostGIS
- Llama for preference extraction and chat
- MapLibre for maps

## Database

The main schema:

```txt
cities
neighborhood_profiles
user_profiles
```

`neighborhood_profiles` stores the core city data: summaries, tags, rent ranges, coordinates, feature scores, nearby places, and external metrics.

`user_profiles` stores the demo user's onboarding answers, preference vector, saved match state, and chat history.

We also cache the responses in the db so the app does not repeatedly spend API credits for the same requests.

Aurora is synced through the RDS Data API.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Project Structure

```txt
app/
  page.tsx                         Home page
  layout.tsx                       App metadata and root layout
  globals.css                      Global styles
  results/page.tsx                 Results dashboard
  api/
    extract-preferences/route.ts   Converts onboarding answers into preferences
    match/route.ts                 Returns ranked neighborhood matches
    places/route.ts                Returns nearby places for a neighborhood
    chat/route.ts                  AI city agent endpoint
    user-profile/route.ts          Saves demo user profile and match state

components/
  Navbar.tsx                       Top navigation
  Hero.tsx                         Homepage hero and onboarding container
  Onboarding.tsx                   Five-step onboarding flow
  MapView.tsx                      Interactive map and place markers

lib/
  ai/
    extract-preferences.ts         Preference extraction prompt and parser
    city-context.ts                Database context for chat
    groq.ts                        Llama API client and response cache
  db/
    client.ts                      Database connection
    schema.ts                      Active database schema
    api-cache.ts                   Cached AI/API responses
  matching/
    score.ts                       Matching algorithm
    types.ts                       Match result types
```

## Status

Polaris is a hackathon MVP. The core loop is working:

```txt
onboarding -> preference extraction -> neighborhood matching -> map/results -> AI follow-up
```
