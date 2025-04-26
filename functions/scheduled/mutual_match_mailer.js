export async function scheduled(event, env, ctx) {
    // ensure the email tasks stay alive if the Worker otherwise finishes early
    ctx.waitUntil(sendMutualMatchEmails(env));
}

async function sendMutualMatchEmails(env) {
    // 1. Get all users
    const usersQuery = `SELECT email FROM users`;
    const { results: users } = await env.DB.prepare(usersQuery).all();

    // 2. For each user, check mutual matches in parallel
    await Promise.all(users.map(async ({ email: userEmail }) => {
        const matchesQuery = `
            SELECT COUNT(*) AS count
            FROM swipes s1
            JOIN swipes s2
              ON s1.match_email = s2.user_email
             AND s1.user_email  = s2.match_email
            WHERE s1.user_email = ?
              AND s1.swipe_type = 'like'
              AND s2.swipe_type = 'like'
        `;
        const { count } = await env.DB
            .prepare(matchesQuery)
            .bind(userEmail)
            .first();

        if (count > 0) {
            await sendEmail(userEmail, count, env);
        }
    }));
}

async function sendEmail(userEmail, matchCount, env) {
    const subject = "You've got new mutual matches!";
    const bodyText = `Hey! You have ${matchCount} new mutual matches waiting for you. 🎉`;

    await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: "Your App <noreply@yourdomain.com>",
            to: userEmail,
            subject,
            text: bodyText,
        }),
    });
}

// Fetch function for testing
export async function fetch(request, env, ctx) {
    // Trigger the email sending function manually for testing
    const userEmail = 'jackrawlings2011@gmail.com';
    const matchCount = await getMutualMatches(userEmail, env);

    if (matchCount > 0) {
        await sendEmail(userEmail, matchCount, env);
        return new Response("Test email sent!", { status: 200 });
    }

    return new Response("No mutual matches found for testing.", { status: 200 });
}

async function getMutualMatches(userEmail, env) {
    const matchesQuery = `
        SELECT COUNT(*) AS count
        FROM swipes s1
        JOIN swipes s2
          ON s1.match_email = s2.user_email
         AND s1.user_email  = s2.match_email
        WHERE s1.user_email = ?
          AND s1.swipe_type = 'like'
          AND s2.swipe_type = 'like'
    `;

    const { count } = await env.DB
        .prepare(matchesQuery)
        .bind(userEmail)
        .first();

    return count;
}

export default { scheduled };