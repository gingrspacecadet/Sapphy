function getCookie(name) { 
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }
  
  document.getElementById("settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const userId = getCookie("userId");
    const bio = e.target.bio.value;
  
    if (!userId) {
      alert("User not logged in.");
      return;
    }
  
    try {
      const res = await fetch("https://api.sapphy.workers.dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies are sent with the request
        body: JSON.stringify({
          action: "update_bio",
          userId,
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
  