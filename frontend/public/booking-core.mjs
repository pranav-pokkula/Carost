/**
 * Pure booking-domain utilities used by the browser demo and Node tests.
 * Dates are calendar dates in YYYY-MM-DD format, interpreted in UTC to
 * eliminate daylight-saving anomalies in price calculations.
 */
export function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(value + 'T00:00:00.000Z');
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return null;
  return parsed;
}
export function nightsBetween(start, end) {
  const a = parseDate(start);
  const b = parseDate(end);
  if (!a || !b || b <= a) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
export function quoteRental(pricePerDay, start, end) {
  const rate = Number(pricePerDay);
  const days = nightsBetween(start, end);
  if (!Number.isFinite(rate) || rate <= 0 || days < 1 || days > 30) {
    return { valid: false, reason: 'Choose valid dates for a 1–30 day rental.' };
  }
  const subtotal = Math.round(rate * days * 100) / 100;
  const serviceFee = Math.round(subtotal * 0.09 * 100) / 100;
  const total = Math.round((subtotal + serviceFee) * 100) / 100;
  return { valid: true, days, rate, subtotal, serviceFee, total };
}
export function datesOverlap(startA, endA, startB, endB) {
  if (!nightsBetween(startA, endA) || !nightsBetween(startB, endB)) return false;
  return startA < endB && startB < endA;
}
export function hasConflict(bookings, carId, start, end) {
  return bookings.some(function (booking) {
    return booking.carId === carId && booking.status !== 'cancelled' &&
      datesOverlap(booking.start, booking.end, start, end);
  });
}
