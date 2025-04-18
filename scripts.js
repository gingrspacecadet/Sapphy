// Register form submission
async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value.trim();

  if (!username || !password || !email) {
    alert("Please fill in all fields.");
    return false;
  }

  const payload = { action: "register", username, password, email };
  console.log("Register payload:", payload);

  try {
    const response = await fetch("https://register.sapphy.workers.dev", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("Raw response:", response);
    const text = await response.text();
    console.log("Response text:", text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      alert("Invalid JSON response from server.");
      return false;
    }

    console.log("Parsed result:", result);

    if (response.ok) {
      alert("Registration successful! You can now login.");
      window.location.href = "login.html";
    } else {
      alert(result.error || "Registration failed.");
    }
  } catch (err) {
    console.error("Network or CORS error:", err);
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

  const payload = { action: "login", username, password };
  console.log("Login payload:", payload);

  try {
    const response = await fetch("https://register.sapphy.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("Raw response:", response);
    const text = await response.text();
    console.log("Response text:", text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      alert("Invalid JSON response from server.");
      return false;
    }

    console.log("Parsed result:", result);

    if (response.ok) {
      window.location.href = result.redirectUrl || "settings.html";
    } else {
      alert(result.error || "Login failed.");
    }
  } catch (err) {
    console.error("Network or CORS error:", err);
    alert("Something went wrong. Please try again later.");
  }

  return false;
}