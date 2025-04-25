import { verifyPassword } from "../utils.js";

export async function onRequest(context) {
    const { request, env } = context;
    const { method } = request;
  
    if (method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
  
    if (!env.DB) {
      return new Response(JSON.stringify({ error: "DB not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (method === "POST") {
        let data;
        try {
           data = await request.json();
        } catch {
            return new Response("Bad JSON", { status: 400 });
        }
  
        const {
            action,
            email,
            password,
        } = data;
        
        if (!action) {
            return new Response(JSON.stringify({ error: "Missing Action" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
            });
        }
        
        if (action === "login") {
            const user = await env.DB.prepare(
            "SELECT email, password FROM users WHERE email = ?"
            ).bind(email).first();
            
            if (!user) {
            return new Response(JSON.stringify({ error: "Email not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
            }
            
            const ok = await verifyPassword(password, user.password);
            if (!ok) {
                return new Response(JSON.stringify({ error: "Wrong password" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
            }
  
            const cookieOptions = "Path=/; Max-Age=2592000; SameSite=None; Secure;";
            const headers = new Headers();
            headers.set("Content-Type", "application/json");
            headers.append("Set-Cookie", `email=${encodeURIComponent(email)}; ${cookieOptions}`);
            headers.append("Set-Cookie", `password=${user.password}; ${cookieOptions}`);
            
            return new Response(JSON.stringify({
                message: "Logged in",
                success: true,
            }), { status: 200, headers });      
        }
    }
}