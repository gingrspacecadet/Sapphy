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

      // Add swipe logic
      let startX = 0;
      let startY = 0;

      const handleTouchStart = (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      };

      const handleTouchMove = (e) => {
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;

        // If it's a significant horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          card.style.transform = `translateX(${deltaX}px)`;
        }
      };

      const handleTouchEnd = (e) => {
        const deltaX = e.changedTouches[0].clientX - startX;

        // If swipe is significant enough to trigger an action
        if (Math.abs(deltaX) > 100) {
          if (deltaX > 0) {
            card.style.transform = `translateX(100%)`;
            // Handle like action
          } else {
            card.style.transform = `translateX(-100%)`;
            // Handle nope action
          }
          setTimeout(() => {
            card.remove();
          }, 300); // Wait for the card to exit before removing it
        } else {
          card.style.transform = `translateX(0)`;
        }
      };

      card.addEventListener("touchstart", handleTouchStart);
      card.addEventListener("touchmove", handleTouchMove);
      card.addEventListener("touchend", handleTouchEnd);

      // Button logic (for desktop)
      card.querySelector(".like").addEventListener("click", () => {
        card.style.transform = `translateX(100%)`;
        setTimeout(() => {
          card.remove();
        }, 300);
      });
      card.querySelector(".nope").addEventListener("click", () => {
        card.style.transform = `translateX(-100%)`;
        setTimeout(() => {
          card.remove();
        }, 300);
      });

      container.appendChild(card);
    });

  } catch (err) {
    console.error("❌ Fetch failed:", err);
    alert("Failed to fetch matches");
  }
}

window.addEventListener("DOMContentLoaded", fetchMatches);