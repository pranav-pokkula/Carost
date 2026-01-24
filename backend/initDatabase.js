// initDatabase.js - Initialize SQLite database with schema and seed data
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'carost.db');
const db = new Database(dbPath);

console.log('Initializing database...');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('renter', 'owner')) NOT NULL,
    phone TEXT,
    verified INTEGER DEFAULT 0,
    verification_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Vehicles table
  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    license_plate TEXT UNIQUE,
    price_per_hour REAL NOT NULL,
    mileage INTEGER,
    location TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('available', 'booked', 'maintenance')) DEFAULT 'available',
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  -- Bookings table
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    renter_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    total_cost REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (renter_id) REFERENCES users(id)
  );

  -- Rental history table
  CREATE TABLE IF NOT EXISTS rental_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    review TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
  );

  -- Verification requests table
  CREATE TABLE IF NOT EXISTS verification_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    document_type TEXT NOT NULL,
    document_number TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

console.log('Tables created successfully');

// Seed data
console.log('Generating seed data...');

// Generate 100+ users
const insertUser = db.prepare('INSERT INTO users (email, password, name, role, phone, verified) VALUES (?, ?, ?, ?, ?, ?)');
const insertMany = db.transaction((users) => {
  for (const user of users) insertUser.run(user);
});

const users = [];
const hashedPassword = bcrypt.hashSync('password123', 10);

// Create admin/test users
users.push(['admin@carost.com', hashedPassword, 'Admin User', 'owner', '555-0001', 1]);
users.push(['john.doe@example.com', hashedPassword, 'John Doe', 'renter', '555-0002', 1]);
users.push(['jane.smith@example.com', hashedPassword, 'Jane Smith', 'owner', '555-0003', 1]);

// Generate 100+ random users
const firstNames = ['Michael', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'Robert', 'Sophia', 'William', 'Ava',
                     'Richard', 'Isabella', 'Joseph', 'Mia', 'Thomas', 'Charlotte', 'Christopher', 'Amelia', 'Daniel', 'Harper'];
const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez',
                   'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];

for (let i = 0; i < 120; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const role = Math.random() > 0.5 ? 'renter' : 'owner';
  const verified = Math.random() > 0.3 ? 1 : 0;

  users.push([
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
    hashedPassword,
    `${firstName} ${lastName}`,
    role,
    `555-${String(i + 100).padStart(4, '0')}`,
    verified
  ]);
}

insertMany(users);
console.log(`Created ${users.length} users`);

// Generate vehicles
const insertVehicle = db.prepare('INSERT INTO vehicles (owner_id, brand, model, year, license_plate, price_per_hour, mileage, location, description, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const insertManyVehicles = db.transaction((vehicles) => {
  for (const vehicle of vehicles) insertVehicle.run(vehicle);
});

const vehicles = [];
const brands = [
  { brand: 'Toyota', models: ['Camry', 'Corolla', 'RAV4', 'Highlander'] },
  { brand: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'Pilot'] },
  { brand: 'Ford', models: ['F-150', 'Escape', 'Explorer', 'Mustang'] },
  { brand: 'Chevrolet', models: ['Silverado', 'Equinox', 'Malibu', 'Traverse'] },
  { brand: 'Tesla', models: ['Model 3', 'Model Y', 'Model S', 'Model X'] },
  { brand: 'BMW', models: ['3 Series', '5 Series', 'X3', 'X5'] },
  { brand: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'GLC', 'GLE'] }
];

const locations = ['Downtown', 'Airport', 'North Station', 'South District', 'West End', 'East Bay', 'Central Plaza', 'Harbor View'];
const statuses = ['available', 'available', 'available', 'booked', 'maintenance'];

for (let i = 0; i < 80; i++) {
  const brandObj = brands[Math.floor(Math.random() * brands.length)];
  const model = brandObj.models[Math.floor(Math.random() * brandObj.models.length)];
  const ownerId = 1 + Math.floor(Math.random() * 50); // First 50 users can be owners
  const year = 2018 + Math.floor(Math.random() * 7);
  const pricePerHour = 10 + Math.floor(Math.random() * 40);
  const mileage = 10000 + Math.floor(Math.random() * 80000);
  const location = locations[Math.floor(Math.random() * locations.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  vehicles.push([
    ownerId,
    brandObj.brand,
    model,
    year,
    `ABC${String(i + 1000).substring(1)}`,
    pricePerHour,
    mileage,
    location,
    `Well-maintained ${year} ${brandObj.brand} ${model}. Great for city driving.`,
    status,
    '/assets/Images/Camry.png'
  ]);
}

insertManyVehicles(vehicles);
console.log(`Created ${vehicles.length} vehicles`);

// Generate bookings
const insertBooking = db.prepare('INSERT INTO bookings (vehicle_id, renter_id, start_time, end_time, total_cost, status) VALUES (?, ?, ?, ?, ?, ?)');
const insertManyBookings = db.transaction((bookings) => {
  for (const booking of bookings) insertBooking.run(booking);
});

const bookings = [];
const bookingStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

for (let i = 0; i < 50; i++) {
  const vehicleId = 1 + Math.floor(Math.random() * 80);
  const renterId = 1 + Math.floor(Math.random() * 123);
  const hoursAgo = Math.floor(Math.random() * 720); // Up to 30 days ago
  const duration = 2 + Math.floor(Math.random() * 10); // 2-12 hours
  const pricePerHour = 10 + Math.floor(Math.random() * 40);
  const totalCost = duration * pricePerHour;
  const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];

  const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
  const endTime = new Date(Date.now() - (hoursAgo - duration) * 60 * 60 * 1000).toISOString();

  bookings.push([
    vehicleId,
    renterId,
    startTime,
    endTime,
    totalCost,
    status
  ]);
}

insertManyBookings(bookings);
console.log(`Created ${bookings.length} bookings`);

// Generate rental history for completed bookings
const completedBookings = db.prepare("SELECT id FROM bookings WHERE status = 'completed'").all();
const insertHistory = db.prepare('INSERT INTO rental_history (booking_id, rating, review) VALUES (?, ?, ?)');
const insertManyHistory = db.transaction((histories) => {
  for (const history of histories) insertHistory.run(history);
});

const histories = [];
const reviews = [
  'Great experience! Vehicle was clean and well-maintained.',
  'Good value for money. Would rent again.',
  'Excellent service. Highly recommended!',
  'Vehicle was as described. Smooth transaction.',
  'Very satisfied with the rental experience.'
];

for (const booking of completedBookings) {
  const rating = 3 + Math.floor(Math.random() * 3); // 3-5 stars
  const review = reviews[Math.floor(Math.random() * reviews.length)];
  histories.push([booking.id, rating, review]);
}

insertManyHistory(histories);
console.log(`Created ${histories.length} rental history records`);

// Generate verification requests
const insertVerification = db.prepare('INSERT INTO verification_requests (user_id, document_type, document_number, status) VALUES (?, ?, ?, ?)');
const insertManyVerifications = db.transaction((verifications) => {
  for (const verification of verifications) insertVerification.run(verification);
});

const verifications = [];
const verificationStatuses = ['pending', 'approved', 'rejected'];
const documentTypes = ['drivers_license', 'passport', 'national_id'];

for (let i = 0; i < 30; i++) {
  const userId = 1 + Math.floor(Math.random() * 123);
  const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
  const docNumber = `DOC${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
  const status = verificationStatuses[Math.floor(Math.random() * verificationStatuses.length)];

  verifications.push([userId, docType, docNumber, status]);
}

insertManyVerifications(verifications);
console.log(`Created ${verifications.length} verification requests`);

// Print summary
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
const vehicleCount = db.prepare('SELECT COUNT(*) as count FROM vehicles').get();
const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
const historyCount = db.prepare('SELECT COUNT(*) as count FROM rental_history').get();

console.log('\n=== Database Initialization Complete ===');
console.log(`Total Users: ${userCount.count}`);
console.log(`Total Vehicles: ${vehicleCount.count}`);
console.log(`Total Bookings: ${bookingCount.count}`);
console.log(`Total Rental History: ${historyCount.count}`);
console.log('\nTest Credentials:');
console.log('Email: admin@carost.com | Password: password123');
console.log('Email: john.doe@example.com | Password: password123');
console.log('Email: jane.smith@example.com | Password: password123');

db.close();
