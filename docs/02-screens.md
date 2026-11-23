# Screens & Features

All screens share the same queue state. The header contains the Aura Salon wordmark, open/closed status where relevant, and an EN/GU language switch. Gold is reserved for primary actions and urgent called states; waiting states use neutral surfaces.

## Screen 1: Home (`/`)
**Users:** customers choosing whether to join.

- Header: Aura Salon mark, “A little time for yourself”, language toggle and queue-open badge.
- Hero: salon introduction, primary **Join the queue** button, live-queue link, and a phone-number lookup form for returning customers to open their active token.
- Live overview: number waiting, approximate wait, and barber cards showing Available / Busy / On break.
- Service preview: active services, duration and INR price.
- Footer links: Reception, Barber view, TV display and Owner settings for the classroom demo.
- **Join the queue** opens `/join`; the token lookup validates a 10-digit phone number and opens its active spot, or shows a helpful error if no active spot exists.
- Mobile: single-column cards and full-width primary action. Desktop: two-column hero with live queue card.
- Empty state: “The chairs are ready. You can walk right in.” Closed state explains online joining is paused; walk-ins are still accepted.

## Screen 2: Join Queue (`/join`)
**Users:** remote customer or receptionist adding a walk-in.

- Name and 10-digit phone fields; reject invalid phone numbers.
- Service cards with English/Gujarati name, minutes and price; multi-select up to three active services.
- Barber picker: Any barber (fastest) or an individual barber card.
- Live summary: total service duration, total price and estimated wait.
- **Confirm my spot** validates the form, prevents a second active spot for the same phone, creates a new token and opens `/status/:id`.
- **Back** returns Home. If the queue is closed or within 30 minutes of closing, online confirm is disabled with an explanation; walk-ins remain available at reception.
- Mobile: stacked controls with tap targets at least 44px. Empty/error states identify exactly what needs attention.

## Screen 3: My Status (`/status/:id`)
**Users:** customer tracking a spot.

- Large token, current status, position and estimated wait.
- “Start coming to the salon” banner when the customer is second in line.
- Called state: prominent gold “It’s your turn!” message with the assigned barber.
- Status timeline: Waiting → Called → In chair → Done; Cancelled and No-show are terminal states.
- **Cancel my spot** is available for an active Waiting spot and requires confirmation.
- Empty/unknown token state offers a return-to-home link. Status refreshes through shared state updates.
- Mobile: centered token card and compact timeline.

## Screen 4: Reception Dashboard (`/reception`)
**Users:** receptionist on a landscape tablet.

- Staff PIN gate (demo PIN `2468`).
- Top row: live counts, online queue status and **+ Add walk-in** action.
- Barber cards show current customer, service, elapsed/progress information, availability and **Call next**.
- Waiting list in token order: token, customer, services, preferred barber, wait duration, **No-show** and **Cancel**.
- Waiting longer than 60 minutes is highlighted in amber. A Called spot becomes eligible for No-show after 10 minutes.
- **Add walk-in** opens a quick name/phone/service/barber form. It joins the end of the shared queue even when online joining is closed.
- **Call next** selects the earliest eligible Waiting spot for that barber. A specific barber preference is never reassigned.
- Tablet: three-column barber row when space permits, queue list below. Mobile: stacked cards.

## Screen 5: Barber View (`/barber/:name`)
**Users:** barber on a phone.

- Select a barber (Ravi, Amit or Imran) if no name is in the URL.
- Current customer, token, selected services and a service timer.
- **Start** changes Called → In chair. **Done** changes In chair → Done and frees the barber.
- **On break / Available** toggles the barber's break status. A barber on break cannot be assigned another customer.
- “Next for you” previews the earliest eligible Waiting customer without changing the queue.
- Mobile: one large current-customer panel and full-width actions.

## Screen 6: Waiting Area TV (`/display`)
**Users:** customers in the waiting area.

- High-contrast full-screen view with salon name and live clock.
- One row/card per barber: name, availability and current token.
- “Up next” shows the next five eligible tokens with their preferred/assigned barber when known.
- Newly called token receives a gold emphasis and a subtle pulse. Use sound only after browser interaction if enabled; never rely on sound alone.
- TV layout uses large type readable from several metres; no controls required.

## Screen 7: Owner Settings (`/admin`)
**Users:** salon owner (demo PIN `2468`).

- Today's stats: customers served, average wait and no-shows.
- Services: bilingual name, minutes, price and active toggle. Inactive services disappear from Join Queue.
- Barbers on duty: toggle duty and break/available state.
- Queue controls: open/close online joining and set closing time. Online joining closes automatically 30 minutes before the closing time.
- Changes save to shared state and update the other screens.
- Mobile: settings grouped into cards; desktop: two-column content layout.
