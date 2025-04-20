import { hashPassword } from "./../../utils.js";

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
            fname,
            lname,
            age,
            gender,
            seeking,
            country,
            city,
            bio
        } = data;
    
        if (!action) {
            return new Response(JSON.stringify({ error: "Missing Action" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    
        // REGISTER
        if (action === "register") {
            if (!fname || !lname || !age || !gender || !seeking || !country || !city) {
                return new Response(JSON.stringify({ error: "Missing registration fields" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
    
            const exists = await env.DB.prepare(
                "SELECT 1 FROM users WHERE email = ?"
            ).bind(email).first();
    
            if (exists) {
                return new Response(JSON.stringify({ error: "Email already registered" }), {
                   status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
    
            const hashed = await hashPassword(password);
    
            await env.DB.prepare(
                `INSERT INTO users (email, password, fname, lname, age, gender, seeking, country, city)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(email, hashed, fname, lname, age, gender, seeking, country, city).run();
    
            return new Response(JSON.stringify({ message: "Registered", success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
    }
}