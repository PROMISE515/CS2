# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StratLog CS2 Cloud — a real-time CS2 tactical decision platform. Players connect their CS2 game via GSI (Game State Integration); the server receives live game data, generates economy-based tactical recommendations, and pushes updates to a browser HUD via Pusher Channels. Pusher Beams sends mobile push notifications on new rounds.

**Primary language:** Chinese (zh-CN) for all UI text and user-facing content.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Next.js)
npm run build        # Production build
npm run lint         # ESLint via Next.js
```

There are no tests configured in this project.

## Architecture

**Next.js App Router** (`app/` directory). All pages are `'use client'` components.

- **`app/page.tsx`** — Landing page. Generates a downloadable `.bat` connector (Windows) and `.cfg` GSI config file client-side. Hardcoded `sessionId` and deployment URL (`cs-2-coral.vercel.app`).
- **`app/dashboard/page.tsx`** — Real-time tactical HUD. Subscribes to a Pusher channel (`session-{sessionId}`) via `?s=` query param. Renders economy tier, tactical steps, and a map visualization. Wrapped in `<Suspense>` for `useSearchParams`.
- **`app/tactics/page.tsx`** — Static tactics library with hardcoded data. Grid of tactical cards with map/side filters.
- **`app/leaderboard/page.tsx`** — Static leaderboard with hardcoded rankings.
- **`app/changelog/page.tsx`** — Development log timeline with hardcoded entries.

**API:**
- **`app/api/gsi/route.ts`** — POST endpoint receiving CS2 GSI payloads. Parses map/team/money, computes economy tier via `getEconomyTier()`, generates a tactic via `generateTactic()`, then triggers a Pusher event. Sends Beams notification on `freezetime` phase.

**Shared library:**
- **`lib/stratlog.ts`** — Initializes Pusher Channels and Beams clients from env vars. Contains `getEconomyTier()` (ECO/HALF_BUY/FORCE/FULL_BUY thresholds) and `generateTactic()` (stub logic).

## Styling System

Tailwind CSS v4 with a **dual config** approach:
- **`globals.css`** — Uses `@import "tailwindcss"` and `@theme` for CSS-first design tokens (colors, fonts, keyframes). Defines custom `@utility` blocks: `glass-panel`, `btn-primary`, `btn-outline`, `filter-btn`, `hud-corner` (tl/tr/bl/br variants), `scanline`, `orange-glow`, `cyber-button`, `hud-dashboard-layout`, `timeline-dot`, `timeline-line`.
- **`tailwind.config.js`** — Also present with `colors` and `fontFamily` extensions. Content paths include `./components/**` (directory doesn't exist yet).

**Design tokens:**
- `--color-cs-orange` / `#FF7A00` — Primary accent
- `--color-navy-grey` / `#0B0F1A` — Background
- Font stack: Inter (body), Outfit/Inter (headlines), Space Grotesk (display), Roboto Mono (technical/mono)

**Icons:** Google Material Symbols Outlined (loaded via `<link>` in layout).

## Environment Variables

Required for Pusher functionality (see `DEPLOY.md` for full setup):

| Variable | Scope | Purpose |
|---|---|---|
| `PUSHER_APP_ID` | Server | Pusher Channels app ID |
| `NEXT_PUBLIC_PUSHER_KEY` | Both | Pusher Channels key |
| `PUSHER_SECRET` | Server | Pusher Channels secret |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Both | Cluster (e.g. `ap3`) |
| `PUSHER_BEAMS_INSTANCE_ID` | Server | Beams instance ID |
| `PUSHER_BEAMS_SECRET_KEY` | Server | Beams secret (Bearer token) |
| `NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID` | Both | Beams instance ID for client |

## Path Alias

`@/*` maps to the project root (defined in `tsconfig.json`). Use `@/lib/stratlog` not `../lib/stratlog`.
