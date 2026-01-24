# Carost Frontend

User interface for the Carost car rental application.

## Structure

```
frontend/
├── public/              # Static files
│   ├── *.html          # HTML pages
│   ├── app.js          # JavaScript application logic
│   └── styles.css      # Styling
└── assets/             # Static assets
    └── Images/         # Vehicle images
```

## Pages

- `index.html` - Home/landing page
- `login.html` - User login
- `register.html` - User registration
- `dashboard.html` - User dashboard with stats and bookings
- `vehicles.html` - Browse vehicles
- `vehicles-details.html` - Vehicle details page
- `booking.html` - Booking form

## Features

- Responsive design
- Real-time API integration
- JWT token authentication
- Dynamic content rendering
- Form validation

## API Integration

The frontend communicates with the backend API at `http://localhost:3000/api`

All authenticated requests include JWT token in the Authorization header.

## Development

The frontend is served by the Express backend server. No separate build process is required.

Access at: http://localhost:3000
