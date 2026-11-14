import { CATEGORIES, CARS } from './demo-data.mjs';
import { quoteRental, hasConflict } from './booking-core.mjs';

const $ = (selector) => document.querySelector(selector);
const state = { category: 'All cars', location: 'Atlanta', sort: 'featured', start: '', end: '', selected: null };
const storage = { trips: 'carost-v2-demo-trips', favorites: 'carost-v2-demo-favorites' };
let toastTimeout;
function storedJSON(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : fallback; }
  catch (_) { return fallback; }
}
let trips = storedJSON(storage.trips, []);
let favorites = storedJSON(storage.favorites, []);
function saveTrips() { localStorage.setItem(storage.trips, JSON.stringify(trips)); }
function saveFavorites() { localStorage.setItem(storage.favorites, JSON.stringify(favorites)); }
function money(value) { return '$' + Number(value).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 }); }
function localISO(date) {
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}
function offsetDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return localISO(d); }
function safeText(value) { return String(value).replace(/[&<>"']/g, function (c) {
  return { '&': '&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
}); }
function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function () { element.classList.remove('show'); }, 3800);
}
function carArt(color, category) {
  const isSUV = category === 'SUV';
  const top = isSUV ? 93 : 121;
  const roofPath = isSUV ? 'M231 170 L265 95 Q278 83 303 83 L515 84 Q538 84 552 105 L598 175 Z' :
    'M232 176 L303 118 Q324 107 350 107 L475 109 Q492 110 516 128 L570 176 Z';
  return '<svg viewBox="0 0 760 320" role="img" aria-label="Illustrative vehicle artwork" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="bodygradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + color + '"/><stop offset=".56" stop-color="' + color + '"/><stop offset="1" stop-color="#202f32"/></linearGradient><linearGradient id="glassgradient" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#c9d4cd" stop-opacity=".94"/><stop offset="1" stop-color="#2b484c"/></linearGradient></defs>' +
    '<ellipse cx="385" cy="280" rx="301" ry="23" fill="#182627" opacity=".19"/>' +
    '<path d="' + roofPath + '" fill="url(#bodygradient)" stroke="#233236" stroke-width="5"/>' +
    '<path d="M95 200 Q104 188 155 179 L234 165 L576 166 Q620 170 650 191 L682 210 Q692 215 694 235 L690 255 L653 261 L102 261 Q77 260 72 245 L73 221 Q75 205 95 200 Z" fill="url(#bodygradient)" stroke="#233236" stroke-width="5"/>' +
    '<path d="M264 168 L292 ' + top + ' L' + (isSUV?'394':'356') + ' ' + (top-1) + ' L391 168 Z" fill="url(#glassgradient)" stroke="#263f42" stroke-width="5"/>' +
    '<path d="M407 168 L404 ' + (top-1) + ' L' + (isSUV?'508':'472') + ' ' + top + ' Q487 119 542 168 Z" fill="url(#glassgradient)" stroke="#263f42" stroke-width="5"/>' +
    '<path d="M110 208 L169 201 L163 214 L109 221Z" fill="#f2f4de"/><path d="M635 211 L682 218 L681 231 L643 227Z" fill="#c9574d"/>' +
    '<path d="M113 227 Q352 205 642 229" stroke="#d8e3db" stroke-opacity=".39" stroke-width="5" fill="none"/>' +
    '<path d="M386 181 L380 250 M568 182 L575 252" stroke="#213538" stroke-width="3" opacity=".6"/>' +
    '<rect x="398" y="185" width="29" height="5" rx="2" fill="#f1eee5" opacity=".85"/>' +
    '<circle cx="204" cy="257" r="50" fill="#1d2727"/><circle cx="204" cy="257" r="32" fill="#849492" stroke="#e5e9de" stroke-width="5"/><circle cx="204" cy="257" r="11" fill="#263b3a"/>' +
    '<circle cx="580" cy="257" r="50" fill="#1d2727"/><circle cx="580" cy="257" r="32" fill="#849492" stroke="#e5e9de" stroke-width="5"/><circle cx="580" cy="257" r="11" fill="#263b3a"/>' +
    '<path d="M95 244 L145 244 M633 244 L690 244" stroke="#101819" stroke-width="7"/></svg>';
}
function photoMarkup(car, extraClass) {
  return '<div class="' + extraClass + '" style="background:linear-gradient(150deg,' + car.scene + ',#a7b9b1)">' +
    carArt(car.color, car.category) + '<img src="/assets/carost/' + encodeURIComponent(car.image) + '" loading="lazy" alt="Concept automotive mood photograph; not the exact listed vehicle" onerror="this.remove()">' +
    '</div>';
}
function renderFilters() {
  $('#category-filters').innerHTML = CATEGORIES.map(function (c) {
    return '<button type="button" class="chip' + (state.category === c ? ' active' : '') +
      '" data-category="' + c + '" aria-pressed="' + (state.category === c) + '">' + c + '</button>';
  }).join('');
}
function filteredCars() {
  const query = state.location.trim().toLowerCase();
  let list = CARS.filter(function (car) {
    const typeMatch = state.category === 'All cars' || car.category === state.category;
    const areaMatch = !query || (car.city + ' ' + car.area + ' ' + car.make + ' ' + car.model).toLowerCase().includes(query);
    return typeMatch && areaMatch;
  });
  if (state.sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  if (state.sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  return list;
}
function carCard(car) {
  const fav = favorites.includes(car.id);
  const flagged = fav ? ' saved' : '';
  const details = safeText(car.make + ' ' + car.model);
  return '<article class="vehicle-card">' +
    '<div class="vehicle-art" style="background:linear-gradient(140deg,' + car.scene + ',#acbab1)">' +
    carArt(car.color, car.category) +
    '<img src="/assets/carost/' + encodeURIComponent(car.image) + '" alt="Automotive concept photograph, illustrative only" loading="lazy" onerror="this.remove()">' +
    '<span class="vehicle-tag">' + safeText(car.tag) + '</span>' +
    '<button class="favorite' + flagged + '" type="button" data-favorite="' + car.id + '" aria-label="' + (fav?'Remove favorite ':'Save favorite ') + details + '" aria-pressed="' + fav + '">' + (fav?'♥':'♡') + '</button></div>' +
    '<div class="vehicle-body"><div class="vehicle-topline"><div><h3 class="vehicle-title">' + details + '</h3><div class="vehicle-area">⌖ ' + car.area + ', ' + car.city + ' · ' + car.year + '</div></div><div class="vehicle-price">' + money(car.price) + '<small> / day</small></div></div>' +
    '<div class="vehicle-meta"><span>' + car.seats + ' seats</span><span>' + car.gearbox + '</span><span>' + car.power + '</span></div>' +
    '<div class="vehicle-actions"><span>Fictional listing</span><button type="button" data-details="' + car.id + '">View details ↗</button></div></div></article>';
}
function renderFleet() {
  const list = filteredCars();
  $('#fleet-grid').innerHTML = list.length ? list.map(carCard).join('') :
    '<div class="empty-results"><h3>No matches on this route.</h3><p>Try Atlanta or clear the category filter to see the complete concept collection.</p><button type="button" class="chip" id="reset-search">Clear search</button></div>';
  $('#fleet-count').textContent = 'Showing ' + list.length + ' of ' + CARS.length + ' fictional vehicles. Prices are illustrative.';
}
function openDetails(id) {
  const car = CARS.find(function (item) { return item.id === id; });
  if (!car) return;
  state.selected = id;
  const dialog = $('#detail-dialog');
  $('#detail-content').innerHTML =
    '<div class="detail-layout"><div>' + photoMarkup(car, 'detail-image') +
    '<p class="demo-note">AI-generated images and vector illustrations are for aesthetic reference only. No real car is offered.</p>' +
    '<div class="detail-specs"><span>' + car.year + '</span><span>' + car.seats + ' seats</span><span>' + car.gearbox + '</span><span>' + car.power + '</span></div></div>' +
    '<div class="detail-content"><div class="section-kicker">' + car.category.toUpperCase() + ' COLLECTION</div><h2 id="detail-heading">' + safeText(car.make + ' ' + car.model) + '</h2>' +
    '<p>⌖ ' + car.area + ', ' + car.city + '</p><p>' + safeText(car.description) + '</p>' +
    '<form class="booking-form" id="booking-form"><h3>Plan your sample trip</h3><div class="date-grid"><label>Pick-up date<input type="date" name="start" id="booking-start" min="' + localISO(new Date()) + '" value="' + state.start + '" required></label>' +
    '<label>Return date<input type="date" name="end" id="booking-end" min="' + localISO(new Date()) + '" value="' + state.end + '" required></label></div>' +
    '<div class="quote" id="quote"></div><button class="book-btn" id="book-button" type="submit">Save demo booking ↗</button>' +
    '<p class="booking-note">This saves a sample reservation to this browser only. No charge, confirmation email, or real vehicle.</p></form></div></div>';
  dialog.showModal();
  updateQuote();
}
function updateQuote() {
  const car = CARS.find((item) => item.id === state.selected);
  if (!car) return;
  const start = $('#booking-start').value;
  const end = $('#booking-end').value;
  const quote = quoteRental(car.price, start, end);
  const conflict = quote.valid && hasConflict(trips, car.id, start, end);
  const button = $('#book-button');
  button.disabled = !quote.valid || conflict || start < localISO(new Date());
  if (!quote.valid) {
    $('#quote').textContent = 'Select a valid 1–30 day rental to see the cost.';
    return;
  }
  if (conflict) {
    $('#quote').textContent = 'Those dates overlap with an existing sample trip for this car. Choose another range.';
    return;
  }
  $('#quote').innerHTML = '<div class="quote-row"><span>' + money(quote.rate) + ' × ' + quote.days + ' day' + (quote.days===1?'':'s') + '</span><strong>' + money(quote.subtotal) + '</strong></div>' +
    '<div class="quote-row"><span>Illustrative service fee (9%)</span><strong>' + money(quote.serviceFee) + '</strong></div>' +
    '<div class="quote-row total"><span>Estimated total</span><strong>' + money(quote.total) + '</strong></div>';
}
function createDemoTrip(event) {
  event.preventDefault();
  const car = CARS.find((item) => item.id === state.selected);
  if (!car) return;
  const start = $('#booking-start').value;
  const end = $('#booking-end').value;
  const quote = quoteRental(car.price, start, end);
  if (!quote.valid || start < localISO(new Date()) || hasConflict(trips, car.id, start, end)) {
    toast('Those dates are not available for this sample booking.');
    updateQuote();
    return;
  }
  trips.unshift({ id: 'demo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), carId: car.id, start, end, total: quote.total, status: 'confirmed' });
  saveTrips();
  $('#detail-dialog').close();
  renderTrips();
  $('#trips-dialog').showModal();
  toast('Demo trip saved locally. No real reservation was made.');
}
function renderTrips() {
  const active = trips.filter((b) => b.status === 'confirmed').length;
  $('#trips-content').innerHTML = '<div class="section-kicker">YOUR LOCAL DEMO</div><h2 class="trips-heading" id="trips-heading">Your sample trips</h2>' +
    '<p class="demo-note">' + active + ' active · Saved in this browser only. No account or payment information is collected.</p>' +
    (trips.length ? trips.map(function (trip) {
      const car = CARS.find((c) => c.id === trip.carId);
      const title = car ? car.make + ' ' + car.model : 'Sample vehicle';
      return '<div class="trip-card' + (trip.status === 'cancelled'?' cancelled':'') +
        '"><div><span class="trip-status">' + trip.status.toUpperCase() + '</span><h3>' + safeText(title) + '</h3>' +
        '<p>' + trip.start + ' to ' + trip.end + ' · ' + money(trip.total) + ' estimated</p>' +
        '</div>' + (trip.status === 'confirmed' ? '<button type="button" data-cancel="' + safeText(trip.id) + '">Cancel sample</button>' : '') + '</div>';
    }).join('') : '<div class="empty-results"><h3>No trips yet.</h3><p>Explore the fleet and save your first sample drive.</p></div>');
}
function attachEvents() {
  $('#search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    state.location = $('#search-location').value;
    state.start = $('#search-start').value;
    state.end = $('#search-end').value;
    if (!quoteRental(1, state.start, state.end).valid) { toast('Choose a valid 1–30 day date range.'); return; }
    state.category = 'All cars';
    renderFilters();
    renderFleet();
    $('#fleet').scrollIntoView({ behavior: 'smooth' });
  });
  $('#sort-select').addEventListener('change', function () { state.sort = this.value; renderFleet(); });
  $('#category-filters').addEventListener('click', function (event) {
    const btn = event.target.closest('[data-category]');
    if (!btn) return;
    state.category = btn.dataset.category;
    renderFilters(); renderFleet();
  });
  $('#fleet-grid').addEventListener('click', function (event) {
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) {
      const id = favorite.dataset.favorite;
      favorites = favorites.includes(id) ? favorites.filter((value) => value !== id) : favorites.concat(id);
      saveFavorites(); renderFleet(); return;
    }
    const details = event.target.closest('[data-details]');
    if (details) { openDetails(details.dataset.details); return; }
    if (event.target.closest('#reset-search')) {
      state.location = ''; state.category = 'All cars'; $('#search-location').value = '';
      renderFilters(); renderFleet();
    }
  });
  $('#detail-close').addEventListener('click', () => $('#detail-dialog').close());
  $('#detail-content').addEventListener('input', function (event) {
    if (event.target.matches('#booking-start,#booking-end')) updateQuote();
  });
  $('#detail-content').addEventListener('submit', function (event) {
    if (event.target.matches('#booking-form')) createDemoTrip(event);
  });
  $('#trips-open').addEventListener('click', function () { renderTrips(); $('#trips-dialog').showModal(); });
  $('#trips-close').addEventListener('click', () => $('#trips-dialog').close());
  $('#trips-content').addEventListener('click', function (event) {
    const button = event.target.closest('[data-cancel]');
    if (!button) return;
    const trip = trips.find((b) => b.id === button.dataset.cancel);
    if (trip) { trip.status = 'cancelled'; saveTrips(); renderTrips(); toast('Sample reservation cancelled.'); }
  });
  for (const dialog of [$('#detail-dialog'), $('#trips-dialog')]) {
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  }
}
function init() {
  state.start = offsetDays(1);
  state.end = offsetDays(3);
  $('#search-start').value = state.start;
  $('#search-end').value = state.end;
  $('#search-start').min = localISO(new Date());
  $('#search-end').min = localISO(new Date());
  $('#copyright-year').textContent = String(new Date().getFullYear());
  $('#hero-art').innerHTML = carArt('#95a6a0', 'Luxury');
  $('#host-art').innerHTML = carArt('#bcc5ae', 'SUV');
  renderFilters(); renderFleet(); renderTrips(); attachEvents();
}
init();
