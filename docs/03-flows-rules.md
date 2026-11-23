# Flows & Rules

## Flow: remote customer
1. Customer opens Home → Join Queue.
2. Customer enters name and phone, chooses one to three services and a barber or Any barber.
3. Confirm creates the next token (`S-1`, `S-2`, …) and opens My Status.
4. Customer watches position and estimated wait. When second in line, show “Start coming to the salon”.
5. Reception calls the earliest eligible customer for a barber. The customer's Status screen changes to “It’s your turn” and TV highlights the token.
6. Barber taps Start, then Done. The spot leaves the active queue and today's completed count increases.

## Flow: walk-in
Receptionist selects **+ Add walk-in**, enters name, phone, service(s) and barber preference. The walk-in enters the same queue at the end and receives a new token. Walk-ins remain available even when online joining is closed.

## Statuses and allowed moves
- Waiting → Called → In chair → Done.
- Waiting → Cancelled.
- Called → No-show.
- No-show or Cancelled cannot be moved backwards. If a no-show customer returns, receptionist adds them again at the end with a new token.

## Queue and assignment rules
- First come, first served, measured by creation order.
- **Call next for barber X** selects the earliest Waiting spot whose preference is X or Any.
- A customer who chose a specific barber is never assigned to another barber.
- Any-barber customers may be assigned to the selected available barber.
- A barber has only one active customer (Called or In chair) at a time.
- A barber who is off duty or on break cannot receive a new assignment.
- Each phone number can have only one active spot (Waiting, Called or In chair).
- Waiting-time estimate: total service minutes for customers ahead divided by the number of barbers currently working; show a small “estimate” label because real service durations vary.
- A Called spot may be marked No-show after 10 minutes without arrival. The reception screen shows the eligibility time.
- If a specific preferred barber is on break, the customer sees “{barber} is on break”; do not silently move the customer to another barber.
- Online joining closes when the owner closes the queue or within 30 minutes of closing time. Walk-ins are still accepted.

## Test checklist
- [ ] Join with two services; duration and price totals are correct.
- [ ] Select four services; the fourth selection is prevented.
- [ ] Invalid or non-10-digit phone number is rejected.
- [ ] Same phone attempts to join twice; the existing active spot is shown instead of a duplicate.
- [ ] Call next for Amit skips an earlier spot reserved for Ravi.
- [ ] Any-barber spot can be called by an available barber.
- [ ] A Ravi-only spot is never called for Amit or Imran.
- [ ] A barber with a current Called/In chair customer cannot receive another spot.
- [ ] Start/Done updates Reception, TV and customer status.
- [ ] No-show is unavailable until 10 minutes after Called; re-adding creates a new token at the end.
- [ ] Cancel requires confirmation and removes the spot from the active queue.
- [ ] Closing online queue disables Join Queue but Reception can still add walk-ins.
- [ ] Service switched off disappears from Join Queue.
- [ ] English/Gujarati switch changes visible labels.
- [ ] Estimated wait decreases as earlier customers finish.
- [ ] Two browser windows stay in sync; with Supabase configured, separate devices stay in sync.
