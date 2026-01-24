// server.js - Main Express server with RESTful API
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize database
const db = new Database(path.join(__dirname, 'carost.db'));
db.pragma('foreign_keys = ON');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public'))); // Serve static files
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets'))); // Serve assets

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ===== AUTH ROUTES =====

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    // Validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Insert user
    const stmt = db.prepare('INSERT INTO users (email, password, name, role, phone, verification_code) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(email, hashedPassword, name, role, phone || null, verificationCode);

    res.status(201).json({
      message: 'Registration successful. Please verify your account.',
      userId: result.lastInsertRowid,
      verificationCode // In production, send via email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify account
app.post('/api/auth/verify', authenticateToken, (req, res) => {
  try {
    const { verificationCode } = req.body;
    const userId = req.user.id;

    const user = db.prepare('SELECT verification_code FROM users WHERE id = ?').get(userId);

    if (!user || user.verification_code !== verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    db.prepare('UPDATE users SET verified = 1, verification_code = NULL WHERE id = ?').run(userId);

    res.json({ message: 'Account verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ===== USER ROUTES =====

// Get current user profile
app.get('/api/users/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, phone, verified, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get all users (admin only - for demo purposes)
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const users = db.prepare('SELECT id, email, name, role, verified, created_at FROM users ORDER BY created_at DESC LIMIT 100').all();
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// ===== VEHICLE ROUTES =====

// Get all vehicles with filters
app.get('/api/vehicles', (req, res) => {
  try {
    const { location, status, minPrice, maxPrice, search } = req.query;

    let query = `
      SELECT v.*, u.name as owner_name, u.phone as owner_phone
      FROM vehicles v
      JOIN users u ON v.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (location) {
      query += ' AND v.location = ?';
      params.push(location);
    }

    if (status) {
      query += ' AND v.status = ?';
      params.push(status);
    } else {
      query += " AND v.status = 'available'";
    }

    if (minPrice) {
      query += ' AND v.price_per_hour >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND v.price_per_hour <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (search) {
      query += ' AND (v.brand LIKE ? OR v.model LIKE ? OR v.description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY v.created_at DESC LIMIT 100';

    const vehicles = db.prepare(query).all(...params);
    res.json({ vehicles, total: vehicles.length });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Failed to get vehicles' });
  }
});

// Get single vehicle
app.get('/api/vehicles/:id', (req, res) => {
  try {
    const vehicle = db.prepare(`
      SELECT v.*, u.name as owner_name, u.phone as owner_phone, u.email as owner_email
      FROM vehicles v
      JOIN users u ON v.owner_id = u.id
      WHERE v.id = ?
    `).get(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ error: 'Failed to get vehicle' });
  }
});

// Create vehicle (owner only)
app.post('/api/vehicles', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can list vehicles' });
    }

    const { brand, model, year, licensePlate, pricePerHour, mileage, location, description } = req.body;

    if (!brand || !model || !pricePerHour || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO vehicles (owner_id, brand, model, year, license_plate, price_per_hour, mileage, location, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
    `);

    const result = stmt.run(
      req.user.id,
      brand,
      model,
      year || null,
      licensePlate || null,
      pricePerHour,
      mileage || null,
      location,
      description || null
    );

    res.status(201).json({
      message: 'Vehicle listed successfully',
      vehicleId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// Get vehicles by owner
app.get('/api/users/:userId/vehicles', authenticateToken, (req, res) => {
  try {
    const vehicles = db.prepare('SELECT * FROM vehicles WHERE owner_id = ? ORDER BY created_at DESC').all(req.params.userId);
    res.json({ vehicles, total: vehicles.length });
  } catch (error) {
    console.error('Get owner vehicles error:', error);
    res.status(500).json({ error: 'Failed to get vehicles' });
  }
});

// ===== BOOKING ROUTES =====

// Get all bookings for current user
app.get('/api/bookings', authenticateToken, (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT b.*, v.brand, v.model, v.license_plate, v.location,
             u.name as renter_name, u.email as renter_email
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN users u ON b.renter_id = u.id
      WHERE b.renter_id = ? OR v.owner_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.id, req.user.id);

    res.json({ bookings, total: bookings.length });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Create booking
app.post('/api/bookings', authenticateToken, (req, res) => {
  try {
    const { vehicleId, startTime, endTime } = req.body;

    if (!vehicleId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get vehicle
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND status = ?').get(vehicleId, 'available');
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not available' });
    }

    // Calculate total cost
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const totalCost = hours * vehicle.price_per_hour;

    // Create booking
    const stmt = db.prepare(`
      INSERT INTO bookings (vehicle_id, renter_id, start_time, end_time, total_cost, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `);

    const result = stmt.run(vehicleId, req.user.id, startTime, endTime, totalCost);

    // Update vehicle status
    db.prepare("UPDATE vehicles SET status = 'booked' WHERE id = ?").run(vehicleId);

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.lastInsertRowid,
      totalCost,
      hours
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking status
app.patch('/api/bookings/:id', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, bookingId);

    // Update vehicle status if cancelled or completed
    if (status === 'cancelled' || status === 'completed') {
      db.prepare("UPDATE vehicles SET status = 'available' WHERE id = ?").run(booking.vehicle_id);
    }

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// ===== RENTAL HISTORY ROUTES =====

// Get rental history
app.get('/api/rental-history', authenticateToken, (req, res) => {
  try {
    const history = db.prepare(`
      SELECT rh.*, b.vehicle_id, b.renter_id, b.start_time, b.end_time, b.total_cost,
             v.brand, v.model, u.name as renter_name
      FROM rental_history rh
      JOIN bookings b ON rh.booking_id = b.id
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN users u ON b.renter_id = u.id
      WHERE b.renter_id = ? OR v.owner_id = ?
      ORDER BY rh.completed_at DESC
    `).all(req.user.id, req.user.id);

    res.json({ history, total: history.length });
  } catch (error) {
    console.error('Get rental history error:', error);
    res.status(500).json({ error: 'Failed to get rental history' });
  }
});

// Add review to rental
app.post('/api/rental-history', authenticateToken, (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND status = ?').get(bookingId, 'completed');
    if (!booking) {
      return res.status(404).json({ error: 'Completed booking not found' });
    }

    const stmt = db.prepare('INSERT INTO rental_history (booking_id, rating, review) VALUES (?, ?, ?)');
    const result = stmt.run(bookingId, rating, review || null);

    res.status(201).json({
      message: 'Review added successfully',
      historyId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// ===== VERIFICATION ROUTES =====

// Submit verification request
app.post('/api/verification', authenticateToken, (req, res) => {
  try {
    const { documentType, documentNumber } = req.body;

    if (!documentType || !documentNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      INSERT INTO verification_requests (user_id, document_type, document_number, status)
      VALUES (?, ?, ?, 'pending')
    `);

    const result = stmt.run(req.user.id, documentType, documentNumber);

    res.status(201).json({
      message: 'Verification request submitted successfully',
      requestId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Submit verification error:', error);
    res.status(500).json({ error: 'Failed to submit verification' });
  }
});

// Get verification status
app.get('/api/verification', authenticateToken, (req, res) => {
  try {
    const verifications = db.prepare(`
      SELECT * FROM verification_requests
      WHERE user_id = ?
      ORDER BY submitted_at DESC
    `).all(req.user.id);

    res.json({ verifications, total: verifications.length });
  } catch (error) {
    console.error('Get verification error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// ===== STATISTICS ROUTES =====

// Get dashboard stats
app.get('/api/stats', authenticateToken, (req, res) => {
  try {
    const stats = {
      totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
      totalVehicles: db.prepare('SELECT COUNT(*) as count FROM vehicles').get().count,
      totalBookings: db.prepare('SELECT COUNT(*) as count FROM bookings').get().count,
      availableVehicles: db.prepare("SELECT COUNT(*) as count FROM vehicles WHERE status = 'available'").get().count,
      activeBookings: db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status IN ('pending', 'confirmed')").get().count,
      completedBookings: db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'").get().count,
      verifiedUsers: db.prepare('SELECT COUNT(*) as count FROM users WHERE verified = 1').get().count
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   Carost Rental API Server                     ║
║   Server running on http://localhost:${PORT}      ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
╚═══════════════════════════════════════════════════╝

API Endpoints:
  POST   /api/auth/register       - Register new user
  POST   /api/auth/login          - Login user
  POST   /api/auth/verify         - Verify account
  GET    /api/users               - Get all users
  GET    /api/users/me            - Get current user
  GET    /api/vehicles            - Get all vehicles
  GET    /api/vehicles/:id        - Get vehicle by ID
  POST   /api/vehicles            - Create vehicle
  GET    /api/bookings            - Get user bookings
  POST   /api/bookings            - Create booking
  PATCH  /api/bookings/:id        - Update booking
  GET    /api/rental-history      - Get rental history
  POST   /api/rental-history      - Add review
  POST   /api/verification        - Submit verification
  GET    /api/verification        - Get verification status
  GET    /api/stats               - Get statistics
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  db.close();
  process.exit(0);
});
