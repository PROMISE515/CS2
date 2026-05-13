# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StratLog CS2 Cloud — a real-time CS2 tactical decision platform. Players connect their CS2 game via GSI (Game State Integration); the server receives live game data, generates economy-based tactical recommendations, and pushes updates to a browser HUD via Pusher Channels. Pusher Beams sends mobile push notifications on new rounds.

**Primary language:** Chinese (zh-CN) for all UI text and user-facing content.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Next.js)
npm run build        # Production build (static export to out/)
npm run lint         # ESLint via Next.js
npm run electron:dev # Dev: Next.js + Electron concurrently
npm run electron:build # Build: Next.js + bundle + electron-builder
npm run package:win  # Package for Windows
npm run package:mac  # Package for macOS
```

Test scripts exist in `scripts/` (not wired to a test framework):
- `node scripts/test-gsi.mjs` — sends mock GSI payloads to the server
- `node scripts/test-server.cjs` — basic server smoke test

## Architecture

The project has **two deployment modes** that share the same Next.js frontend and lib code:

### 1. Web (Vercel) — Next.js App Router

`app/` directory, all pages are `'use client'` components. Next.js is configured for **static export** (`output: 'export'` in `next.config.ts`).

- **`app/page.tsx`** — Landing page. Generates a downloadable `.bat` connector (Windows) and `.cfg` GSI config file client-side. Hardcoded `sessionId` and deployment URL (`cs-2-coral.vercel.app`).
- **`app/dashboard/page.tsx`** — Real-time tactical HUD. Three-state UI: `disconnected` → `connected` → `in_game` (60s disconnect timeout). Subscribes to Pusher (`session-{sessionId}`) or falls back to polling `/api/state` + `/api/connection`. Wrapped in `<Suspense>` for `useSearchParams`. Also reads Electron IPC setup status when running in desktop mode.
- **`app/tactics/page.tsx`** — Static tactics library with hardcoded data. Grid of tactical cards with map/side filters.
- **`app/leaderboard/page.tsx`** — Static leaderboard with hardcoded rankings.
- **`app/changelog/page.tsx`** — Development log timeline with hardcoded entries.

**API (Next.js route):**
- **`app/api/gsi/route.ts`** — POST endpoint receiving CS2 GSI payloads. Parses map/team/money, computes economy tier via `getEconomyTier()`, generates a tactic via `generateTactic()`, then triggers a Pusher event. Sends Beams notification on `freezetime` phase.

### 2. Desktop (Electron) — Express server + BrowserWindow

**`electron/main.ts`** — Main process. On launch: auto-writes GSI `.cfg` to the CS2 cfg directory (found via Steam registry/libraryfolders.json), starts Express server on port **3456** (bound to `0.0.0.0` for LAN access), serves the Next.js static `out/` directory, creates main BrowserWindow + always-on-top transparent overlay (260x280px). Exposes setup status via IPC (`get-setup-status`).

**`electron/preload.ts`** — Exposes `window.electronAPI.getSetupStatus()` to renderer via `contextBridge`.

**`server/api.ts`** — Standalone Express server (not the Next.js route). Handles:
- `POST /api/gsi` — accepts CS2 native GSI format, wrapped test format, or heartbeat-only payloads. Detects heartbeats (provider but no map) vs game data.
- `GET /api/state?s={sessionId}` — returns latest game state
- `GET /api/connection?s={sessionId}` — returns connection state (`disconnected`/`connected`/`in_game`)
- Static file serving from `out/` with page routing for dashboard, tactics, etc.

**Electron build pipeline:** `scripts/bundle-electron.mjs` bundles `server/api.ts` with esbuild into `dist-electron/`. `electron-builder.yml` packages everything (bundled server + `out/` static files) into NSIS installer (Win) or DMG (Mac). The Electron app embeds the Express server — no external server needed at runtime.

### Shared library (`lib/`)

- **`lib/stratlog.ts`** — Initializes Pusher Channels and Beams clients from env vars. Contains `getEconomyTier()` (ECO/HALF_BUY/FORCE/FULL_BUY thresholds) and `generateTactic()` (stub logic).
- **`lib/ai-analyze.ts`** — AI tactical coach using Xiaomi MiMo model (Anthropic-compatible API). Builds a prompt with game state + map knowledge + round history, parses structured response (局势/指挥/买枪/紧迫度). Triggered only at `freezetime` phase start via `shouldAnalyze()`.
- **`lib/maps.ts`** — Map knowledge base (callouts, T/CT strategies, economy tips) for all competitive maps. Used as AI context.
- **`lib/round-history.ts`** — Tracks per-session round results (winner, economy, kills, bomb events). Provides compressed summary for AI prompts.
- **`lib/state-store.ts`** — In-memory session state store. Tracks connection state with 60s heartbeat timeout and 5min data expiry.

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
| `MIMO_API_KEY` | Server | Xiaomi MiMo API key for AI tactical analysis |
| `MIMO_API_URL` | Server | MiMo endpoint (default: `https://token-plan-sgp.xiaomimimo.com/anthropic/v1/messages`) |
| `MIMO_MODEL` | Server | Model name (default: `mimo-v2.5`) |

Pusher is optional — the dashboard falls back to polling `/api/state` when Pusher env vars are not set. Similarly, `MIMO_API_KEY` is optional — AI advice is disabled without it.

## Path Alias

`@/*` maps to the project root (defined in `tsconfig.json`). Use `@/lib/stratlog` not `../lib/stratlog`.
