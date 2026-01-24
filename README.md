# Carost - Car Rental Application

A full-stack car rental application with RESTful backend services, SQL database, and user-friendly interface.

## 📁 Project Structure

```
Carost/
├── backend/                 # Backend API server
│   ├── server.js           # Express server with REST API
│   ├── initDatabase.js     # Database initialization script
│   ├── carost.db        # SQLite database
│   ├── package.json        # Backend dependencies
│   ├── .env                # Environment variables
│   └── node_modules/       # Backend dependencies
│
├── frontend/               # Frontend application
│   ├── public/             # Static HTML, CSS, JS files
│   │   ├── index.html      # Home page
│   │   ├── login.html      # Login page
│   │   ├── register.html   # Registration page
│   │   ├── dashboard.html  # User dashboard
│   │   ├── vehicles.html   # Vehicle listing
│   │   ├── vehicles-details.html  # Vehicle details
│   │   ├── booking.html    # Booking form
│   │   ├── app.js          # Frontend JavaScript
│   │   └── styles.css      # Application styles
│   └── assets/             # Images and static assets
│       └── Images/         # Vehicle images
│
├── package.json            # Root package.json for scripts
└── README.md              # This file
```

## ✨ Features

✅ **Full-Stack Application**
- User-friendly interface for listing vehicles, viewing availability, and completing bookings
- Responsive design that works on desktop and mobile devices

✅ **RESTful Backend Services**
- Express.js REST API with 15+ endpoints
- SQL-based data models using SQLite
- Manages 123 simulated users, 80 vehicle listings, 50 bookings, and rental history

✅ **Authentication & Verification**
- JWT-based authentication system
- User verification workflows to improve trust and reduce fraud risk
- Secure password hashing with bcrypt

✅ **Complete Booking System**
- Browse available vehicles with filters
- Real-time availability checking
- Complete booking workflow from selection to confirmation
- Rental history tracking with ratings and reviews

## 📊 Database Statistics

- **Users**: 123 (includes renters and owners)
- **Vehicles**: 80 (various brands and models)
- **Bookings**: 50 (pending, confirmed, completed, and cancelled)
- **Rental History**: 10 reviews with ratings
- **Verification Requests**: 30 user verification requests

## 🚀 Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Fetch API for RESTful communication
- Responsive design with CSS Grid and Flexbox

**Backend:**
- Node.js with Express.js
- SQLite database with better-sqlite3
- JWT authentication
- bcrypt for password hashing
- CORS enabled

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone the repository** (or navigate to the project folder)

2. **Install backend dependencies:**
```bash
npm run install-all
# or manually:
cd backend && npm install
```

3. **Initialize the database:**
```bash
npm run init-db
```

4. **Start the server:**
```bash
npm start
```

The server will run on http://localhost:3000

### Access the Application

**Main Application**: http://localhost:3000/

**Test Credentials:**
- Email: `admin@carost.com` | Password: `password123`
- Email: `john.doe@example.com` | Password: `password123`
- Email: `jane.smith@example.com` | Password: `password123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify account

### Users
- `GET /api/users` - Get all users (requires auth)
- `GET /api/users/me` - Get current user profile (requires auth)

### Vehicles
- `GET /api/vehicles` - Get all vehicles (public)
- `GET /api/vehicles/:id` - Get vehicle by ID (public)
- `POST /api/vehicles` - Create vehicle (owner only, requires auth)
- `GET /api/users/:userId/vehicles` - Get vehicles by owner (requires auth)

### Bookings
- `GET /api/bookings` - Get user bookings (requires auth)
- `POST /api/bookings` - Create booking (requires auth)
- `PATCH /api/bookings/:id` - Update booking status (requires auth)

### Rental History
- `GET /api/rental-history` - Get rental history (requires auth)
- `POST /api/rental-history` - Add review (requires auth)

### Verification
- `POST /api/verification` - Submit verification request (requires auth)
- `GET /api/verification` - Get verification status (requires auth)

### Statistics
- `GET /api/stats` - Get dashboard statistics (requires auth)

### Health
- `GET /api/health` - Health check endpoint

## 📋 Application Flow

1. **Registration**: Users register as either renters or owners
2. **Verification**: Users receive a verification code (displayed in registration success message)
3. **Login**: Users log in with email and password, receive JWT token
4. **Browse Vehicles**: View available vehicles with details
5. **Book Vehicle**: Select dates and complete booking
6. **Manage Bookings**: Confirm, complete, or cancel bookings
7. **Review**: Leave ratings and reviews for completed rentals

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication (24-hour expiration)
- CORS protection
- SQL injection prevention with prepared statements
- Input validation on all endpoints

## 👥 User Roles

**Renter:**
- Browse and search vehicles
- Book available vehicles
- View booking history
- Leave reviews for completed rentals

**Owner:**
- List vehicles for rent
- Manage vehicle availability
- View booking requests
- Track rental history and reviews

## 🔧 Development

For development with auto-restart on file changes:
```bash
npm run dev
```

### Available Scripts

- `npm start` - Start the backend server
- `npm run dev` - Start backend in development mode with nodemon
- `npm run init-db` - Initialize/reset the database with seed data
- `npm run install-all` - Install all dependencies

## ⚙️ Environment Variables

Edit `backend/.env` file to configure:
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## 📝 Notes

- All passwords in the seed data are: `password123`
- The database uses foreign keys for referential integrity
- Vehicle status automatically updates when booked or completed
- Verification codes are displayed in the registration success message (in production, these would be sent via email)

## 📄 License

MIT License

---

**Built as a demonstration of full-stack development with:**
- RESTful API design
- SQL database management
- JWT authentication
- Professional project structure
- Modern web development practices
