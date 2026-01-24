// app.js - Frontend JavaScript with REST API integration

const API_BASE_URL = 'http://localhost:3000/api';
let currentUser = null;
let authToken = null;

// Utility functions
function setAuthToken(token) {
  authToken = token;
  localStorage.setItem('authToken', token);
}

function getAuthToken() {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  return authToken;
}

function clearAuth() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Load current user from token
async function loadCurrentUser() {
  const token = getAuthToken();
  if (!token) {
    currentUser = null;
    return;
  }

  try {
    currentUser = await apiRequest('/users/me');
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  } catch (error) {
    console.error('Failed to load user:', error);
    clearAuth();
  }
}

// Registration
async function register(event) {
  event.preventDefault();
  const role = document.getElementById("role").value;
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone") ? document.getElementById("phone").value.trim() : null;

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role, phone })
    });

    alert(`Registration successful! Your verification code is: ${data.verificationCode}\n\nPlease log in to continue.`);
    window.location.href = "login.html";
  } catch (error) {
    alert(error.message || 'Registration failed. Please try again.');
  }
}

// Login
async function login(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setAuthToken(data.token);
    currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    if (!currentUser.verified) {
      alert('Please verify your account. Check your verification code from registration.');
    }

    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message || 'Login failed. Please check your credentials.');
  }
}

// Logout
function logout() {
  clearAuth();
  window.location.href = "index.html";
}

// Display current user's name
function displayUserName() {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) {
      userNameElement.textContent = currentUser.name;
    }

    // Show verification status
    const verificationElement = document.getElementById("verification-status");
    if (verificationElement) {
      if (currentUser.verified) {
        verificationElement.innerHTML = '<span style="color: green;">✓ Verified</span>';
      } else {
        verificationElement.innerHTML = '<span style="color: orange;">⚠ Not Verified</span> <a href="#" onclick="showVerificationForm()">Verify Now</a>';
      }
    }
  }
}

// Display vehicles
async function displayVehicles() {
  const vehicleList = document.getElementById("vehicle-list");
  if (!vehicleList) return;

  try {
    const data = await apiRequest('/vehicles');
    const vehicles = data.vehicles;

    vehicleList.innerHTML = '';

    if (vehicles.length === 0) {
      vehicleList.innerHTML = '<p>No vehicles available at the moment.</p>';
      return;
    }

    vehicles.forEach((vehicle) => {
      const card = document.createElement("div");
      card.className = "card";

      // Determine button state
      const isAvailable = vehicle.status === 'available';
      const bookButton = isAvailable
        ? `<button onclick="bookVehicleQuick(${vehicle.id})" class="btn">Book Now</button>`
        : `<button disabled class="btn">Not Available</button>`;

      // Check if this is the Toyota Camry and add image
      const isCamry = vehicle.brand === 'Toyota' && vehicle.model === 'Camry';
      const camryImage = isCamry
        ? `<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
             <img src="/assets/Images/Camry.png" alt="Toyota Camry" style="width: 150px; height: auto; border-radius: 8px;">
             <h3 style="margin: 0;">${vehicle.brand} ${vehicle.model}</h3>
           </div>`
        : `<h3>${vehicle.brand} ${vehicle.model}</h3>`;

      card.innerHTML = `
        ${camryImage}
        <p><strong>Year:</strong> ${vehicle.year || 'N/A'}</p>
        <p><strong>Price per Hour:</strong> $${vehicle.price_per_hour}</p>
        <p><strong>Location:</strong> ${vehicle.location}</p>
        <p><strong>Status:</strong> <span class="status-${vehicle.status}">${vehicle.status}</span></p>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button onclick="viewVehicle(${vehicle.id})">View Details</button>
          ${bookButton}
        </div>
      `;
      vehicleList.appendChild(card);
    });
  } catch (error) {
    vehicleList.innerHTML = '<p>Failed to load vehicles. Please try again later.</p>';
    console.error('Failed to load vehicles:', error);
  }
}

// View vehicle details
async function viewVehicle(id) {
  try {
    const vehicle = await apiRequest(`/vehicles/${id}`);
    localStorage.setItem("selectedVehicle", JSON.stringify(vehicle));
    window.location.href = "vehicles-details.html";
  } catch (error) {
    alert('Failed to load vehicle details.');
  }
}

// Quick book vehicle from listing page
async function bookVehicleQuick(id) {
  // Check if user is logged in
  const token = getAuthToken();
  if (!token) {
    alert('Please log in to book a vehicle.');
    window.location.href = "login.html";
    return;
  }

  try {
    const vehicle = await apiRequest(`/vehicles/${id}`);
    localStorage.setItem("selectedVehicle", JSON.stringify(vehicle));
    window.location.href = "booking.html";
  } catch (error) {
    alert('Failed to load vehicle. Please try again.');
  }
}

// Display vehicle details
function displayVehicleDetails() {
  const vehicle = JSON.parse(localStorage.getItem("selectedVehicle"));
  if (vehicle) {
    document.getElementById("vehicle-title").textContent = `${vehicle.brand} ${vehicle.model} (${vehicle.year || 'N/A'})`;
    document.getElementById("vehicle-description").textContent = vehicle.description || 'No description available';
    document.getElementById("vehicle-price").textContent = `Price per Hour: $${vehicle.price_per_hour}`;
    document.getElementById("vehicle-location").textContent = `Location: ${vehicle.location}`;
    document.getElementById("vehicle-mileage").textContent = `Mileage: ${vehicle.mileage ? vehicle.mileage.toLocaleString() + ' miles' : 'N/A'}`;
    document.getElementById("vehicle-status").textContent = `Status: ${vehicle.status}`;
    document.getElementById("vehicle-owner").textContent = `Owner: ${vehicle.owner_name}`;

    // Disable booking if not available
    const bookButton = document.querySelector('button[onclick*="booking"]');
    if (bookButton && vehicle.status !== 'available') {
      bookButton.disabled = true;
      bookButton.textContent = 'Not Available';
    }
  } else {
    window.location.href = "vehicles.html";
  }
}

// Booking
async function bookVehicle(event) {
  event.preventDefault();

  const vehicle = JSON.parse(localStorage.getItem("selectedVehicle"));
  if (!vehicle) {
    alert('No vehicle selected');
    return;
  }

  const startTime = document.getElementById("start-time").value;
  const endTime = document.getElementById("end-time").value;

  if (!startTime || !endTime) {
    alert('Please select start and end time');
    return;
  }

  // Validate dates
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (end <= start) {
    alert('End time must be after start time');
    return;
  }

  try {
    const data = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        vehicleId: vehicle.id,
        startTime: start.toISOString(),
        endTime: end.toISOString()
      })
    });

    alert(`Booking successful!\n\nTotal Cost: $${data.totalCost}\nDuration: ${data.hours} hours\nBooking ID: ${data.bookingId}`);
    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message || 'Booking failed. Please try again.');
  }
}

// Display user bookings
async function displayBookings() {
  const bookingsList = document.getElementById("bookings-list");
  if (!bookingsList) return;

  try {
    const data = await apiRequest('/bookings');
    const bookings = data.bookings;

    bookingsList.innerHTML = '';

    if (bookings.length === 0) {
      bookingsList.innerHTML = '<p>No bookings found.</p>';
      return;
    }

    bookings.forEach((booking) => {
      const card = document.createElement("div");
      card.className = "card";
      const startDate = new Date(booking.start_time).toLocaleString();
      const endDate = new Date(booking.end_time).toLocaleString();

      card.innerHTML = `
        <h3>${booking.brand} ${booking.model}</h3>
        <p><strong>Location:</strong> ${booking.location}</p>
        <p><strong>Start:</strong> ${startDate}</p>
        <p><strong>End:</strong> ${endDate}</p>
        <p><strong>Total Cost:</strong> $${booking.total_cost}</p>
        <p><strong>Status:</strong> <span class="status-${booking.status}">${booking.status}</span></p>
        <p><strong>Renter:</strong> ${booking.renter_name}</p>
        ${booking.status === 'pending' ? `<button onclick="updateBookingStatus(${booking.id}, 'confirmed')">Confirm</button>` : ''}
        ${booking.status === 'confirmed' ? `<button onclick="updateBookingStatus(${booking.id}, 'completed')">Complete</button>` : ''}
        ${booking.status === 'pending' || booking.status === 'confirmed' ? `<button onclick="updateBookingStatus(${booking.id}, 'cancelled')" class="btn-cancel">Cancel</button>` : ''}
      `;
      bookingsList.appendChild(card);
    });
  } catch (error) {
    bookingsList.innerHTML = '<p>Failed to load bookings. Please try again later.</p>';
    console.error('Failed to load bookings:', error);
  }
}

// Update booking status
async function updateBookingStatus(bookingId, status) {
  try {
    await apiRequest(`/bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });

    alert('Booking updated successfully!');
    displayBookings(); // Refresh list
  } catch (error) {
    alert(error.message || 'Failed to update booking.');
  }
}

// Display rental history
async function displayRentalHistory() {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;

  try {
    const data = await apiRequest('/rental-history');
    const history = data.history;

    historyList.innerHTML = '';

    if (history.length === 0) {
      historyList.innerHTML = '<p>No rental history found.</p>';
      return;
    }

    history.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      const completedDate = new Date(item.completed_at).toLocaleString();

      card.innerHTML = `
        <h3>${item.brand} ${item.model}</h3>
        <p><strong>Completed:</strong> ${completedDate}</p>
        <p><strong>Total Cost:</strong> $${item.total_cost}</p>
        <p><strong>Rating:</strong> ${'⭐'.repeat(item.rating || 0)}</p>
        <p><strong>Review:</strong> ${item.review || 'No review'}</p>
      `;
      historyList.appendChild(card);
    });
  } catch (error) {
    historyList.innerHTML = '<p>Failed to load rental history. Please try again later.</p>';
    console.error('Failed to load rental history:', error);
  }
}

// Display statistics
async function displayStats() {
  try {
    const stats = await apiRequest('/stats');

    const statsContainer = document.getElementById("stats-container");
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-card">
          <h3>${stats.totalUsers}</h3>
          <p>Total Users</p>
        </div>
        <div class="stat-card">
          <h3>${stats.verifiedUsers}</h3>
          <p>Verified Users</p>
        </div>
        <div class="stat-card">
          <h3>${stats.totalVehicles}</h3>
          <p>Total Vehicles</p>
        </div>
        <div class="stat-card">
          <h3>${stats.availableVehicles}</h3>
          <p>Available Vehicles</p>
        </div>
        <div class="stat-card">
          <h3>${stats.totalBookings}</h3>
          <p>Total Bookings</p>
        </div>
        <div class="stat-card">
          <h3>${stats.activeBookings}</h3>
          <p>Active Bookings</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// Submit verification
async function submitVerification(event) {
  event.preventDefault();
  const documentType = document.getElementById("doc-type").value;
  const documentNumber = document.getElementById("doc-number").value.trim();

  try {
    await apiRequest('/verification', {
      method: 'POST',
      body: JSON.stringify({ documentType, documentNumber })
    });

    alert('Verification request submitted successfully! We will review it shortly.');
    window.location.reload();
  } catch (error) {
    alert(error.message || 'Failed to submit verification.');
  }
}

// Update navigation based on user authentication
function updateNavigation() {
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const dashboardLink = document.getElementById("dashboard-link");
  const logoutLink = document.getElementById("logout-link");

  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }

  if (currentUser) {
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (dashboardLink) dashboardLink.style.display = "inline-block";
    if (logoutLink) logoutLink.style.display = "inline-block";
  } else {
    if (loginLink) loginLink.style.display = "inline-block";
    if (registerLink) registerLink.style.display = "inline-block";
    if (dashboardLink) dashboardLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "none";
  }
}

// Load functions on page load
async function init() {
  await loadCurrentUser();
  updateNavigation();
}
