# ParkShare - Complete Project Overview

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [How the Application Works](#how-the-application-works)
4. [Database Schema](#database-schema)
5. [Authentication Flow](#authentication-flow)
6. [API Documentation](#api-documentation)
7. [Frontend-Backend Communication](#frontend-backend-communication)
8. [Key Features Explained](#key-features-explained)
9. [Data Flow Diagrams](#data-flow-diagrams)

---

## 🏗️ Architecture Overview

ParkShare follows a **client-server architecture** with clear separation between frontend and backend:

```
┌─────────────────────────────────────────────────────────────┐
│                      USER BROWSER                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Frontend (HTML/CSS/JavaScript)                       │  │
│  │  - Static pages served by Express                     │  │
│  │  - Dynamic content via JavaScript (app.js)            │  │
│  │  - API calls using Fetch API                          │  │
│  └────────────────────┬──────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │ HTTP/HTTPS
                          │ JSON over REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND SERVER (Node.js)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Express.js Server (server.js)                        │  │
│  │  - Route handlers for API endpoints                   │  │
│  │  - JWT authentication middleware                      │  │
│  │  - Business logic                                     │  │
│  └────────────────────┬──────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼──────────────────────────────────┐  │
│  │  SQLite Database (parkshare.db)                       │  │
│  │  - Users, Vehicles, Bookings, History, Verification  │  │
│  │  - Managed by better-sqlite3                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Carost/
├── backend/                          # Backend server directory
│   ├── server.js                     # Main Express server (REST API)
│   ├── initDatabase.js               # Database initialization script
│   ├── parkshare.db                  # SQLite database file
│   ├── package.json                  # Backend dependencies
│   ├── .env                          # Environment variables
│   ├── node_modules/                 # Installed dependencies
│   └── README.md                     # Backend documentation
│
├── frontend/                         # Frontend application
│   ├── public/                       # Static files (served by Express)
│   │   ├── index.html                # Landing page
│   │   ├── login.html                # Login form
│   │   ├── register.html             # Registration form
│   │   ├── dashboard.html            # User dashboard
│   │   ├── vehicles.html             # Vehicle listing page
│   │   ├── vehicles-details.html     # Single vehicle details
│   │   ├── booking.html              # Booking form
│   │   ├── app.js                    # Frontend JavaScript (API calls)
│   │   └── styles.css                # Application styling
│   │
│   ├── assets/                       # Static assets
│   │   └── Images/                   # Vehicle images
│   │       └── Camry.png
│   └── README.md                     # Frontend documentation
│
├── package.json                      # Root package.json (scripts)
├── .gitignore                        # Git ignore file
└── README.md                         # Main project documentation
```

---

## 🔍 How the Application Works

### File Responsibilities

#### **backend/server.js** (Main Backend Server)
- **Lines 1-21**: Setup and configuration
  - Import required modules (Express, bcrypt, JWT, SQLite)
  - Initialize Express app
  - Configure middleware (CORS, JSON parsing, static file serving)
  - Connect to SQLite database

- **Lines 23-33**: Authentication middleware
  - `authenticateToken()` - Validates JWT tokens for protected routes
  - Extracts token from Authorization header
  - Verifies token and attaches user info to request

- **Lines 35-100**: Authentication Routes (`/api/auth/*`)
  - `POST /api/auth/register` - Create new user account
  - `POST /api/auth/login` - Authenticate user and return JWT token
  - `POST /api/auth/verify` - Verify user account with code

- **Lines 102-140**: User Routes (`/api/users/*`)
  - `GET /api/users/me` - Get current user profile
  - `GET /api/users` - Get all users (admin/demo)

- **Lines 142-230**: Vehicle Routes (`/api/vehicles/*`)
  - `GET /api/vehicles` - List all vehicles with filters
  - `GET /api/vehicles/:id` - Get single vehicle details
  - `POST /api/vehicles` - Create new vehicle listing (owner only)
  - `GET /api/users/:userId/vehicles` - Get vehicles by owner

- **Lines 232-290**: Booking Routes (`/api/bookings/*`)
  - `GET /api/bookings` - Get user's bookings
  - `POST /api/bookings` - Create new booking
  - `PATCH /api/bookings/:id` - Update booking status

- **Lines 292-330**: Rental History Routes (`/api/rental-history/*`)
  - `GET /api/rental-history` - Get rental history with reviews
  - `POST /api/rental-history` - Add review for completed rental

- **Lines 332-365**: Verification Routes (`/api/verification/*`)
  - `POST /api/verification` - Submit verification request
  - `GET /api/verification` - Get verification status

- **Lines 367-385**: Statistics and Utility Routes
  - `GET /api/stats` - Dashboard statistics
  - `GET /api/health` - Server health check
  - `GET /` - Serve frontend homepage

#### **backend/initDatabase.js** (Database Initialization)
- **Lines 1-10**: Setup
  - Import dependencies
  - Connect to database

- **Lines 12-68**: Create Tables
  - Creates 5 tables with proper relationships
  - Enables foreign key constraints
  - Defines indexes and constraints

- **Lines 70-125**: Generate Users
  - Creates 123 users (3 admin + 120 random)
  - Hashes passwords with bcrypt
  - Assigns roles (renter/owner)
  - Sets verification status

- **Lines 127-173**: Generate Vehicles
  - Creates 80 vehicles
  - Multiple brands (Toyota, Honda, Ford, BMW, Tesla, etc.)
  - Random locations, prices, mileage
  - Assigns to random owners

- **Lines 175-195**: Generate Bookings
  - Creates 50 bookings
  - Various statuses (pending, confirmed, completed, cancelled)
  - Calculates total cost based on duration

- **Lines 197-215**: Generate Rental History
  - Creates reviews for completed bookings
  - Ratings (3-5 stars)
  - Sample review text

- **Lines 217-235**: Generate Verification Requests
  - Creates 30 verification requests
  - Different document types
  - Various statuses

#### **frontend/public/app.js** (Frontend Logic)
- **Lines 1-10**: Configuration
  - API base URL configuration
  - Global state variables (currentUser, authToken)

- **Lines 11-55**: Authentication Utilities
  - `setAuthToken()` - Store JWT token
  - `getAuthToken()` - Retrieve JWT token
  - `clearAuth()` - Clear authentication
  - `apiRequest()` - Generic API call function with auth headers

- **Lines 57-72**: User Management
  - `loadCurrentUser()` - Load user from token
  - Refresh user data from API

- **Lines 74-94**: Registration
  - `register()` - Handle registration form
  - Validate input
  - Call API and redirect

- **Lines 96-120**: Login
  - `login()` - Handle login form
  - Store token and user data
  - Check verification status
  - Redirect to dashboard

- **Lines 122-126**: Logout
  - `logout()` - Clear auth and redirect

- **Lines 128-148**: User Display
  - `displayUserName()` - Show user name and verification badge
  - Update verification status UI

- **Lines 150-183**: Vehicle Listing
  - `displayVehicles()` - Fetch and display all vehicles
  - Create vehicle cards dynamically
  - Handle loading states

- **Lines 185-194**: Vehicle Details
  - `viewVehicle()` - Navigate to vehicle details
  - Store selected vehicle in localStorage

- **Lines 196-217**: Vehicle Details Display
  - `displayVehicleDetails()` - Show detailed vehicle info
  - Disable booking button if not available

- **Lines 219-260**: Booking System
  - `bookVehicle()` - Handle booking form submission
  - Validate dates
  - Calculate cost
  - Create booking via API

- **Lines 262-302**: Booking Management
  - `displayBookings()` - Show user's bookings
  - `updateBookingStatus()` - Confirm/complete/cancel bookings
  - Dynamic action buttons based on status

- **Lines 304-353**: Rental History
  - `displayRentalHistory()` - Show completed rentals with reviews
  - Display ratings and reviews

- **Lines 355-392**: Statistics
  - `displayStats()` - Show dashboard statistics
  - Create stat cards for key metrics

- **Lines 394-411**: Verification
  - `submitVerification()` - Submit verification request
  - Handle document type and number

- **Lines 413-442**: Navigation
  - `updateNavigation()` - Show/hide menu items based on auth
  - Dynamic navigation for logged in/out users

- **Lines 439-442**: Initialization
  - `init()` - Run on page load
  - Load user and update UI

#### **HTML Pages**

**index.html** - Landing Page
- Navigation bar with dynamic links
- Hero section with call-to-action
- Links to register/login or dashboard

**login.html** - Login Form
- Email and password inputs
- Calls `login()` function on submit
- Redirects to dashboard on success

**register.html** - Registration Form
- Role selection (renter/owner)
- Name, email, password, phone inputs
- Calls `register()` function
- Shows verification code after registration

**dashboard.html** - User Dashboard
- Displays user name and verification status
- Statistics cards (total users, vehicles, bookings)
- User's bookings list
- Rental history
- Link to browse vehicles

**vehicles.html** - Vehicle Listing
- Display all available vehicles
- Filter by location, price, status
- Search functionality
- Click to view details

**vehicles-details.html** - Vehicle Details
- Full vehicle information
- Owner details
- Book button (disabled if not available)
- Back to vehicles link

**booking.html** - Booking Form
- Start and end date/time pickers
- Calculates total cost
- Creates booking via API
- Redirects to dashboard on success

---

## 🗄️ Database Schema

### Tables and Relationships

```sql
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │◄──┐
│ email (UNIQUE)  │   │
│ password        │   │ Owner
│ name            │   │
│ role            │   │
│ phone           │   │
│ verified        │   │
│ verification_   │   │
│   code          │   │
│ created_at      │   │
└─────────────────┘   │
                      │
                      │
┌─────────────────┐   │
│   VEHICLES      │   │
├─────────────────┤   │
│ id (PK)         │   │
│ owner_id (FK)   │───┘
│ brand           │
│ model           │
│ year            │
│ license_plate   │
│ price_per_hour  │◄──┐
│ mileage         │   │
│ location        │   │
│ description     │   │
│ status          │   │
│ image_url       │   │
│ created_at      │   │
└─────────────────┘   │
         │            │
         │ Vehicle    │
         │            │
         ▼            │
┌─────────────────┐   │
│   BOOKINGS      │   │
├─────────────────┤   │
│ id (PK)         │   │
│ vehicle_id (FK) │───┘
│ renter_id (FK)  │───┐
│ start_time      │   │
│ end_time        │   │ Renter
│ total_cost      │   │
│ status          │   │
│ created_at      │   │
└─────────────────┘   │
         │            │
         │ Booking    │
         │            │
         ▼            │
┌─────────────────┐   │
│ RENTAL_HISTORY  │   │
├─────────────────┤   │
│ id (PK)         │   │
│ booking_id (FK) │   │
│ rating          │   │
│ review          │   │
│ completed_at    │   │
└─────────────────┘   │
                      │
                      │
┌─────────────────┐   │
│ VERIFICATION_   │   │
│   REQUESTS      │   │
├─────────────────┤   │
│ id (PK)         │   │
│ user_id (FK)    │───┘
│ document_type   │
│ document_number │
│ status          │
│ submitted_at    │
│ reviewed_at     │
└─────────────────┘
```

### Table Details

**USERS**
- Stores user accounts (renters and owners)
- Passwords are hashed with bcrypt (10 salt rounds)
- Verification code used for account verification
- Role: 'renter' or 'owner'

**VEHICLES**
- Vehicle listings by owners
- Status: 'available', 'booked', 'maintenance'
- Price stored as per-hour rate
- Linked to owner via owner_id

**BOOKINGS**
- Rental bookings between renters and vehicles
- Status: 'pending', 'confirmed', 'completed', 'cancelled'
- Total cost calculated: (hours × price_per_hour)
- Foreign keys ensure data integrity

**RENTAL_HISTORY**
- Created when booking is marked 'completed'
- Stores ratings (1-5) and reviews
- Linked to completed bookings

**VERIFICATION_REQUESTS**
- User verification for trust/fraud prevention
- Document types: 'drivers_license', 'passport', 'national_id'
- Status: 'pending', 'approved', 'rejected'

---

## 🔐 Authentication Flow

### Registration Process

```
User fills form → Frontend validates → POST /api/auth/register
                                              ↓
                                    Backend validates data
                                              ↓
                                    Check if email exists
                                              ↓
                                    Hash password (bcrypt)
                                              ↓
                                    Generate verification code
                                              ↓
                                    Insert into database
                                              ↓
                                    Return userId + code
                                              ↓
                                    Frontend shows code
                                              ↓
                                    Redirect to login
```

### Login Process

```
User enters credentials → Frontend validates → POST /api/auth/login
                                                      ↓
                                            Find user by email
                                                      ↓
                                            Verify password (bcrypt.compare)
                                                      ↓
                                            Generate JWT token
                                                      ↓
                                            Token payload: {id, email, role}
                                                      ↓
                                            Expires in 24 hours
                                                      ↓
                                            Return token + user data
                                                      ↓
                                            Frontend stores token
                                                      ↓
                                            Redirect to dashboard
```

### Protected Request Flow

```
User action → Frontend gets token from localStorage
                            ↓
                    Add to Authorization header
                            ↓
                    "Bearer <token>"
                            ↓
                    Send API request
                            ↓
                    Backend middleware intercepts
                            ↓
                    Extract token from header
                            ↓
                    Verify token with JWT_SECRET
                            ↓
                    If valid: attach user to req.user
                            ↓
                    If invalid: return 401/403 error
                            ↓
                    Route handler accesses req.user
```

---

## 📡 API Documentation

### Request/Response Examples

#### 1. Register New User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "role": "renter",
  "phone": "555-1234"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please verify your account.",
  "userId": 124,
  "verificationCode": "A3X9K2"
}
```

#### 2. Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@parkshare.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@parkshare.com",
    "name": "Admin User",
    "role": "owner",
    "verified": 1
  }
}
```

#### 3. Get Vehicles (Public)

**Request:**
```http
GET /api/vehicles?location=Downtown&minPrice=10&maxPrice=30
```

**Response:**
```json
{
  "vehicles": [
    {
      "id": 1,
      "owner_id": 2,
      "brand": "Toyota",
      "model": "Camry",
      "year": 2022,
      "license_plate": "ABC123",
      "price_per_hour": 15,
      "mileage": 30000,
      "location": "Downtown",
      "description": "Well-maintained Toyota Camry",
      "status": "available",
      "image_url": "/assets/Images/Camry.png",
      "owner_name": "Jane Smith",
      "owner_phone": "555-0003"
    }
  ],
  "total": 1
}
```

#### 4. Create Booking (Protected)

**Request:**
```http
POST /api/bookings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "vehicleId": 1,
  "startTime": "2026-01-25T10:00:00Z",
  "endTime": "2026-01-25T15:00:00Z"
}
```

**Response:**
```json
{
  "message": "Booking created successfully",
  "bookingId": 51,
  "totalCost": 75,
  "hours": 5
}
```

#### 5. Get User Bookings (Protected)

**Request:**
```http
GET /api/bookings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "bookings": [
    {
      "id": 51,
      "vehicle_id": 1,
      "renter_id": 2,
      "start_time": "2026-01-25T10:00:00Z",
      "end_time": "2026-01-25T15:00:00Z",
      "total_cost": 75,
      "status": "pending",
      "brand": "Toyota",
      "model": "Camry",
      "location": "Downtown",
      "renter_name": "John Doe",
      "renter_email": "john.doe@example.com"
    }
  ],
  "total": 1
}
```

---

## 🔄 Frontend-Backend Communication

### How Frontend Calls Backend

1. **API Request Function** (`app.js` lines 27-55)
```javascript
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}
```

2. **Example Usage in Frontend**
```javascript
// Login
const data = await apiRequest('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Get vehicles (public)
const vehicles = await apiRequest('/vehicles');

// Create booking (requires auth)
const booking = await apiRequest('/bookings', {
  method: 'POST',
  body: JSON.stringify({ vehicleId, startTime, endTime })
});
```

3. **Backend Processes Request**
- Express routes receive the request
- Middleware validates JWT token (if protected route)
- Route handler processes the request
- Database operations performed
- Response sent back to frontend
- Frontend updates UI based on response

---

## ⚙️ Key Features Explained

### 1. **Vehicle Browsing**

**How it works:**
1. User visits vehicles.html
2. Page loads → `init()` → `displayVehicles()` called
3. Frontend: `apiRequest('/vehicles')` - GET request
4. Backend: Query database for available vehicles
5. Backend: Join with users table to get owner info
6. Backend: Return vehicles array
7. Frontend: Create HTML cards for each vehicle
8. Frontend: Insert into DOM

**Files involved:**
- `frontend/public/vehicles.html` - UI
- `frontend/public/app.js` (lines 150-183) - Display logic
- `backend/server.js` (lines 142-190) - API endpoint

### 2. **Booking System**

**How it works:**
1. User selects vehicle → clicks "View Details"
2. Vehicle stored in localStorage
3. User clicks "Book Now" → redirected to booking.html
4. User selects start/end times
5. Frontend validates dates
6. Frontend calculates duration
7. Frontend: `POST /api/bookings` with vehicleId, times
8. Backend: Gets vehicle price
9. Backend: Calculates total cost
10. Backend: Creates booking record
11. Backend: Updates vehicle status to 'booked'
12. Backend: Returns booking confirmation
13. Frontend: Shows success message
14. Frontend: Redirects to dashboard

**Files involved:**
- `frontend/public/vehicles-details.html` - Vehicle details
- `frontend/public/booking.html` - Booking form
- `frontend/public/app.js` (lines 219-260) - Booking logic
- `backend/server.js` (lines 232-290) - Booking API

### 3. **Authentication & Authorization**

**JWT Token Structure:**
```javascript
// Payload
{
  "id": 1,
  "email": "admin@parkshare.com",
  "role": "owner",
  "iat": 1706122456,  // Issued at
  "exp": 1706208856   // Expires in 24 hours
}
```

**How authorization works:**
1. User logs in → receives JWT token
2. Token stored in localStorage
3. Every API request includes token in header
4. Backend middleware (`authenticateToken`) validates:
   - Token present?
   - Token valid signature?
   - Token not expired?
5. If valid: Request proceeds, `req.user` has user info
6. If invalid: Return 401 or 403 error
7. Route handler can check user role/permissions

**Role-based access:**
```javascript
// Only owners can create vehicles
if (req.user.role !== 'owner') {
  return res.status(403).json({ error: 'Only owners can list vehicles' });
}
```

### 4. **User Verification System**

**Purpose:** Reduce fraud, improve trust

**How it works:**
1. User registers → gets verification code
2. User can submit verification request with documents
3. Admin reviews verification (in real app)
4. User status updated to verified
5. Verified badge shown on profile
6. Verified users may get priority/benefits

**Files involved:**
- `frontend/public/app.js` (lines 128-148, 394-411)
- `backend/server.js` (lines 332-365)
- Database: `verification_requests` table

### 5. **Rental History & Reviews**

**How it works:**
1. Booking completed → status = 'completed'
2. User can add review via dashboard
3. Frontend: `POST /api/rental-history` with rating, review
4. Backend: Creates rental_history record
5. Dashboard shows all rental history
6. Reviews linked to specific bookings

**Files involved:**
- `frontend/public/app.js` (lines 319-353)
- `backend/server.js` (lines 292-330)
- Database: `rental_history` table

---

## 📊 Data Flow Diagrams

### Complete Booking Flow

```
┌─────────────┐
│   USER      │
└──────┬──────┘
       │
       │ 1. Browse vehicles
       ▼
┌─────────────────────┐
│  vehicles.html      │  ──GET /api/vehicles──►  ┌──────────────┐
│  (Vehicle List)     │                           │   Backend    │
└──────┬──────────────┘  ◄─────vehicles[]────    │   Server     │
       │                                           └───────┬──────┘
       │ 2. Click vehicle                                  │
       ▼                                                   │ Query DB
┌─────────────────────┐                            ┌──────▼──────┐
│ vehicles-details.   │  ──GET /api/vehicles/:id─► │   SQLite    │
│    html             │                            │  Database   │
│ (Vehicle Details)   │  ◄────vehicle object────   └─────────────┘
└──────┬──────────────┘
       │
       │ 3. Click "Book Now"
       ▼
┌─────────────────────┐
│   booking.html      │
│  (Booking Form)     │
└──────┬──────────────┘
       │
       │ 4. Select dates & submit
       │    + JWT token in header
       ▼
    POST /api/bookings
    {vehicleId, startTime, endTime}
       │
       ▼
┌─────────────────────┐
│  Backend validates  │
│  - Token valid?     │
│  - Vehicle avail?   │
│  - Dates valid?     │
└──────┬──────────────┘
       │
       │ 5. Calculate cost
       │    Insert booking
       │    Update vehicle status
       ▼
┌─────────────────────┐
│  Database Updated   │
│  - New booking row  │
│  - Vehicle = booked │
└──────┬──────────────┘
       │
       │ 6. Return success
       ▼
┌─────────────────────┐
│  Frontend shows     │
│  success message    │
│  Redirects to       │
│  dashboard          │
└─────────────────────┘
```

### Authentication Data Flow

```
┌──────────────┐
│ Registration │
└──────┬───────┘
       │
       │ POST /api/auth/register
       │ {email, password, name, role}
       ▼
┌────────────────────────┐
│  Backend:              │
│  1. Hash password      │───bcrypt.hash()
│  2. Generate ver code  │
│  3. Insert to DB       │
│  4. Return userId+code │
└────────┬───────────────┘
         │
         ▼
    ┌─────────┐
    │ Database│
    │  users  │
    └─────────┘

┌──────────────┐
│    Login     │
└──────┬───────┘
       │
       │ POST /api/auth/login
       │ {email, password}
       ▼
┌────────────────────────┐
│  Backend:              │
│  1. Find user by email │
│  2. Verify password    │───bcrypt.compare()
│  3. Generate JWT       │───jwt.sign()
│  4. Return token+user  │
└────────┬───────────────┘
         │
         │ {token, user}
         ▼
┌────────────────────────┐
│  Frontend:             │
│  1. Store token        │───localStorage
│  2. Store user         │───localStorage
│  3. Redirect           │
└────────────────────────┘

┌──────────────────────┐
│  Protected Request   │
└──────┬───────────────┘
       │
       │ GET /api/bookings
       │ Authorization: Bearer <token>
       ▼
┌────────────────────────┐
│  Middleware:           │
│  1. Extract token      │
│  2. Verify signature   │───jwt.verify()
│  3. Check expiration   │
│  4. Attach to req.user │
└────────┬───────────────┘
         │
         │ If valid
         ▼
┌────────────────────────┐
│  Route Handler:        │
│  1. Access req.user    │
│  2. Query database     │
│  3. Return data        │
└────────────────────────┘
```

---

## 🚀 Startup Sequence

### When you run `npm start`:

1. **package.json** (root) → runs script: `cd backend && npm start`
2. **backend/package.json** → runs: `node server.js`
3. **server.js** executes:
   - Line 1-8: Import dependencies
   - Line 10-12: Setup Express app and config
   - Line 15-16: Connect to SQLite database (`parkshare.db`)
   - Line 19-21: Configure middleware (CORS, JSON, static files)
   - Line 23-33: Setup authentication middleware
   - Line 35-385: Define all API routes
   - Line 387-395: Start listening on port 3000
   - Console displays: Server running message

4. **Server is ready:**
   - Frontend files served from `frontend/public/`
   - Assets served from `frontend/assets/`
   - API available at `http://localhost:3000/api/*`
   - Homepage at `http://localhost:3000/`

5. **User visits homepage:**
   - Express serves `frontend/public/index.html`
   - Browser loads `app.js` and `styles.css`
   - `init()` function runs on page load
   - Checks for existing auth token
   - Updates navigation based on login status

---

## 🔧 Environment Configuration

### backend/.env

```bash
# Server Configuration
PORT=3000                    # Port for Express server
NODE_ENV=development         # Environment (development/production)

# Security
JWT_SECRET=your-secret-key   # Secret for signing JWT tokens (CHANGE IN PRODUCTION!)
```

**How it's used:**
```javascript
// In server.js
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
```

---

## 📝 Summary

### Request Flow (Complete Example)

**Scenario: User books a vehicle**

1. **Frontend (vehicles.html):**
   - User clicks "View Details" on a vehicle
   - `viewVehicle(id)` called (app.js line 186)
   - Fetches vehicle from API
   - Stores in localStorage
   - Navigates to vehicles-details.html

2. **Frontend (vehicles-details.html):**
   - Page loads
   - `displayVehicleDetails()` called (app.js line 197)
   - Reads vehicle from localStorage
   - Displays all vehicle information
   - User clicks "Book Now"
   - Navigates to booking.html

3. **Frontend (booking.html):**
   - User fills in start/end times
   - Submits form
   - `bookVehicle(event)` called (app.js line 220)
   - Validates dates
   - Retrieves auth token from localStorage
   - Makes API call to `/api/bookings`

4. **Backend (server.js):**
   - Request hits Express server (line 245)
   - `authenticateToken` middleware validates JWT (line 23)
   - Token valid → user info attached to req.user
   - Route handler executes (line 245-275)
   - Validates vehicleId exists and is available
   - Calculates total cost
   - Creates booking in database
   - Updates vehicle status to 'booked'
   - Returns booking confirmation

5. **Frontend (booking.html):**
   - Receives response
   - Shows success message
   - Redirects to dashboard.html

6. **Frontend (dashboard.html):**
   - Page loads
   - `displayBookings()` called (app.js line 263)
   - Fetches all user bookings
   - Displays new booking in list

### File Dependencies

```
index.html ─┬─► app.js ──► API (server.js) ──► Database (parkshare.db)
            └─► styles.css

server.js ──┬─► SQLite (better-sqlite3)
            ├─► bcrypt (password hashing)
            ├─► jsonwebtoken (JWT auth)
            └─► express (web server)

initDatabase.js ──► parkshare.db (creates/seeds)
```

---

This documentation provides a complete overview of how ParkShare works. Each component, file, and feature is explained with its purpose, implementation, and how it fits into the overall system.
