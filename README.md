# Tabiya ◆

A chess platform where you play, learn and earn on one board.

**Live:** https://tabiya-one.vercel.app

Online chess with opening hints, a Stockfish bot, deep theory, a ChessCoin
economy and community articles — all in one place.

## Features

- **Play online** — rated games and training, matchmaking by closest rating or
  friend challenges, moves synced in real time. Chess clocks, captured-piece
  trays, resign with a distinct sound + red-king highlight.
- **Play the bot** — Stockfish 18 (WASM) at four levels and time controls, with
  arrow hints from opening theory or the engine (with a reason why).
- **Theory** — opening principles and every system explained, each with a
  position diagram you can click to enlarge.
- **World** — a live-ish top-players ranking sorted by FIDE rating, plus a
  calendar of real upcoming championships.
- **Learn & Earn** — read community articles, mark them helpful to earn
  ChessCoin, or write your own (Markdown + image/GIF uploads) and get paid when
  readers like or unlock them. Comments with edit/delete.
- **ChessCoin & Shop** — earn coins by playing and writing; spend on profile
  customization (nickname badges, nickname colors) and real-ish partner
  discounts with copyable promo codes.
- **Profiles** — avatar upload, Elo rating, rating chart, W/L/D, public profiles
  by nickname link.
- **Friends** — search, requests, challenge; friend list with avatars & ratings.
- **Settings** — light/dark theme, EN/RU language, change username/password.

## Tech stack

- **Frontend:** React + TypeScript + Vite. Board: `react-chessboard`. Rules:
  `chess.js`. Engine: **Stockfish 18 (WASM)** in a Web Worker.
- **Backend:** **Supabase** — Postgres, Auth, Realtime, Storage. No custom
  server; game logic and scoring live in Postgres functions with Row-Level
  Security.
- **Hosting:** static frontend on Vercel; Stockfish, sounds and images are
  served from `public/`.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
```

Without Supabase keys the app runs in offline mode (Home + bot only).

### Connect the backend (Supabase)

1. Create a free project at https://supabase.com.
2. **Run the SQL.** In the Supabase SQL Editor, run `supabase/schema.sql` once
   (base schema + RLS + auto profile on signup + `finish_game` scoring), then
   run the incremental migrations in order: `migration_02.sql` … `migration_13.sql`.
   They add matchmaking, rating history, avatars storage, ChessCoin, articles,
   comments, media uploads and nickname styles.
3. **Keys.** Project Settings → API. Create `.env.local` in the project root
   (see `.env.example`):
   ```
   VITE_SUPABASE_URL=https://YOUR-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
   ⚠️ Never put the `service_role` key in the frontend.
4. Restart `npm run dev`. Auth, lobby, learn, shop and profiles appear.

Tip: for local testing, disable Authentication → Providers → Email → "Confirm
email" so signups log in immediately.

## Deploy (Vercel)

1. Push the repo to GitHub.
2. Vercel → Import Project → select the repo (auto-detected as Vite).
3. Add the same env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4. Deploy. `vercel.json` rewrites all routes to `index.html` so React Router
   deep links work.
5. In Supabase → Authentication → URL Configuration, set the Site URL to your
   production domain.

## Project structure

```
src/
  engine/stockfish.ts     UCI wrapper around Stockfish in a Web Worker
  openings/               opening book (data.ts) + position→move index (book.ts)
  game/                   board, sounds, hints, material, check/king highlight
  lib/                    supabase client + services (games, friends, coins,
                          articles, media, avatar, realtime)
  auth/AuthContext.tsx    session + profile
  i18n/                   EN/RU dictionary + provider
  content/                theory, world players/events, shop catalog
  components/             Layout (sidebar), MiniBoard, RatingChart, UserName, …
  pages/                  Home, Lobby, OnlineGame, PlayBot, Theory, World,
                          Learn/Article(/Editor), Shop, Profile(/Public), Settings
public/engine/            Stockfish 18 lite (WASM)
public/sounds/            move/capture/check/end/resign sounds
public/players/           top-player photos
supabase/                 schema.sql + migration_02 … migration_13 (run in order)
```

## Notes

- Scoring, coins and article rewards run in `SECURITY DEFINER` Postgres
  functions (`finish_game`, `like_article`, `unlock_article`) so clients can't
  edit other users' profiles. Elo uses K=32.
- Realtime: online moves use filtered Postgres changes per game; the lobby uses
  a broadcast channel so a move never triggers a lobby-wide refetch.
- Extending openings is easy — add lines in `src/openings/data.ts`.
