async function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value.trim();

    if (!username || !password || !email) {
        alert("Please fill in all fields.");
        return false;
    }

    try {
        const response = await fetch("https://register.sapphy.workers.dev/register", {
            method: "POST",  // Ensure you're using POST to send the data in the body
            headers: {
                "Content-Type": "application/json"  // Send as JSON
            },
            body: JSON.stringify({ username, email, password })  // Send the data
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful!");
            // Optionally: Redirect to login or another page
            // window.location.href = "/login.html";
        } else {
            alert(result.error || "Registration failed.");
        }
    } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong. Please try again later.");
    }

    return false; // Prevent default form submission
}
