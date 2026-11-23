# Aura Salon Queue Management System

**Live demo:** https://salon-queue-management-mu.vercel.app
**Staff demo PIN:** `2468` (for `/reception`, `/barber`, and `/admin`)  
**Hosted on:** Vercel (frontend) + Supabase (shared live queue state)



## About
Aura Salon is a mobile-first queue management application for a salon. Customers can join the queue remotely, choose services and a preferred barber, and track their token. Reception can add walk-ins and manage the queue; barbers can start and finish services; a waiting-area display shows current and upcoming tokens; owners can manage services, staff availability and online joining.

## Screens
| Route | Screen | Intended device |
|---|---|---|
| `/` | Home, live queue summary and services | Phone / desktop |
| `/join` | Join queue and select services / barber | Phone |
| `/status/:id` | Personal token and live status | Phone |
| `/reception` | Reception dashboard and walk-ins | Tablet |
| `/barber/:name` | Barber station (e.g. `/barber/ravi`) | Phone |
| `/display` | Waiting-area TV view | TV / large screen |
| `/admin` | Owner settings and daily stats | Tablet / desktop |

## Demo credentials and sample data
- Reception, Barber and Owner PIN: `2468`.
- The app seeds sample customers, services and three barbers (Ravi, Amit and Imran).
- Use sample data only. The classroom staff PIN is not production authentication.
- Use the **Local demo mode** without environment variables. Data is saved in the current browser only; separate devices will not share it.

## Features
- Phone validation (10 digits) and one active queue spot per phone number.
- Up to three services per visit, with live duration and price totals.
- Barber preference matching: a barber can call their own customers and `Any barber` customers, never a customer reserved for someone else.
- Queue states: Waiting → Called → In chair → Done; Waiting → Cancelled; Called → No-show.
- No-show action unlocks after 10 minutes from being called; re-adding creates a new token at the end.
- Wait estimate based on service minutes ahead divided by working barbers.
- Online joining closes when the owner closes the queue or 30 minutes before closing; walk-ins remain available.
- English / Gujarati toggle and responsive layouts for phone, tablet and TV.
- Supabase Realtime updates the shared queue when configured.

## Tech stack
- React 18, Vite 6, React Router, plain CSS, Lucide icons.
- Supabase JavaScript client + Realtime for the hosted shared state.
- Vercel for frontend hosting.

## Run locally

See [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for beginner-friendly Windows steps covering Node.js, Supabase, GitHub, Vercel, and final submission.
1. Install Node.js 20 or newer.
2. Open this folder in a terminal.
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL printed by Vite (usually `http://localhost:5173`).
5. Try customer flow: `/` → `/join` → confirm → `/status/:id`.
6. Try staff flow: `/reception`, `/barber/ravi`, `/display`, `/admin`; use PIN `2468`.

To build the production frontend:
```bash
npm run build
npm run preview
```

## Configure Supabase for multi-device live sync
Without Supabase environment variables, the app intentionally stays in local browser demo mode. To share state between phones, tablet and TV:

1. Create a free project at [Supabase](https://supabase.com/).
2. Open **SQL Editor** in the Supabase dashboard.
3. Copy and run [`supabase/schema.sql`](supabase/schema.sql).
4. Open **Project Settings → API** (or the API Keys section) and copy the Project URL and publishable key. The legacy anon key can also be used if that's what the dashboard shows.
5. Create `.env.local` in the project root, based on `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```
6. Restart `npm run dev`. The footer chip should read **Live sync enabled**.
7. Open `/join` on one browser and `/reception` or `/display` on another. Confirm that an action appears on both.

**Important demo security note:** the supplied SQL policy intentionally allows anonymous access to a single shared state row so a classroom demonstration can work without implementing accounts. Do not use real customer details, real contact numbers or this policy for a production salon. The PIN is visible in the frontend. A production version needs Supabase Auth, role-based access policies, audit logging, and properly normalized customer/queue tables.

## Deploy to GitHub + Vercel
### A. Create your public GitHub repository
1. Sign in to your personal GitHub account.
2. Select **New repository**. Suggested name: `salon-queue-management`.
3. Set visibility to **Public**. Do not add a README, license or `.gitignore` if you are uploading this already-prepared project (it already has those files).
4. In a terminal opened in this project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Build Aura Salon queue management app"
   git branch -M main
   git remote add origin https://github.com/YOUR-GITHUB-USERNAME/salon-queue-management.git
   git push -u origin main
   ```
5. Replace `YOUR-GITHUB-USERNAME` with your actual GitHub username. Copy the public repository URL for submission.

If Git asks you to authenticate, sign in through the browser or use GitHub's recommended authentication flow. Never put a password or personal access token in the remote URL or in a source file.

### B. Deploy the frontend on Vercel
1. Sign in at [Vercel](https://vercel.com/) using the same GitHub account.
2. Choose **Add New → Project**, then import `salon-queue-management`.
3. Vercel should detect **Vite**. Verify these settings:
   - Framework preset: `Vite`
   - Root directory: `./`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Add the two Supabase environment variables from your `.env.local` under **Environment Variables** for Production (and Preview if you use preview deployments).
5. Choose **Deploy**. Wait for the Vercel build to finish and open the generated URL.
6. Test the deployed routes: `/`, `/join`, `/reception`, `/barber/ravi`, `/display`, `/admin`. Vercel's `vercel.json` rewrites direct route visits to `index.html`.
7. Copy the final `https://...vercel.app` URL and replace the Live demo placeholder at the very top of this README.
8. Commit and push the updated README:
   ```bash
   git add README.md
   git commit -m "Add live deployment link"
   git push
   ```
   Vercel will redeploy automatically after the push.

### C. Final deployment checks
- Open the Vercel link in a private/incognito tab and on a phone.
- Confirm the header and all routes load without a local server.
- Join a test token and confirm it appears on Reception and TV.
- Call next, Start, Done, Cancel and No-show (No-show only after 10 minutes).
- Check the English/Gujarati toggle and a narrow phone viewport.
- Confirm the footer says **Live sync enabled** when Supabase is configured.
- Do not submit until the live URL opens the working application.

## Test the queue rules
Run the unit tests:
```bash
npm test
```
The tests cover duplicate phone prevention, barber preference, single active customer per barber, no-show timing, waiting-time estimation, and closing-time behavior. Use `docs/03-flows-rules.md` for the complete manual test checklist.

## Project structure
```text
salon-queue-project/
├── .env.example
├── .nvmrc
├── AGENTS.md
├── README.md
├── package.json
├── vite.config.js
├── vercel.json
├── prompts.md
├── REFLECTION.md
├── SUBMISSION_CHECKLIST.md
├── DEPLOYMENT_GUIDE.md
├── docs/
│   ├── 01-brief.md
│   ├── 02-screens.md
│   └── 03-flows-rules.md
├── public/
├── src/
│   ├── App.jsx
│   ├── data/seed.js
│   ├── lib/queue.js
│   ├── lib/store.js
│   └── styles.css
├── supabase/schema.sql
└── tests/queue.test.js
```
