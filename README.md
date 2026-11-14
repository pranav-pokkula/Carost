# Carost

**A full-stack car rental booking prototype built with Express, SQLite, and vanilla JavaScript.**

Carost explores the backend and product flows behind a two-sided rental marketplace: vehicle discovery, account registration, listings, bookings, verification, and rental reviews. It is a **portfolio/demo application using seeded data**, not a live rental service.

## At a glance

| Layer | Implementation |
| --- | --- |
| Frontend | HTML, CSS, JavaScript, Fetch API |
| API | Node.js, Express, REST-style routes |
| Data | SQLite via better-sqlite3 |
| Authentication | bcrypt password hashes and JWT bearer tokens |
| Local environment | Node.js 18+, npm |

## What the prototype demonstrates

- **Vehicle discovery:** Browse inventory and filter by location, price, availability status, or search terms.
- **Two-sided accounts:** Renter and vehicle-owner roles with profile and vehicle endpoints.
- **Booking lifecycle:** Create reservations, inspect bookings, update status, and review rentals.
- **Data modeling:** Relational users, vehicles, bookings, verification requests, and rental-history tables.
- **API integration:** A lightweight browser frontend consuming an Express JSON API.

### Architecture

```text
Browser UI (frontend/public)
        |
        v
Express routes (backend/server.js)
        |
        +-- Authentication / authorization
        +-- Vehicle search and listings
        +-- Booking and rental history
        +-- Verification endpoints
        |
        v
SQLite (backend/carost.db, generated locally)
```

The database is initialized and populated with **fictional sample records** by `backend/initDatabase.js`. Those records are not evidence of actual customers, rentals, or marketplace activity.

## Run locally

```bash
git clone https://github.com/pranav-pokkula/Carost.git
cd Carost
npm run install-all
npm run init-db
npm start
```

Visit **http://localhost:3000**. Run `npm run dev` for development auto-restart.

Set a unique `JWT_SECRET` in your local environment before starting the server. The current source contains an insecure fallback signing key, so **do not deploy this application publicly as-is**. The sample initialization script creates development-only users and credentials; never reuse them in a real application.

## Codebase

| Path | Purpose |
| --- | --- |
| [backend/server.js](backend/server.js) | HTTP endpoints, authentication, and request handling |
| [backend/initDatabase.js](backend/initDatabase.js) | SQLite schema and synthetic seed records |
| [backend/package.json](backend/package.json) | Server dependencies and scripts |
| [frontend/public](frontend/public) | Browser pages, styles, and interactions |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Additional project notes |

## Development status and limitations

Carost is a learning and portfolio prototype. The present code has **not** been independently verified for production security, payments, booking concurrency, real identity verification, or a real vehicle inventory. In particular, the JWT fallback secret, permissive CORS configuration, and verification-code responses need redesign before production use. No deployment URL or automated test result is claimed here.

**Engineering focus:** REST API design · relational data modeling · authentication flows · full-stack feature integration.
