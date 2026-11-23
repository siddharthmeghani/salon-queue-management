# Aura Salon — Beginner Deployment Guide

This guide takes the project from your computer to a public GitHub repository and a working Vercel website. For queue updates to appear on separate devices, configure Supabase before deploying.

## 1. What you need

Create/sign in to these accounts:

- GitHub: https://github.com/ — your public source-code repository.
- Supabase: https://supabase.com/ — shared queue data and live updates.
- Vercel: https://vercel.com/ — public website hosting.

Install these on Windows:

- Node.js 20 or newer: https://nodejs.org/
- Git: https://git-scm.com/downloads
- Visual Studio Code (recommended): https://code.visualstudio.com/

## 2. Open the project folder

1. Download and extract `salon-queue-project.zip`.
2. Open the extracted `salon-queue-project` folder in File Explorer.
3. In VS Code, choose **File → Open Folder** and select `salon-queue-project`.
4. Open **Terminal → New Terminal**.
5. Check that the terminal path ends with `salon-queue-project`.

You can also open File Explorer inside this folder, click the address bar, type `cmd`, and press Enter to open Command Prompt in that folder.

## 3. Install and test locally

Run these commands one at a time in the terminal:

```bash
npm install
npm test
npm run dev
```

- `npm install` downloads the libraries used by the project.
- `npm test` should show **11 tests passing**.
- `npm run dev` starts the local app. Open the `http://localhost:5173` address printed in the terminal.

Try the customer flow: Home → Join Queue → choose services → Confirm → My Status.

Try the team screens: `/reception`, `/barber/ravi`, `/display`, and `/admin`. The classroom demo PIN is **2468**.

To stop the local server, click the terminal and press `Ctrl + C`.

## 4. Configure Supabase (required for separate devices)

Without Supabase, the website works in local demo mode, but the queue is saved only in that browser. Supabase is what lets a customer's phone, Reception tablet, Barber phone and TV screen share updates.

1. Create a Supabase project at https://supabase.com/.
2. Choose a region close to your users, such as Mumbai if available.
3. Open your project's **SQL Editor**.
4. Open this project's `supabase/schema.sql` file in VS Code.
5. Copy all SQL from that file, paste it into the Supabase SQL Editor, and click **Run**.
6. Open **Project Settings → API** (or **API Keys** in the current dashboard).
7. Copy the **Project URL** and the **publishable key**. A legacy `anon` key also works for this demo. Never use a `service_role` or secret key in frontend code.
8. In the project root, copy `.env.example` to a new file named `.env.local`.
9. Replace the example values in `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

10. Save `.env.local`, restart `npm run dev`, and confirm the app footer says **Live sync enabled**.
11. Open `/join` in one browser and `/reception` or `/display` in another. Join a sample customer and confirm the queue changes on both screens.

**Important security note:** the included SQL allows anonymous visitors to read and update one shared demo state row. The staff PIN is also included in the front-end. This is for a classroom demonstration with fictional data only, not for a real salon. A real deployment needs authenticated staff accounts and role-based database policies.

## 5. Create your public GitHub repository

1. Sign in to your own GitHub account.
2. Click **New repository** (or the `+` menu → **New repository**).
3. Repository name: `salon-queue-management`.
4. Set visibility to **Public**.
5. Do not initialise it with a README, licence or `.gitignore`; this folder already contains those project files.
6. Click **Create repository**. Keep the page open so you can copy its HTTPS URL.
7. Return to the VS Code terminal. Run these commands from the project folder, replacing `YOUR-GITHUB-USERNAME` with your own GitHub username:

```bash
git init
git add AGENTS.md docs/
git commit -m "Add project brief, screens and queue rules"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/salon-queue-management.git
git push -u origin main
```

8. This first commit contains the planning documents, as the lab checklist requests. Now add the implementation and submission files:

```bash
git add .
git commit -m "Build Aura Salon queue management app"
git push
```

9. If Git asks you to sign in, complete the browser/device sign-in prompt. Do not put your GitHub password or access token in a command or code file. If Git asks for your author name/email, set your own values with `git config --global user.name "Your Name"` and `git config --global user.email "YOUR-GITHUB-EMAIL"`.
10. Refresh your repository page. Check that `README.md`, `AGENTS.md`, `docs/`, `src/`, `supabase/`, `tests/`, and `prompts.md` are visible.

Your personal profile link is `https://github.com/YOUR-GITHUB-USERNAME`. Your repository link is `https://github.com/YOUR-GITHUB-USERNAME/salon-queue-management`.

## 6. Deploy the website on Vercel

1. Sign in at https://vercel.com/ using the same GitHub account.
2. Choose **Add New → Project**.
3. Import `salon-queue-management` from GitHub. Approve the GitHub access request if Vercel asks.
4. In the project configuration, use:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Open **Environment Variables** before deploying. Add both variables using the exact values from `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
6. Make sure they are enabled for **Production**. Add Preview too if you plan to use preview deployments.
7. Click **Deploy**.
8. When Vercel finishes, open the generated `https://...vercel.app` website.
9. In the app footer, check for **Live sync enabled**. If it says **Local demo mode**, recheck the Vercel environment-variable names and values, save them, then redeploy.

Vercel can connect to the GitHub repository and automatically build a new deployment after pushes to the connected branch. See the official [Vercel Git deployment guide](https://vercel.com/docs/git).

## 7. Verify the actual public website

Use two devices or two separate browsers:

1. Open the Vercel link on a phone; confirm Home loads without signing in.
2. Open `/join`, join with fictional test data, and note the token.
3. Open `/reception` in another browser/device and enter demo PIN `2468`.
4. Confirm the token appears. Tap **Call next** for an eligible stylist.
5. Open the matching `/barber/ravi`, `/barber/amit` or `/barber/imran` route, then tap **Start service** and **Mark as done**.
6. Open `/display` and confirm the current token and next five update.
7. Open `/admin`; turn a service off and verify it disappears from Join Queue. Test queue close/open and closing time.
8. Test Gujarati labels and phone-sized layout.
9. Check that a Called token cannot be marked No-show until 10 minutes have passed.

If a direct URL such as `/barber/ravi` shows a 404 on refresh, check that `vercel.json` is present in the GitHub repository. Its rewrite sends app routes to `index.html`.

## 8. Add your actual live URL to README

Open `README.md` and replace the placeholder on the **Live demo** line near the top with the exact Vercel URL. Do not leave `REPLACE-WITH-YOUR-VERCEL-URL` in the submitted file.

Then run:

```bash
git add README.md
git commit -m "Add live application URL"
git push
```

Wait for Vercel's automatic redeployment to complete, then open the final link again. The live demo link must be the first line directly under the README title.

## 9. What to submit

Submit all three links:

- Your personal GitHub profile URL.
- Your public GitHub repository URL.
- Your working public Vercel live URL.

Also make sure the repository includes the application source, four planning/instruction documents (`AGENTS.md` and `docs/01-brief.md`, `docs/02-screens.md`, `docs/03-flows-rules.md`), `README.md`, `prompts.md`, `REFLECTION.md`, `SUBMISSION_CHECKLIST.md`, `supabase/schema.sql`, `.env.example`, and `tests/queue.test.js`.

Make a personal 3-minute screen recording showing the main flow. Use fictional customer data, show the live token updating across screens, and explain one genuine issue you noticed and fixed. Personalise `REFLECTION.md` so it describes what you actually did. The guide also requires the prompts you used in order, including unsuccessful prompts, so append your real prompt history to `prompts.md` before submission.

Never commit `.env.local`, real customer details, or a Supabase service-role/secret key.
