const MATCHES_URL = "https://api.sapphy.workers.dev";

async function fetchMatches() {
  try {
    const response = await fetch(MATCHES_URL, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("❌ Error:", err.error);
      alert("Error: " + err.error);
      return;
    }

    const matches = await response.json();
    console.log("🎯 Matches:", matches);

    const container = document.getElementById("matches");
    container.innerHTML = "";

    matches.forEach(user => {
      const card = document.createElement("div");
      card.className = "match-card";

      card.innerHTML = `
        <h3>${user.fname} ${user.lname}</h3>
        <p>${user.age} • ${user.city}, ${user.country}</p>
        <div class="card-buttons">
          <button class="nope">❌</button>
          <button class="like">❤️</button>
        </div>
      `;

      // Button logic
      card.querySelector(".like").addEventListener("click", () => {
        card.remove();
        // Optionally handle "like"
      });
      card.querySelector(".nope").addEventListener("click", () => {
        card.remove();
        // Optionally handle "nope"
      });

      container.appendChild(card);
    });

  } catch (err) {
    console.error("❌ Fetch failed:", err);
    alert("Failed to fetch matches");
  }
}

window.addEventListener("DOMContentLoaded", fetchMatches);