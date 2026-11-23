export const ACTIVE_STATUSES = ['Waiting', 'Called', 'In chair'];

export function isOnlineJoinOpen(state, now = new Date()) {
  if (!state.queueOpen) return false;
  const [hours, minutes] = (state.closingTime || '21:00').split(':').map(Number);
  const closing = new Date(now);
  closing.setHours(hours || 0, minutes || 0, 0, 0);
  const cutoff = new Date(closing.getTime() - 30 * 60 * 1000);
  return now < cutoff;
}

export function getActiveSpots(state) {
  return (state.spots || []).filter((spot) => ACTIVE_STATUSES.includes(spot.status)).sort((a, b) => a.createdAt - b.createdAt);
}

export function getSpotPosition(state, spotId) {
  const active = getActiveSpots(state);
  const index = active.findIndex((spot) => spot.id === spotId);
  return index < 0 ? null : index + 1;
}

export function getServiceTotals(state, serviceIds = []) {
  const selected = (state.services || []).filter((service) => serviceIds.includes(service.id));
  return selected.reduce((total, service) => ({ minutes: total.minutes + service.minutes, price: total.price + service.price }), { minutes: 0, price: 0 });
}

export function getEstimatedWait(state, spotId) {
  const active = getActiveSpots(state);
  const index = active.findIndex((spot) => spot.id === spotId);
  if (index <= 0) return 0;
  const earlierMinutes = active.slice(0, index).reduce((sum, spot) => sum + getServiceTotals(state, spot.serviceIds).minutes, 0);
  const workingBarbers = (state.barbers || []).filter((barber) => barber.onDuty && !barber.onBreak).length;
  return workingBarbers ? Math.ceil(earlierMinutes / workingBarbers) : earlierMinutes;
}

export function hasActivePhone(state, phone) {
  return getActiveSpots(state).find((spot) => spot.phone === phone);
}

export function getBarberCurrentSpot(state, barberId) {
  return (state.spots || []).find((spot) => spot.assignedBarberId === barberId && ['Called', 'In chair'].includes(spot.status));
}

export function getNextForBarber(state, barberId) {
  return getActiveSpots(state).find((spot) => spot.status === 'Waiting' && (spot.barberPreference === 'any' || spot.barberPreference === barberId)) || null;
}

export function canMarkNoShow(spot, now = Date.now()) {
  return spot.status === 'Called' && spot.calledAt && now - spot.calledAt >= 10 * 60 * 1000;
}

export function minutesSince(timestamp, now = Date.now()) {
  return timestamp ? Math.max(0, Math.floor((now - timestamp) / 60000)) : 0;
}

export function makeToken(state) {
  const next = (state.tokenCounter || 0) + 1;
  state.tokenCounter = next;
  return `S-${next}`;
}

export function createSpot(state, details, source = 'online') {
  const duplicate = hasActivePhone(state, details.phone);
  if (duplicate) return { duplicate, spot: null };
  const token = makeToken(state);
  const spot = {
    id: `spot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    token,
    name: details.name.trim(),
    phone: details.phone,
    serviceIds: [...details.serviceIds],
    barberPreference: details.barberPreference || 'any',
    assignedBarberId: null,
    status: 'Waiting',
    createdAt: Date.now(),
    calledAt: null,
    startedAt: null,
    completedAt: null,
    source,
  };
  state.spots.push(spot);
  return { duplicate: null, spot };
}

export function callNextForBarber(state, barberId) {
  const barber = state.barbers.find((item) => item.id === barberId);
  if (!barber || !barber.onDuty || barber.onBreak || getBarberCurrentSpot(state, barberId)) return null;
  const next = getNextForBarber(state, barberId);
  if (!next) return null;
  next.status = 'Called';
  next.assignedBarberId = barberId;
  next.calledAt = Date.now();
  return next;
}

export function getTodayStats(state) {
  const today = new Date().toDateString();
  const completed = (state.spots || []).filter((spot) => spot.status === 'Done' && new Date(spot.completedAt || spot.createdAt).toDateString() === today);
  const noShows = (state.spots || []).filter((spot) => spot.status === 'No-show' && new Date(spot.calledAt || spot.createdAt).toDateString() === today);
  const waits = completed.map((spot) => Math.max(0, ((spot.startedAt || spot.completedAt) - spot.createdAt) / 60000));
  const averageWait = waits.length ? Math.round(waits.reduce((sum, n) => sum + n, 0) / waits.length) : 0;
  return { served: completed.length, noShows: noShows.length, averageWait };
}


export function startSpot(state, spotId, now = Date.now()) {
  const spot = (state.spots || []).find((item) => item.id === spotId);
  if (!spot || spot.status !== 'Called') return null;
  spot.status = 'In chair';
  spot.startedAt = now;
  return spot;
}

export function completeSpot(state, spotId, now = Date.now()) {
  const spot = (state.spots || []).find((item) => item.id === spotId);
  if (!spot || spot.status !== 'In chair') return null;
  spot.status = 'Done';
  spot.completedAt = now;
  return spot;
}

export function markSpotNoShow(state, spotId, now = Date.now()) {
  const spot = (state.spots || []).find((item) => item.id === spotId);
  if (!spot || !canMarkNoShow(spot, now)) return null;
  spot.status = 'No-show';
  return spot;
}

export function cancelWaitingSpot(state, spotId) {
  const spot = (state.spots || []).find((item) => item.id === spotId);
  if (!spot || spot.status !== 'Waiting') return null;
  spot.status = 'Cancelled';
  return spot;
}
