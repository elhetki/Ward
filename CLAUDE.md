# CLAUDE.md — Ward (Quran Habit App)

## Quick Reference
- **Stack:** Vite + React 19 + TypeScript 5.9 + Tailwind 4 + Supabase + Framer Motion
- **GitHub:** `elhetki/Ward` → push to `main` auto-deploys via Vercel
- **Prod:** https://ward-quran.vercel.app
- **Supabase project:** `rspnumcdyrupaohrpios`
- **Framework:** Vite SPA with React Router

## Commands
```bash
npm run dev          # Local dev server
npm run build        # Production build (tsc -b && vite build)
npm run lint         # ESLint
```

## Quality Gate (MUST pass before any push)
```bash
npm run build
```
This runs TypeScript check + Vite build. Both must pass.

## Project Structure
```
src/
├── App.tsx              # Root — React Router, layout
├── main.tsx             # Entry point
├── pages/
│   ├── Home.tsx         # Dashboard — daily reading streak, progress
│   ├── Onboarding.tsx   # First-time user setup
│   ├── Profile.tsx      # User profile + settings
│   ├── QuranBrowser.tsx # Surah browser / selection
│   └── Reader.tsx       # Quran reading interface
├── components/ui/       # Shared UI components
├── hooks/               # Custom hooks
├── lib/                 # Supabase client, utilities
├── stores/              # State management
├── types/               # TypeScript types
├── index.css            # Global styles
└── assets/              # Static assets
```

## Design System
- **Colors:** Cream (#F9F5EE) background, Sage Green (#5C8B61) primary
- **Vibe:** Warm, calm, spiritual — not gamified
- **Animations:** Framer Motion for transitions
- **Typography:** Clean, readable — optimized for reading

## Current State
- **v1:** localStorage-based, no auth
- **Auth:** Not implemented — Phase 1 (email/password) + Phase 3 (guest→auth conversion) are next
- **Native:** Capacitor planned (not React Native)

## Architecture
- All data currently in localStorage (stores/)
- Supabase client exists but auth not wired
- No RLS policies set up yet — will be needed with auth

## What NOT To Do
- Don't add auth without implementing the full flow (signup + login + session + guest conversion)
- Don't change the color scheme — cream + sage green is approved
- Don't add gamification elements (badges, leaderboards) — this is a spiritual app
- Don't over-engineer — v1 is intentionally simple

## Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Deploy
Push to `main` on `elhetki/Ward` → Vercel auto-deploys.

## Customer Data Protection (NON-NEGOTIABLE)

These rules are absolute. No agent, no feature, no deadline overrides them:

1. **NEVER delete customer data** — soft-delete only (add `deleted_at` timestamp)
2. **NEVER modify customer settings** — read them, never overwrite on deploy or migration
3. **NEVER drop columns that have data** — add new columns, deprecate old ones
4. **NEVER change existing enum values** — add new ones, never rename or remove
5. **ALWAYS set defaults for new columns** — existing rows must not break
6. **ALWAYS verify RLS policies** — every table with customer data needs row-level security
7. **ALWAYS test with existing data** — not just empty/fresh state

If a migration touches existing data: document exactly what it changes and require explicit approval.
If in doubt: **don't touch it, ask first.**
