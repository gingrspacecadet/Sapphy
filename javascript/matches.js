const MATCHES_URL = "https://sapphy.pages.dev/api/mutual_matches";

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("matchesContainer");

  try {
    const response = await fetch(MATCHES_URL, {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      const error = await response.json();
      container.innerHTML = `<p>Error: ${error.error}</p>`;
      return;
    }

    const matches = await response.json();
    if (matches.length === 0) {
      container.innerHTML = "<p>No mutual matches yet.</p>";
      return;
    }

    for (const user of matches) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${user.fname} ${user.lname} (${user.email})</h3>
        <p>${user.age} • ${user.city}, ${user.country}</p>
        <p class="bio">${user.bio || "No bio available."}</p>
      `;
      container.appendChild(card);
    }

  } catch (err) {
    container.innerHTML = `<p>Error loading matches. Check console.</p>`;
    console.error(err);
  }
});