import test from 'node:test';
import assert from 'node:assert/strict';
import {
  callNextForBarber,
  canMarkNoShow,
  createSpot,
  getEstimatedWait,
  getSpotPosition,
  isOnlineJoinOpen,
} from '../src/lib/queue.js';

function fixture() {
  return {
    tokenCounter: 0,
    queueOpen: true,
    closingTime: '21:00',
    services: [
      { id: 'cut', minutes: 30, price: 200, active: true },
      { id: 'beard', minutes: 15, price: 100, active: true },
    ],
    barbers: [
      { id: 'ravi', onDuty: true, onBreak: false },
      { id: 'amit', onDuty: true, onBreak: false },
    ],
    spots: [],
  };
}

function addSpot(state, id, preference, createdAt, status = 'Waiting') {
  state.spots.push({
    id, token: id, name: id, phone: `900000000${state.spots.length}`,
    serviceIds: ['cut'], barberPreference: preference,
    assignedBarberId: null, status, createdAt, calledAt: null,
  });
}

test('a phone number can have only one active queue spot', () => {
  const state = fixture();
  const first = createSpot(state, { name: 'Asha', phone: '9876543210', serviceIds: ['cut'] });
  const duplicate = createSpot(state, { name: 'Asha again', phone: '9876543210', serviceIds: ['beard'] });
  assert.equal(first.spot.token, 'S-1');
  assert.ok(duplicate.duplicate);
  assert.equal(state.spots.length, 1);
});

test('call next skips a spot reserved for a different barber', () => {
  const state = fixture();
  addSpot(state, 'Ravi-only', 'ravi', 1);
  addSpot(state, 'Any-chair', 'any', 2);
  addSpot(state, 'Amit-only', 'amit', 3);
  const called = callNextForBarber(state, 'amit');
  assert.equal(called.id, 'Any-chair');
  assert.equal(called.assignedBarberId, 'amit');
  assert.equal(state.spots[0].status, 'Waiting');
});

test('a barber with an active customer cannot be assigned another', () => {
  const state = fixture();
  addSpot(state, 'Already-called', 'any', 1, 'Called');
  state.spots[0].assignedBarberId = 'ravi';
  addSpot(state, 'Next', 'any', 2);
  assert.equal(callNextForBarber(state, 'ravi'), null);
});

test('no-show is available only after ten minutes from Called', () => {
  const spot = { status: 'Called', calledAt: 1_000_000 };
  assert.equal(canMarkNoShow(spot, 1_599_999), false);
  assert.equal(canMarkNoShow(spot, 1_600_000), true);
  assert.equal(canMarkNoShow({ ...spot, status: 'Waiting' }, 2_000_000), false);
});

test('estimated wait counts service minutes ahead and divides by working barbers', () => {
  const state = fixture();
  addSpot(state, 'one', 'any', 1);
  addSpot(state, 'two', 'any', 2);
  assert.equal(getSpotPosition(state, 'two'), 2);
  assert.equal(getEstimatedWait(state, 'two'), 15);
  state.barbers[1].onBreak = true;
  assert.equal(getEstimatedWait(state, 'two'), 30);
});

test('online joining closes thirty minutes before salon closing', () => {
  const state = fixture();
  assert.equal(isOnlineJoinOpen(state, new Date('2026-11-23T20:29:00')), true);
  assert.equal(isOnlineJoinOpen(state, new Date('2026-11-23T20:30:00')), false);
  state.queueOpen = false;
  assert.equal(isOnlineJoinOpen(state, new Date('2026-11-23T18:00:00')), false);
});

test('a no-show who rejoins receives a new token at the end of the queue', async () => {
  const { markSpotNoShow } = await import('../src/lib/queue.js');
  const state = fixture();
  addSpot(state, 'called', 'any', 1, 'Called');
  state.spots[0].calledAt = 1_000_000;
  addSpot(state, 'still-waiting', 'any', 2, 'Waiting');
  assert.equal(markSpotNoShow(state, 'called', 1_599_999), null);
  assert.equal(markSpotNoShow(state, 'called', 1_600_000).status, 'No-show');
  const next = createSpot(state, { name: 'Returned guest', phone: '9000000000', serviceIds: ['cut'] }, 'walk-in');
  assert.equal(next.spot.token, 'S-1');
  assert.equal(state.spots.at(-1).id, next.spot.id);
  assert.deepEqual((await import('../src/lib/queue.js')).getActiveSpots(state).map((spot) => spot.id), ['still-waiting', next.spot.id]);
});

test('starting and completing a service only allow forward status transitions', async () => {
  const { startSpot, completeSpot } = await import('../src/lib/queue.js');
  const state = fixture();
  addSpot(state, 'one', 'any', 1, 'Called');
  const started = startSpot(state, 'one', 1_700_000_000_000);
  assert.equal(started.status, 'In chair');
  assert.equal(started.startedAt, 1_700_000_000_000);
  assert.equal(startSpot(state, 'one'), null);
  const completed = completeSpot(state, 'one', 1_700_000_060_000);
  assert.equal(completed.status, 'Done');
  assert.equal(completeSpot(state, 'one'), null);
});

test('wait estimate falls when earlier spots leave the queue', () => {
  const state = fixture();
  addSpot(state, 'first', 'any', 1);
  addSpot(state, 'second', 'any', 2);
  assert.equal(getEstimatedWait(state, 'second'), 15);
  state.spots[0].status = 'Done';
  assert.equal(getEstimatedWait(state, 'second'), 0);
});


test('a barber on break cannot be assigned a waiting customer', () => {
  const state = fixture();
  state.barbers[0].onBreak = true;
  addSpot(state, 'waiting', 'any', 1);
  assert.equal(callNextForBarber(state, 'ravi'), null);
  assert.equal(state.spots[0].status, 'Waiting');
});

test('only a Waiting spot can be cancelled', async () => {
  const { cancelWaitingSpot } = await import('../src/lib/queue.js');
  const state = fixture();
  addSpot(state, 'waiting', 'any', 1);
  addSpot(state, 'called', 'any', 2, 'Called');
  assert.equal(cancelWaitingSpot(state, 'called'), null);
  assert.equal(cancelWaitingSpot(state, 'waiting').status, 'Cancelled');
});
