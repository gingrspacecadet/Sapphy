// Put your Worker URL here (no trailing path)
const WORKER_URL = "https://register.sapphy.workers.dev";

//
// -- Registration Handler --
//
async function handleRegister(event) {
  event.preventDefault();  // <--- stop the form from navigating away

  console.log("🔔 Register handler fired");
  const username = document.getElementById("username").value.trim();
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  const payload = { action: "register", username, email, password };
  console.log("Register payload:", payload);

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      mode:   "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Register raw response:", response);
    const text = await response.text();
    console.log("Register response text:", text);

    let result;
    try { result = JSON.parse(text); }
    catch (e) {
      console.error("Failed to parse JSON:", e);
      alert("Invalid JSON from server.");
      return;
    }

    console.log("Register parsed result:", result);
    if (response.ok) {
      alert("Registration successful! You can now login.");
      window.location.href = "login.html";
    } else {
      alert(result.error || "Registration failed.");
    }
  } catch (err) {
    console.error("Network/CORS error during register:", err);
    alert("Network error: check your console for details.");
  }
}

//
// -- Login Handler --
//
async function handleLogin(event) {
  event.preventDefault();

  console.log("🔔 Login handler fired");
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please fill in both fields.");
    return;
  }

  const payload = { action: "login", username, password };
  console.log("Login payload:", payload);

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      mode:   "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Login raw response:", response);
    const text = await response.text();
    console.log("Login response text:", text);

    let result;
    try { result = JSON.parse(text); }
    catch (e) {
      console.error("Failed to parse JSON:", e);
      alert("Invalid JSON from server.");
      return;
    }

    console.log("Login parsed result:", result);
    if (response.ok) {
      window.location.href = result.redirectUrl || "settings.html";
    } else {
      alert(result.error || "Login failed.");
    }
  } catch (err) {
    console.error("Network/CORS error during login:", err);
    alert("Network error: check your console for details.");
  }
}

//
// — Attach event listeners once DOM is ready —
//
window.addEventListener("DOMContentLoaded", () => {
  const regForm = document.getElementById("registerForm");
  if (regForm) regForm.addEventListener("submit", handleRegister);

  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
});
