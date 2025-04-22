export async function onRequest(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split(";").map(c => c.trim().split("=")));
    const userEmail = decodeURIComponent(cookies.email || "");
  
    if (!userEmail) {
        return new Response(JSON.stringify({ error: "Not logged in" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
  
    const query = `
        SELECT u.*
        FROM swipes s1
        JOIN swipes s2 ON s1.match_email = s2.user_email AND s1.user_email = s2.match_email
        JOIN users u ON u.email = s1.match_email
        WHERE s1.user_email = ? AND s1.swipe_type = 'like' AND s2.swipe_type = 'like'
    `;
  
    try {
        const matches = await env.DB.prepare(query).bind(userEmail).all();
  
        return new Response(JSON.stringify(matches.results), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: "Query failed", details: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}  