function register() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var email = document.getElementById("email").value;

    if (username && password && email) {
        alert("Registration successful!");
        return true;
        // TODO: Add code to send registration data to the server
    } else {
        alert("Please fill in all fields.");
        return false;
    }
}