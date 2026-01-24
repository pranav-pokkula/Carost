# ParkShare Backend

RESTful API server for the ParkShare car rental application.

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** (better-sqlite3) - Database
- **JWT** (jsonwebtoken) - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-Origin Resource Sharing

## Files

- `server.js` - Main Express server with all API routes
- `initDatabase.js` - Database initialization and seed data script
- `parkshare.db` - SQLite database (created after running init script)
- `.env` - Environment variables
- `package.json` - Dependencies and scripts

## Installation

```bash
npm install
```

## Scripts

- `npm start` - Start the server
- `npm run dev` - Start with nodemon for development
- `npm run init-db` - Initialize database with seed data

## Environment Variables

Create a `.env` file:

```
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

## Database Schema

### Tables

1. **users** - User accounts (renters and owners)
2. **vehicles** - Vehicle listings
3. **bookings** - Rental bookings
4. **rental_history** - Completed rentals with reviews
5. **verification_requests** - User verification requests

## API Endpoints

All endpoints are prefixed with `/api`

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get vehicle details

### Authentication Required
- All other endpoints require JWT token in Authorization header
- Format: `Authorization: Bearer <token>`

## Starting the Server

```bash
npm start
```

Server runs on http://localhost:3000
