# AGENTS.md — Ward (for Codex and other AI agents)

## Project
Ward is a Quran daily reading habit app. Calm, spiritual design. Tracks reading streaks, bookmarks, and progress. No gamification.

## Stack
- **Frontend:** Vite + React 19 + TypeScript 5.9 + Tailwind 4 + Framer Motion + React Router
- **Backend:** Supabase (not yet wired — currently localStorage)
- **Hosting:** Vercel (auto-deploy from GitHub `elhetki/Ward` main branch)
- **Prod URL:** https://ward-quran.vercel.app

## Commands
- `npm run dev` — start dev server
- `npm run build` — TypeScript check + Vite build
- `npm run lint` — ESLint
- **Always run `npm run build` before committing**

## Key Rules
1. Design: cream (#F9F5EE) + sage green (#5C8B61) — don't change
2. No gamification (badges, leaderboards, points) — spiritual app
3. Currently localStorage only — Supabase auth is Phase 1 next step
4. Keep it simple — v1 is intentionally minimal
5. Animations via Framer Motion — keep subtle and calm

## Structure
- `src/pages/` — Home, Onboarding, Profile, QuranBrowser, Reader
- `src/components/ui/` — shared components
- `src/stores/` — state management (localStorage)
- `src/hooks/` — custom hooks
- `src/lib/` — Supabase client, utils
