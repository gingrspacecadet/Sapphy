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
  
    if (method === "GET") {
        const user = await getUserFromCookies(request, env);
    
        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid or missing cookies" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        try {
            // Get users that the current user hasn't swiped on (liked or noped)
            const matches = await env.DB.prepare(
                `SELECT * FROM users 
                WHERE gender = ? AND email != ? 
                AND email NOT IN (SELECT match_email FROM swipes WHERE user_email = ?)`
            ).bind(user.seeking, user.email, user.email).all();
        
            return new Response(JSON.stringify(matches.results), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: "Internal Server Error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
}