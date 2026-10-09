# GoalIQ

A full-stack football analytics web app: live scores, fixtures, standings, league browsing, team and player pages, news, and a personalised following feed.

**Live demo:** https://goaliq-gamma.vercel.app

<!-- TODO: add a screenshot or GIF here (dark + light theme) -->

## Features

- **Matches and results** – fixtures and results grouped by your local timezone, with a match page covering overview, lineups, stats, head-to-head and standings.
- **Leagues browser** – browse competitions with continent filtering and paginated results, plus a detail page per league (`/main/leagues/[id]`).
- **Standings** – detects the competition type automatically, including the new Champions League league-phase format, and shows per-competition qualification zones.
- **Top scorers and knockout brackets.**
- **Calendar** – browse matches by date.
- **News** – editorial-style grid powered by GNews.
- **Teams and coaches** – team pages with five lazy-loaded tabs, plus coach profiles.
- **Favorites and Following** – follow teams and competitions with optimistic UI, and get an aggregated news feed for them.
- **Build Your XI** – pick a formation (four available) and search for players to build a lineup.
- **Notifications and AI assistant.**
- **Light and dark theme** driven by CSS variables.
- **Authentication** with Google sign-in (GitHub sign-in in progress).
- **Settings** – <!-- TODO: list the options on your settings page -->

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js (App Router), React |
| Data fetching | SWR |
| Auth | NextAuth (Google OAuth, Prisma adapter, database sessions) |
| Database | PostgreSQL on Neon, Prisma ORM |
| Caching | Upstash Redis |
| Media | Cloudinary |
| UI | Global CSS with CSS variable tokens, Framer Motion, react-toastify |
| Data sources | API-Football, GNews |
| Hosting | Vercel |

The codebase is JavaScript/JSX only.

## Caching strategy

Serverless functions on Vercel don't share memory, so all caching lives in Upstash Redis with TTLs matched to how often the data changes:

| Data | TTL |
| --- | --- |
| Leagues | 7 days |
| Past-season data | 30 days |
| Current season | 3 hours |
| Squads | 24 hours |
| Coach profiles | 24 hours |
| News | 2 hours |

This keeps the app within the API-Football free tier (100 requests/day, 10/minute).

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Neon works well)
- An Upstash Redis database
- API keys for API-Football and GNews
- Google OAuth credentials
- A Cloudinary account

### Install

```bash
git clone https://github.com/Adey04-ui/goaliq.git
cd goaliq
npm install
```

### Environment variables

Create a `.env` file. The names below are typical; check them against your code and adjust.

```env
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

API_FOOTBALL_KEY=
GNEWS_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Database and dev server

```bash
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000.

### Player index (optional)

A resumable script populates the `PlayerIndex` table used for player search. It paces itself to stay inside the API-Football rate limits.

```bash
node scripts/index-players.mjs
```

## Project notes

- Styling uses global CSS with CSS variable tokens (`--bg-primary`, `--text-primary`, `--accent-*` and others) so the light/dark toggle works across all components.
- Qualification zones are defined per competition in `zoneRules.js`, keyed by API-Football league ID.

## Roadmap

- GitHub sign-in
- 
- Rate limiting
- nginX

## Contributors

- [Odukoya Kehinde](https://github.com/Adey04-ui) – lead developer
- [Evans Ali]

## License

