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
            // Fetch the user's latitude and longitude first
            const { latitude, longitude } = await env.DB.prepare(
                `SELECT latitude, longitude FROM users WHERE email = ?`
            ).bind(user.email).first();

            if (latitude === null || longitude === null) {
                return new Response(JSON.stringify({ error: "User location not available" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            // Get users that match seeking criteria, excluding already swiped users, sorted by distance
            const matches = await env.DB.prepare(
                `SELECT *,
                (
                    6371 * acos(
                        cos(radians(?)) *
                        cos(radians(latitude)) *
                        cos(radians(longitude) - radians(?)) +
                        sin(radians(?)) *
                        sin(radians(latitude))
                    )
                ) AS distance
                FROM users 
                WHERE gender = ?
                  AND email != ? 
                  AND email NOT IN (
                      SELECT match_email FROM swipes WHERE user_email = ?
                  )
                ORDER BY distance ASC`
            ).bind(latitude, longitude, latitude, user.seeking, user.email, user.email).all();
        
            return new Response(JSON.stringify(matches.results), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (err) {
            console.error(err);
            return new Response(JSON.stringify({ error: "Internal Server Error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
}