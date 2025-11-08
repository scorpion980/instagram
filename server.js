// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, "users.json");

// Middleware
app.use(express.json());               // parse application/json
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // serve index.html etc.

// Helper: read users file (returns array)
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Error reading users file:", err);
    return [];
  }
}

// Helper: write users array to file
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

// Register endpoint
app.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  console.log("REGISTER attempt:", { username, password, time: new Date().toISOString() });

  if (!username || !password) {
    return res.status(400).send("Missing username or password");
  }

  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.status(409).send("Username already exists");
  }

  users.push({ username, password, createdAt: new Date().toISOString() });
  writeUsers(users);

  console.log("Saved users.json (register).");
  res.send("Registered successfully");
});

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  console.log("LOGIN attempt:", { username, password, time: new Date().toISOString() });

  if (!username || !password) return res.status(400).send("Missing username or password");

  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    console.log("Login success for:", username);
    // Option A: respond success and let frontend redirect
    return res.send("Login successful");
    // Option B (server redirect): uncomment below to redirect from server
    // return res.redirect("/home.html");
  } else {
    console.log("Login failed for:", username);
    return res.status(401).send("Invalid username or password");
  }
});

// Optional: endpoint to list users (for dev only)
// Warning: exposing passwords is insecure; for demo use only
app.get("/_debug/users", (req, res) => {
  const users = readUsers();
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
