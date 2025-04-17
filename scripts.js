async function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value.trim();

    if (!username || !password || !email) {
        alert("Please fill in all fields.");
        return false;
    }

    try {
        const response = await fetch("https://register.sapphy.workers.dev", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password, email })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful!");
            // Optional: Redirect to login or home page
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
