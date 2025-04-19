const MATCHES_URL = "https://match.sapphy.workers.dev";

async function fetchMatches() {
  try {
    const response = await fetch(MATCHES_URL, {
      method: "GET",
      credentials: "include" // allows cookies to be sent
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("❌ Error:", err.error);
      alert("Error: " + err.error);
      return;
    }

    const matches = await response.json();
    console.log("🎯 Matches:", matches);

    // You can now display them in your UI
    // Example:
    const container = document.getElementById("matches");
    container.innerHTML = "";
    matches.forEach(user => {
      const div = document.createElement("div");
      div.textContent = `${user.fname} ${user.lname} (${user.age}, ${user.city})`;
      container.appendChild(div);
    });

  } catch (err) {
    console.error("❌ Fetch failed:", err);
    alert("Failed to fetch matches");
  }
}

window.addEventListener("DOMContentLoaded", fetchMatches);
