# AGENTS.md — Aura Salon Queue Management

A responsive salon queue app: customers join and track their place; reception and barbers operate the queue; a TV display shows live calls.

## Read first
- `docs/01-brief.md` — goals, users, scope and exclusions.
- `docs/02-screens.md` — seven screen layouts and behaviour.
- `docs/03-flows-rules.md` — queue lifecycle, assignment rules and test checklist.

## Stack and run commands
- React + Vite + plain CSS; Supabase JavaScript client for shared hosted state.
- `npm install` then `npm run dev`.
- `npm run build` creates the deployable `dist/` folder.
- Supabase variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- When variables are absent, local demo mode uses browser storage; it does not sync between devices.

## Working rules
- Theme: charcoal `#1F2937`, warm gold `#D4A017`, warm ivory surfaces, generous spacing and rounded cards.
- Mobile-first customer pages; tablet-friendly reception; high-contrast TV display.
- All customer-facing labels must be available in English and Gujarati through the language dictionary.
- Keep queue decisions in `src/lib/queue.js`; reuse them on every screen.
- Preserve the exact flows and exclusions in `docs/`; do not add online payment, appointments, SMS/WhatsApp, loyalty or multi-branch features.
- Staff PINs in this educational demo are convenience gates, not secure authentication. Do not use real customer data in the public demo.
- After each task, list changed files and how to test the change.
