const ALLOWED_ORIGIN = "https://sapphy.pages.dev";

export async function onRequest(context) {
  const { request, env } = context;
  const { method } = request;

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "DB not configured" }), {
      status: 500,
      headers: {"Content-Type": "application/json" },
    });
  }

  if (method === "POST") {
    let data;
    try {
      data = await request.json();
    } catch {
      return new Response("Bad JSON", {
        status: 400,
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
      city,
    } = data;

    if (!action || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {"Content-Type": "application/json" },
        }
      );
    }

    // REGISTER
    if (action === "register") {
      if (!fname || !lname || !age || !gender || !seeking || !country || !city) {
        return new Response(
          JSON.stringify({ error: "Missing registration fields" }),
          {
            status: 400,
            headers: {"Content-Type": "application/json" },
          }
        );
      }

      const exists = await env.DB.prepare(
        "SELECT 1 FROM users WHERE email = ?"
      ).bind(email).first();

      if (exists) {
        return new Response(
          JSON.stringify({ error: "Email already registered" }),
          {
            status: 400,
            headers: {"Content-Type": "application/json" },
          }
        );
      }

      const hashed = await hashPassword(password);

      await env.DB.prepare(
        `INSERT INTO users (email, password, fname, lname, age, gender, seeking, country, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(email, hashed, fname, lname, age, gender, seeking, country, city).run();

      return new Response(
        JSON.stringify({ message: "Registered", success: true }),
        {
          status: 200,
          headers: {"Content-Type": "application/json" },
        }
      );
    }

    // LOGIN
    if (action === "login") {
      const user = await env.DB.prepare(
        "SELECT id, password FROM users WHERE email = ?"
      ).bind(email).first();
    
      if (!user) {
        return new Response(JSON.stringify({ error: "Email not found" }), {
          status: 404,
          headers: {"Content-Type": "application/json" },
        });
      }
    
      const ok = await verifyPassword(password, user.password);
      if (!ok) {
        return new Response(JSON.stringify({ error: "Wrong password" }), {
          status: 400,
          headers: {"Content-Type": "application/json" },
        });
      }
    
      const email = user.email;
    
      return new Response(JSON.stringify({
        message: "Logged in",
        success: true,
        redirectUrl: "/app.html",
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `email=${email}; Path=/; Max-Age=2592000; SameSite=None; Secure;`,
        },
      });
    }

    // UPDATE BIO
    if (action === "update_bio") {
      const { userId, bio } = data;
    
      if (!userId || !bio) {
        return new Response(JSON.stringify({ error: "Missing userId or bio" }), {
          status: 400,
          headers: {"Content-Type": "application/json" },
        });
      }
    
      try {
        await env.DB.prepare("UPDATE users SET bio = ? WHERE id = ?")
          .bind(bio, userId)
          .run();
    
        return new Response(JSON.stringify({ message: "Bio updated", success: true }), {
          status: 200,
          headers: {"Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Bio update error:", err);
        return new Response(JSON.stringify({ error: "Database error" }), {
          status: 500,
          headers: {"Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: {"Content-Type": "application/json" },
    });
  }

  if (method === "GET") {
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => c.split("=")));
    const userId = cookies.userId;

    if (!userId) {
      return new Response(JSON.stringify({ error: "No user ID cookie found" }), {
        status: 401,
        headers: {"Content-Type": "application/json" },
      });
    }

    try {
      const user = await env.DB.prepare("SELECT seeking FROM users WHERE id = ?")
        .bind(userId)
        .first();

      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: {"Content-Type": "application/json" },
        });
      }

      const matches = await env.DB.prepare(
        "SELECT * FROM users WHERE gender = ? AND id != ?"
      ).bind(user.seeking, userId).all();

      return new Response(JSON.stringify(matches.results), {
        status: 200,
        headers: {"Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: {"Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: {"Content-Type": "application/json" },
  });
}

// Password hashing
async function hashPassword(pw) {
  const enc = new TextEncoder().encode(pw);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Password verification
async function verifyPassword(input, stored) {
  return (await hashPassword(input)) === stored;
}