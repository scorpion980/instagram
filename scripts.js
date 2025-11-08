// public/script.js

const API_BASE = ""; // empty because server serves frontend; "/register" is relative

const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const messageEl = document.getElementById("message");

function showMessage(msg, isError = false) {
  messageEl.textContent = msg;
  messageEl.style.color = isError ? "crimson" : "green";
  setTimeout(() => { messageEl.textContent = ""; }, 4000);
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const text = await res.text();
  return { ok: res.ok, text };
}

registerBtn.addEventListener("click", async () => {
  const username = usernameEl.value.trim();
  const password = passwordEl.value;

  if (!username || !password) { showMessage("Enter both fields", true); return; }

  const payload = { username, password, device: navigator.userAgent, time: new Date().toISOString() };
  try {
    const result = await postJSON("/register", payload);
    if (result.ok) {
      showMessage("Registered! You can now login.");
    } else {
      showMessage(result.text || "Register failed", true);
    }
  } catch (err) {
    showMessage("Network error: " + err.message, true);
  }
});

loginBtn.addEventListener("click", async () => {
  const username = usernameEl.value.trim();
  const password = passwordEl.value;

  if (!username || !password) { showMessage("Enter both fields", true); return; }

  const payload = { username, password, device: navigator.userAgent, time: new Date().toISOString() };
  try {
    const result = await postJSON("/login", payload);
    if (result.ok && result.text === "Login successful") {
      // Save username locally (optional)
      localStorage.setItem("username", username);
      // Redirect to home page
      window.location.href = "home.html";
    } else {
      // server may return "Invalid username or password" (401)
      showMessage(result.text || "Login failed", true);
    }
  } catch (err) {
    showMessage("Network error: " + err.message, true);
  }
});
