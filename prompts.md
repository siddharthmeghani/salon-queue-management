# Prompt Log — Aura Salon Queue Management

This file is a ready-to-use prompt sequence for the project. Before submitting, edit it to match the actual prompts you personally sent to Antigravity or Codex, in exact order. Add unsuccessful prompts too, as the lab guide requires. Do not claim to have sent a prompt unless you actually did.

## Suggested prompt sequence (edit to match your real prompt history)

## 1. Understand the brief
Read `AGENTS.md` and all files in `docs/`. Summarise the purpose, users, seven screens, must-have features, excluded features, queue states and acceptance criteria. Do not write code until the plan is clear.

## 2. Set up the project
Set up a React + Vite application with responsive routing for `/`, `/join`, `/status/:id`, `/reception`, `/barber/:name`, `/display` and `/admin`. Use the Aura palette: charcoal `#1F2937`, gold `#D4A017`, warm ivory cards and editorial serif headings. Use a premium, calm salon aesthetic and keep the customer flow mobile-first.

## 3. Implement the shared queue model
Implement queue data and rules in one module. Support service duration/price totals, token generation, one active queue spot per phone number, first-come-first-served ordering, barber-specific or Any-barber preferences, one active customer per barber, wait estimates, 10-minute no-show eligibility, and online queue closure 30 minutes before closing.

## 4. Build the Home and Join Queue screens
Build the Home and Join Queue screens from `docs/02-screens.md`. Add seeded services and barbers, validate 10-digit phone numbers, limit the selection to three services, calculate totals live and prevent duplicate active phone numbers.

## 5. Build My Status
After a customer confirms, generate a sequential token and show the customer's status, position, estimated waiting time and progress. Show a “Start coming” message in second position and an urgent “It's your turn” state when Reception calls the customer. Allow cancellation only while Waiting.

## 6. Build Reception
Build the tablet-friendly Reception dashboard with live statistics, barber station cards, walk-in form and a queue table. Call next must pick the earliest customer assigned to that barber or Any barber. Add No-show only after 10 minutes and keep walk-ins available after online joining is closed.

## 7. Build Barber View and TV Display
Build a phone-friendly barber station with current customer, Start, Done, On break and Available actions. Build a high-contrast TV view with each barber's current token and the next five Waiting tokens. Both screens must read and update the shared queue.

## 8. Build Owner Settings
Build service management, bilingual service labels, price and duration settings, barber duty/break controls, online queue toggle, closing time and today's statistics. A disabled service must disappear from Join Queue.

## 9. Connect state across devices
Use Supabase Realtime for the shared hosted state. When Supabase values are absent, fall back to local browser storage for a classroom demo. Explain that local demo data does not sync across separate devices. Never expose a Supabase service-role key in frontend code.

## 10. Prepare for deployment
Prepare a Vercel-ready Vite project. Add SPA route rewrites, `.env.example`, Supabase SQL setup, deployment instructions and a README whose first content after the title is the Live demo URL and staff demo PIN. Do not invent a deployment URL; leave an obvious placeholder until Vercel actually deploys.

## 11. Verify queue rules
Test duplicate phone prevention, barber preference matching, barber busy state, Start/Done transitions, no-show timing, re-add-at-end behavior, walk-in creation, online closing rules, wait estimates, English/Gujarati switching and cross-device updates. Fix any mismatches without changing unrelated screens.

## 12. Final polish
Review the mobile layouts and tap target sizes, check long names and small screens, verify the tablet Reception dashboard and TV display readability, and list any remaining limitations clearly.

---

**Submission reminder:** append every new prompt used during your own Antigravity/Codex iterations to this file in exact order. The lab asks you to include prompts that failed too.
