export async function getUserFromCookies(request, env) {
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));

    const email = decodeURIComponent(cookies.email || "");
    const storedHash = cookies.password || "";

    if (!email || !storedHash) return null;

    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?")
        .bind(email).first();

    if (!user || user.password !== storedHash) return null;

    return user;
}

export async function verifyPassword(input, stored) {
    return (await hashPassword(input)) === stored;
}

export async function hashPassword(pw) {
    const enc = new TextEncoder().encode(pw);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
}