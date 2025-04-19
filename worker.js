const ALLOWED_ORIGIN = "https://sapphy.pages.dev";

export default {
  async fetch(request, env) {
    const { method } = request;

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true"
    };

    // Handle preflight
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Only allow POST
    if (method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: corsHeaders
      });
    }

    // Parse JSON body
    let data;
    try {
      data = await request.json();
    } catch {
      return new Response("Bad JSON", {
        status: 400,
        headers: corsHeaders
      });
    }

    const {
      action,
      email,
      password,
      fname,
      lname,
      age,
      gender,
      seeking,
      country,
      city
    } = data;

    if (!action || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ error: "DB not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // REGISTER
    if (action === "register") {
      // Check all fields
      if (!fname || !lname || !age || !gender || !seeking || !country || !city) {
        return new Response(JSON.stringify({ error: "Missing registration fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Check if email exists
      const exists = await env.DB.prepare(
        "SELECT 1 FROM users WHERE email = ?"
      ).bind(email).first();

      if (exists) {
        return new Response(JSON.stringify({ error: "Email already registered" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const hashed = await hashPassword(password);

      await env.DB.prepare(
        `INSERT INTO users (email, password, fname, lname, age, gender, seeking, country, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(email, hashed, fname, lname, age, gender, seeking, country, city).run();

      return new Response(JSON.stringify({
        message: "Registered",
        success: true
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // LOGIN
    if (action === "login") {
      const user = await env.DB.prepare(
        "SELECT id, password FROM users WHERE email = ?"
      ).bind(email).first();

      if (!user) {
        return new Response(JSON.stringify({ error: "Email not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const ok = await verifyPassword(password, user.password);
      if (!ok) {
        return new Response(JSON.stringify({ error: "Wrong password" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        message: "Logged in",
        success: true,
        userId: user.id,
        redirectUrl: "/app.html"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Invalid action
    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};

// Password hashing
async function hashPassword(pw) {
  const enc = new TextEncoder().encode(pw);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPassword(input, stored) {
  return (await hashPassword(input)) === stored;
}