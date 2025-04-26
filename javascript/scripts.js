const REGISTER_URL = "https://sapphy.pages.dev/api/register";
const LOGIN_URL = "https://sapphy.pages.dev/api/login";

// Fetch country names and cities data
let countryNames = {};
let cities = [];

async function loadCountryData() {
  const countryResponse = await fetch("/data/countryNames.json");
  countryNames = await countryResponse.json();
  const citiesResponse = await fetch("/data/cities.json");
  cities = await citiesResponse.json();
}

async function handleRegister(event) {
  event.preventDefault();  // Prevent form from refreshing the page
  console.log("🔔 Register handler fired");

  // Collect field values
  const fname    = document.getElementById("fname").value.trim();
  const lname    = document.getElementById("lname").value.trim();
  const gender   = document.getElementById("gender").value;
  const seeking  = document.getElementById("seeking").value;
  const age      = document.getElementById("age").value;
  const country  = document.getElementById("country").value;
  const city     = document.getElementById("city").value;
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Validate required fields
  if (!fname || !lname || !gender || !seeking || !age || !country || !city || !email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  // Lookup full country name and city coordinates
  const fullCountryName = countryNames[country];
  const cityData = cities.filter(c => c.country === country);  // Make sure we're matching by country code
  console.log("Filtered cities:", cityData); // Check if cities are being correctly filtered
  
  const cityMatch = cityData.find(c => c.name === city); // Match the selected city
  const cityLat = cityMatch ? cityMatch.lat : null;
  const cityLng = cityMatch ? cityMatch.lng : null;

  console.log(`Selected country: ${fullCountryName}`);
  console.log(`Selected city: ${city}`);
  console.log(`City match found: ${cityMatch ? "Yes" : "No"}`);

  // If city or country data is missing
  if (!fullCountryName || !cityLat || !cityLng) {
    alert("Invalid country or city selection.");
    return;
  }

  const payload = {
    action: "register",
    fname,
    lname,
    gender,
    seeking,
    age,
    country: fullCountryName,  // Save full country name
    city,
    email,
    password,
    cityLat,
    cityLng
  };

  console.log("📦 Register payload:", payload);

  try {
    const response = await fetch(REGISTER_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("🌐 Register raw response:", response);
    const text = await response.text();
    console.log("📨 Register response text:", text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("❌ Failed to parse JSON:", e);
      alert("Invalid response from server.");
      return;
    }

    if (response.ok) {
      window.location.href = "login.html";
    } else {
      alert(result.error || "❌ Registration failed.");
    }
  } catch (err) {
    console.error("❌ Network error during register:", err);
    alert("Network error: check your console for details.");
  }
}


loadCountryData();

//
// -- Login Handler (email-based) --
//
async function handleLogin(event) {
  event.preventDefault();
  console.log("🔔 Login handler fired");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill in both fields.");
    return;
  }

  const payload = { action: "login", email, password };
  console.log("📦 Login payload:", payload);

  try {
    const response = await fetch(LOGIN_URL, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("❌ Failed to parse JSON:", e);
      alert("Invalid response from server.");
      return;
    }

    if (response.ok) {
      window.location.href = "app.html";
    } else {
      alert(result.error || "Login failed.");
    }
  } catch (err) {
    console.error("❌ Network error during login:", err);
    alert("Network error: check your console for details.");
  }
}

//
// — Attach event listeners once DOM is ready —
//
window.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  const regForm = document.getElementById("registerForm");
  if (regForm) {
    console.log("✅ Found registerForm");
    regForm.addEventListener("submit", handleRegister);
  } else {
    console.warn("⚠️ registerForm not found");
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});