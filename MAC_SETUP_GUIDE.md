# ParkShare - macOS Setup Guide

Complete step-by-step guide for setting up and running ParkShare on macOS.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Running the Application](#running-the-application)
4. [Troubleshooting](#troubleshooting)
5. [Quick Reference](#quick-reference)

---

## ✅ Prerequisites

### Step 1: Install Homebrew (if not already installed)

Homebrew is a package manager for macOS that makes installing software easy.

**Check if Homebrew is installed:**
```bash
brew --version
```

**If not installed, install Homebrew:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, follow the terminal instructions to add Homebrew to your PATH.

---

### Step 2: Install Node.js and npm

Node.js includes npm (Node Package Manager) automatically.

**Check if Node.js is installed:**
```bash
node --version
npm --version
```

**If not installed, install Node.js using Homebrew:**
```bash
brew install node
```

**Verify installation:**
```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
```

---

### Step 3: Install Git (if not already installed)

**Check if Git is installed:**
```bash
git --version
```

**If not installed:**
```bash
brew install git
```

---

## 🚀 Installation Steps

### Step 1: Navigate to the Project

Open Terminal and navigate to the project directory:

```bash
cd /path/to/Carost
```

**Example:**
```bash
cd ~/Desktop/Rental/Carost
```

**Verify you're in the correct directory:**
```bash
ls
```

You should see folders like `backend/`, `frontend/`, and files like `README.md`, `package.json`.

---

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all required packages (Express, SQLite, bcrypt, JWT, etc.)

**Expected output:**
```
added 195 packages, and audited 196 packages in 7s
```

**Note:** You may see some warnings about deprecated packages - this is normal and won't affect functionality.

---

### Step 3: Initialize the Database

Still in the `backend` directory, run:

```bash
node initDatabase.js
```

**Expected output:**
```
Initializing database...
Tables created successfully
Generating seed data...
Created 123 users
Created 80 vehicles
Created 50 bookings
Created 10 rental history records
Created 30 verification requests

=== Database Initialization Complete ===
Total Users: 123
Total Vehicles: 80
Total Bookings: 50
Total Rental History: 10

Test Credentials:
Email: admin@parkshare.com | Password: password123
Email: john.doe@example.com | Password: password123
Email: jane.smith@example.com | Password: password123
```

This creates a SQLite database (`parkshare.db`) with 123 users, 80 vehicles, and sample data.

---

### Step 4: Return to Project Root

```bash
cd ..
```

Now you should be back in the main `Carost` directory.

---

## 🎯 Running the Application

### Method 1: Start the Server (Recommended)

From the project root directory:

```bash
npm start
```

**Expected output:**
```
> parkshare-fullstack@1.0.0 start
> cd backend && npm start

> parkshare-rental@1.0.0 start
> node server.js

╔═══════════════════════════════════════════════════╗
║   ParkShare Rental API Server                     ║
║   Server running on http://localhost:3000         ║
║   Environment: development                        ║
╚═══════════════════════════════════════════════════╝

API Endpoints:
  POST   /api/auth/register       - Register new user
  POST   /api/auth/login          - Login user
  ...
```

---

### Method 2: Development Mode (with auto-restart)

For development with automatic restart on file changes:

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when you make code changes.

---

### Step 5: Access the Application

Open your web browser and go to:

```
http://localhost:3000
```

You should see the ParkShare homepage with the modern design!

---

## 🔐 Using the Application

### Test User Credentials

Use these accounts to test the application:

**Admin/Owner Account:**
- Email: `admin@parkshare.com`
- Password: `password123`

**Renter Account:**
- Email: `john.doe@example.com`
- Password: `password123`

**Another Owner:**
- Email: `jane.smith@example.com`
- Password: `password123`

---

## 🛠️ Troubleshooting

### Issue 1: "command not found: npm"

**Solution:** Node.js is not installed or not in PATH.

```bash
# Install Node.js
brew install node

# Verify installation
node --version
npm --version
```

---

### Issue 2: "Error: Cannot find module..."

**Solution:** Dependencies not installed properly.

```bash
# Navigate to backend directory
cd backend

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Return to root
cd ..
```

---

### Issue 3: Port 3000 is already in use

**Solution:** Another application is using port 3000.

**Option A: Stop the other application**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

**Option B: Change the port**
```bash
# Edit backend/.env file
nano backend/.env

# Change PORT=3000 to PORT=3001
# Save and exit (Ctrl+X, then Y, then Enter)
```

Then access the app at `http://localhost:3001`

---

### Issue 4: "EACCES: permission denied"

**Solution:** Permission issues with npm.

```bash
# Fix npm permissions (recommended method)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to PATH in ~/.zshrc or ~/.bash_profile
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Reinstall
cd backend
npm install
```

---

### Issue 5: Database errors or "no such table"

**Solution:** Reinitialize the database.

```bash
# Navigate to backend
cd backend

# Remove old database
rm parkshare.db

# Reinitialize
node initDatabase.js

# Restart server
cd ..
npm start
```

---

### Issue 6: "gyp ERR!" or bcrypt compilation errors

**Solution:** Install Xcode Command Line Tools.

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Then reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 7: Cannot access http://localhost:3000

**Checklist:**

1. Is the server running? (Check terminal for server messages)
2. Is it running on port 3000? (Check the terminal output)
3. Is your firewall blocking it? (Check System Preferences > Security & Privacy > Firewall)
4. Try accessing `http://127.0.0.1:3000` instead

---

## 🔄 Stopping the Server

To stop the server, press:
```
Ctrl + C
```

in the Terminal window where the server is running.

---

## 📚 Quick Reference

### Common Commands

```bash
# Navigate to project
cd ~/Desktop/Rental/Carost

# Start server (production mode)
npm start

# Start server (development mode with auto-restart)
npm run dev

# Install all dependencies
npm run install-all

# Reinitialize database with fresh data
npm run init-db

# Check Node.js version
node --version

# Check npm version
npm --version

# View backend package.json scripts
cd backend
npm run
```

---

### Project Structure

```
Carost/
├── backend/                 # Server-side code
│   ├── server.js           # Main API server
│   ├── initDatabase.js     # Database setup script
│   ├── parkshare.db        # SQLite database (created after init)
│   ├── package.json        # Backend dependencies
│   └── .env                # Environment variables
│
├── frontend/               # Client-side code
│   ├── public/             # HTML, CSS, JS files
│   └── assets/             # Images and static files
│
├── package.json            # Root scripts
└── README.md              # Main documentation
```

---

### Default Ports

- **Backend API:** http://localhost:3000/api
- **Frontend:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health

---

### Environment Variables

Edit `backend/.env` to customize:

```bash
PORT=3000                              # Server port
JWT_SECRET=your-secret-key             # Secret for JWT tokens
NODE_ENV=development                   # Environment mode
```

---

## 🎨 Development Workflow

### 1. Making Changes

**Backend Changes:**
```bash
# Edit files in backend/ directory
# If using npm run dev, server auto-restarts
# If using npm start, stop (Ctrl+C) and restart
```

**Frontend Changes:**
```bash
# Edit files in frontend/public/ directory
# Just refresh browser to see changes
# No restart needed
```

---

### 2. Adding New Features

```bash
# 1. Make your changes
# 2. Test in browser
# 3. Commit changes (if using git)
git add .
git commit -m "Add new feature"
```

---

### 3. Resetting to Fresh State

```bash
# Navigate to backend
cd backend

# Remove database
rm parkshare.db

# Reinitialize with fresh data
node initDatabase.js

# Restart server
cd ..
npm start
```

---

## 📱 Accessing from Other Devices

To access ParkShare from other devices on your network (iPhone, iPad, other computers):

### Step 1: Find Your Mac's IP Address

```bash
ipconfig getifaddr en0
```

or

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Example output:** `192.168.1.100`

### Step 2: Update Backend CORS Settings

Edit `backend/server.js` if needed (CORS is already enabled).

### Step 3: Access from Other Device

On your other device, open browser and go to:
```
http://192.168.1.100:3000
```

(Replace with your actual IP address)

---

## 🔒 Security Notes

**⚠️ IMPORTANT - For Development Only:**

1. **JWT Secret:** Change `JWT_SECRET` in `backend/.env` before deploying to production
2. **Passwords:** All test accounts use `password123` - change this in production
3. **CORS:** Currently allows all origins - restrict in production
4. **Database:** SQLite is for development - use PostgreSQL/MySQL for production

---

## 📖 Additional Resources

- **Project Overview:** See `PROJECT_OVERVIEW.md` for detailed architecture
- **Main README:** See `README.md` for general information
- **Backend README:** See `backend/README.md` for API details
- **Frontend README:** See `frontend/README.md` for frontend info

---

## 💡 Tips & Best Practices

### 1. Use Terminal Properly

- Keep the terminal window open while the server is running
- Don't close the terminal - this stops the server
- Use `Ctrl+C` to stop the server gracefully

### 2. Check for Updates

```bash
# Check for outdated packages
cd backend
npm outdated

# Update packages (optional)
npm update
```

### 3. Clear Browser Cache

If you don't see your changes:
- Press `Cmd + Shift + R` (hard refresh)
- Or clear browser cache in Settings

### 4. View Logs

Server logs appear in the terminal where you ran `npm start`. Watch for:
- API requests
- Errors
- Database operations

### 5. Development Tools

**Recommended:**
- **VS Code:** Code editor with Node.js support
- **Postman:** Test API endpoints
- **DB Browser for SQLite:** View database contents

**Install DB Browser:**
```bash
brew install --cask db-browser-for-sqlite
```

Then open `backend/parkshare.db` to view data.

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the error message** in terminal
2. **Search the error** on Google or Stack Overflow
3. **Check troubleshooting section** above
4. **Verify all steps** were completed correctly
5. **Try the fresh start** procedure:

```bash
# Fresh start procedure
cd ~/Desktop/Rental/Carost/backend
rm -rf node_modules package-lock.json parkshare.db
npm install
node initDatabase.js
cd ..
npm start
```

---

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] Node.js installed (`node --version` works)
- [ ] npm installed (`npm --version` works)
- [ ] Backend dependencies installed (node_modules exists in backend/)
- [ ] Database initialized (parkshare.db exists in backend/)
- [ ] Server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can see homepage with modern design
- [ ] Can log in with test credentials
- [ ] Can view vehicles page
- [ ] Can create a booking

---

## 🎉 Success!

If you can:
1. Access http://localhost:3000
2. See the modern ParkShare homepage
3. Log in with test credentials
4. Browse and book vehicles

**Congratulations! Your ParkShare application is running successfully on macOS!** 🚀

---

## 📝 Next Steps

Now that your app is running:

1. **Explore the application** - Try all features
2. **Test different user roles** - Login as renter vs owner
3. **Make your first booking** - Test the booking flow
4. **Check the dashboard** - View statistics and bookings
5. **Read the code** - Understand how it works (see PROJECT_OVERVIEW.md)
6. **Customize it** - Make it your own!

---

**Need more help?** Check the other documentation files or the troubleshooting section above.

**Happy coding! 🚗💨**
