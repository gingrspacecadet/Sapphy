async function register() {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
  
    if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return false;
    }
  
    try {
      const response = await fetch("https://register.sapphy.workers.dev/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert(result.message || "Success!");
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
      } else {
        alert(result.error || "Registration failed.");
      }
    } catch (err) {
      console.error("Client error:", err);
      alert("Something went wrong. Please try again later.");
    }
  
    return false;
  }
  