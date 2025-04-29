document.addEventListener("DOMContentLoaded", () => {
  function getCookie(name) { 
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  const settingsForm = document.getElementById("settings-form");
  if (!settingsForm) {
    console.error("❌ Element with ID 'settings-form' not found. Ensure the form exists in the HTML.");
    return;
  }

  settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = getCookie("email");
    const password = getCookie("password");
    const bio = e.target.bio.value;

    if (!email || !password) {
      alert("User not logged in.");
      return;
    }

    try {
      const res = await fetch("https://sapphy.pages.dev/worker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies along
        body: JSON.stringify({
          action: "update_bio",
          email,
          password,
          bio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      alert("Bio updated successfully!");
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Failed to update bio");
    }
  });
});