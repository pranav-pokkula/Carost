# Carost — Premium automotive marketplace demo

**Carost is a portfolio concept, not a live rental service.** This rebuild pairs a premium vehicle-discovery UI with a fully interactive **local booking simulation**. All vehicle listings, pricing, and saved reservations are fictional. No payment or actual rental is possible.

## What changed
- New responsive, editorial automotive design: home, search, category filters, vehicle cards, vehicle details, and sample trips.
- Six curated *fictional* listings, with art-direction-specific fallback vector illustrations.
- Optional locally stored AI-generated concept photographs. Download the accompanying vehicle asset pack and unpack it at the repository root; see [media documentation](frontend/assets/carost/README.md).
- Date-based rental estimates with an illustrative service fee and 30-day limit.
- Conflict checks for overlapping simulated trips; cancel trips in the browser.
- Reusable pure booking-domain functions, plus automated Node tests.
- **Legacy Express API deliberately disabled when NODE_ENV=production**. The newer visual demo does not require it.

## Run
### Static visual demo
Serve the folder and the assets from the repository root so paths beginning with /assets resolve. For example, with Node installed:

```bash
npx serve -l 3000 -s frontend/public
```

For correct asset paths, a static server must map `/assets` to `frontend/assets`. The easiest supported option is the Express server below.

### Full local repository
```bash
npm install
npm run install-all
npm run init-db
npm start
```
Open `http://localhost:3000`.

Optional legacy API testing: copy `.env.example` to `backend/.env` and set a unique `JWT_SECRET`. Without one, the backend uses an ephemeral local secret that resets sessions on restart.

### Tests
```bash
npm test
```

The static marketplace's code lives in [frontend/public/marketplace.mjs](frontend/public/marketplace.mjs), its curated inventory in [demo-data.mjs](frontend/public/demo-data.mjs), and the testable booking rules in [booking-core.mjs](frontend/public/booking-core.mjs).

## The technical distinction
There are **two intentionally separate experiences**:

1. **Market-facing demo UI:** client-side fake inventory, favorites, trip estimates, and sample bookings persisted in localStorage. This can be safely demonstrated without collecting any personal information.
2. **Legacy educational backend:** Express/SQLite routes for accounts, vehicles, and bookings. Its booking routes have gained input and ownership checks, and the API is disabled in production. It remains **development-only**, unverified for production security, identity checks, insurance, payments, or multi-instance concurrency.

The illustrative photography is synthetic mood imagery and does **not** verify a vehicle model, trim, registration, or actual rental inventory.

## Scope and remaining engineering work
- Integrate the new UI with a verified, permissioned persistence layer.
- Replace the legacy authentication pattern and complete threat-model and authorization tests.
- Add a transactional booking strategy and payment/identity providers only if this ever becomes an actual operating business.
- Add accessible E2E tests, deploy-preview checks, and professional screenshots after verification.

**Please do not present Carost as an active booking business.** The goal is a well-scoped portfolio demonstration of product thinking, UI design, and booking logic.
