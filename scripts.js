// Register form submission
async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value.trim();

  if (!username || !password || !email) {
    alert("Please fill in all fields.");
    return false;
  }

  try {
    const response = await fetch("https://register.sapphy.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "register",
        username,
        password,
        email
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert("Registration successful! You can now login.");
      window.location.href = "login.html"; // Redirect to login page after registration
    } else {
      alert(result.error || "Registration failed.");
    }
  } catch (err) {
    console.error("Client error:", err);
    alert("Something went wrong. Please try again later.");
  }

  return false;
}

// Login form submission
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    alert("Please fill in both fields.");
    return false;
  }

  try {
    const response = await fetch("https://register.sapphy.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "login",
        username,
        password
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert("Login successful!");
      window.location.href = "settings.html"; // Redirect to settings page after login
    } else {
      alert(result.error || "Login failed.");
    }
  } catch (err) {
    console.error("Client error:", err);
    alert("Something went wrong. Please try again later.");
  }

  return false;
}
