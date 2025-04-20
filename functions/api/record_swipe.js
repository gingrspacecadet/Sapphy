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
    
        // RECORD SWIPE
        if (action === "record_swipe") {
            const { email, targetEmail, swipeType } = data;
    
            if (!email || !targetEmail || !swipeType) {
                return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
                });
            }
    
            try {
                // Insert or update the swipe record in the database
                await env.DB.prepare(
                `INSERT INTO swipes (user_email, match_email, swipe_type) 
                VALUES (?, ?, ?) 
                ON CONFLICT(user_email, match_email) 
                DO UPDATE SET swipe_type = ?`
                ).bind(email, targetEmail, swipeType, swipeType).run();
    
                return new Response(JSON.stringify({ message: "Swipe recorded", success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
                });
            } catch (err) {
                console.error("Error recording swipe:", err);
                return new Response(JSON.stringify({ error: "Database error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
                });
            }
        }
    
        return new Response(JSON.stringify({ error: "Invalid action" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
}