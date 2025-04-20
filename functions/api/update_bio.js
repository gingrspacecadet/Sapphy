import { getUserFromCookies } from "../utils.js";

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
            bio
        } = data;
  
        if (!action) {
            return new Response(JSON.stringify({ error: "Missing Action" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
            });
        }
        
        if (action === "update_bio") {
            if (!bio) {
                return new Response(JSON.stringify({ error: "Missing bio" }), {
                    status: 402,
                    headers: { "Content-Type": "application/json" },
                });
            }
            
            const user = await getUserFromCookies(request, env);
            if (!user) {
                return new Response(JSON.stringify({ error: "Invalid or missing cookies" }), {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                });
            }
            
            try {
                await env.DB.prepare("UPDATE users SET bio = ? WHERE email = ?")
                .bind(bio, user.email)
                .run();

                return new Response(JSON.stringify({ message: "Bio updated", success: true }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });

            } catch (err) {
            console.error("Bio update error:", err);
            return new Response(JSON.stringify({ error: "Database error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
            }
        }
    }
}