const ALLOWED_ORIGIN = "https://sapphy.pages.dev";

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/userId=(\d+)/);
    if (!match) {
      return new Response(JSON.stringify({ error: "No user ID cookie found" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userId = parseInt(match[1]);

    const user = await env.DB.prepare("SELECT seeking FROM users WHERE id = ?")
      .bind(userId)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const matches = await env.DB.prepare("SELECT * FROM users WHERE gender = ? AND id != ?")
      .bind(user.seeking, userId)
      .all();

    return new Response(JSON.stringify(matches.results), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
