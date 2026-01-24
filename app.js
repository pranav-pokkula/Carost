// app.js

// Simulated user data
let users = [];
let currentUser = null;

// Simulated vehicle data
let vehicles = [
  {
    id: 1,
    brand: "Toyota",
    model: "Camry",
    pricePerHour: 15,
    mileage: 30000,
    location: "Downtown",
    description: "A comfortable midsize car.",
  },
  {
    id: 2,
    brand: "Honda",
    model: "Civic",
    pricePerHour: 12,
    mileage: 25000,
    location: "Airport",
    description: "A reliable compact car.",
  },
  // Add more vehicles as needed
];

// Utility functions
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

function loadUsers() {
  const storedUsers = localStorage.getItem("users");
  if (storedUsers) {
    users = JSON.parse(storedUsers);
  }
}

function saveCurrentUser() {
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

function loadCurrentUser() {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
  }
}

// Registration
function register(event) {
  event.preventDefault();
  const role = document.getElementById("role").value;
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (users.find((user) => user.email === email)) {
    alert("Email already registered.");
    return;
  }

  const newUser = {
    role,
    name,
    email,
    password,
  };
  users.push(newUser);
  saveUsers();
  alert("Registration successful. You can now log in.");
  window.location.href = "login.html";
}

// Login
function login(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    saveCurrentUser();
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid email or password.");
  }
}

// Logout
function logout() {
  currentUser = null;
  saveCurrentUser();
  window.location.href = "index.html";
}

// Display current user's name
function displayUserName() {
  loadCurrentUser();
  if (currentUser) {
    document.getElementById("user-name").textContent = currentUser.name;
  }
}

// Display vehicles
function displayVehicles() {
  const vehicleList = document.getElementById("vehicle-list");
  vehicles.forEach((vehicle) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${vehicle.brand} ${vehicle.model}</h3>
      <p>Price per Hour: $${vehicle.pricePerHour}</p>
      <p>Location: ${vehicle.location}</p>
      <button onclick="viewVehicle(${vehicle.id})">View Details</button>
    `;
    vehicleList.appendChild(card);
  });
}

// View vehicle details
function viewVehicle(id) {
  const vehicle = vehicles.find((v) => v.id === id);
  if (vehicle) {
    localStorage.setItem("selectedVehicle", JSON.stringify(vehicle));
    window.location.href = "vehicle-details.html";
  }
}

// Display vehicle details
function displayVehicleDetails() {
  const vehicle = JSON.parse(localStorage.getItem("selectedVehicle"));
  if (vehicle) {
    document.getElementById("vehicle-title").textContent = `${vehicle.brand} ${vehicle.model}`;
    document.getElementById("vehicle-description").textContent = vehicle.description;
    document.getElementById("vehicle-price").textContent = `Price per Hour: $${vehicle.pricePerHour}`;
    document.getElementById("vehicle-location").textContent = `Location: ${vehicle.location}`;
  } else {
    window.location.href = "vehicles.html";
  }
}

// Booking
function bookVehicle(event) {
  event.preventDefault();
  alert("Vehicle booked successfully!");
  window.location.href = "dashboard.html";
}

// Load functions on page load
function init() {
  loadUsers();
  loadCurrentUser();
}
