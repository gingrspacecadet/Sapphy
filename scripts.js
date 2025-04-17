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
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Registration successful!");
        } else {
            alert(result.error || "Registration failed.");
        }
    } catch (err) {
        console.error("Client error:", err);
        alert("Something went wrong. Please try again later.");
    }

    return false;
}