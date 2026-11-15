import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDate, nightsBetween, quoteRental, datesOverlap, hasConflict } from '../frontend/public/booking-core.mjs';

test('validates calendar dates and leap years', () => {
  assert.ok(parseDate('2028-02-29'));
  assert.equal(parseDate('2027-02-29'), null);
  assert.equal(parseDate('2026-13-01'), null);
  assert.equal(parseDate('2026-1-01'), null);
});
test('uses calendar days rather than DST-sensitive local timestamps', () => {
  assert.equal(nightsBetween('2026-03-07', '2026-03-10'), 3);
  assert.equal(nightsBetween('2026-11-01', '2026-11-02'), 1);
  assert.equal(nightsBetween('2026-11-02', '2026-11-02'), 0);
});
test('quotes subtotal and an explicit illustrative service fee', () => {
  assert.deepEqual(quoteRental(100, '2026-11-20', '2026-11-22'),
    { valid:true, days:2, rate:100, subtotal:200, serviceFee:18, total:218 });
  assert.equal(quoteRental(-1, '2026-11-20', '2026-11-22').valid, false);
  assert.equal(quoteRental(100, '2026-11-22', '2026-11-20').valid, false);
  assert.equal(quoteRental(100, '2026-11-01', '2027-01-01').valid, false);
});
test('rejects actual conflicts but permits back-to-back date ranges', () => {
  assert.equal(datesOverlap('2026-11-20','2026-11-22','2026-11-21','2026-11-23'), true);
  assert.equal(datesOverlap('2026-11-20','2026-11-22','2026-11-22','2026-11-24'), false);
  const bookings = [{carId:'c1',start:'2026-11-20',end:'2026-11-22',status:'confirmed'}];
  assert.equal(hasConflict(bookings,'c1','2026-11-21','2026-11-24'), true);
  assert.equal(hasConflict(bookings,'c2','2026-11-21','2026-11-24'), false);
  assert.equal(hasConflict([{...bookings[0],status:'cancelled'}],'c1','2026-11-21','2026-11-24'), false);
});
