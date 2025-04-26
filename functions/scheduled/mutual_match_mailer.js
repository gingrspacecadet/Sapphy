export const scheduled = async (event, env, ctx) => {
    await sendMutualMatchEmails(env);
};

async function sendMutualMatchEmails(env) {
    // 1. Get all users
    const usersQuery = `SELECT email FROM users`;
    const usersResult = await env.DB.prepare(usersQuery).all();
    const users = usersResult.results;

    // 2. For each user, check mutual matches
    const tasks = users.map(async (user) => {
        const userEmail = user.email;

        const matchesQuery = `
            SELECT u.*
            FROM swipes s1
            JOIN swipes s2 ON s1.match_email = s2.user_email AND s1.user_email = s2.match_email
            JOIN users u ON u.email = s1.match_email
            WHERE s1.user_email = ? AND s1.swipe_type = 'like' AND s2.swipe_type = 'like'
        `;
        const matchesResult = await env.DB.prepare(matchesQuery).bind(userEmail).all();
        const mutualMatches = matchesResult.results;

        // 3. If mutual matches exist, send an email
        if (mutualMatches.length > 0) {
            await sendEmail(userEmail, mutualMatches.length, env);
        }
    });

    // 4. Run all tasks in parallel
    await Promise.all(tasks);
}

async function sendEmail(userEmail, matchCount, env) {
    const subject = "You've got new mutual matches!";
    const bodyText = `Hey! You have ${matchCount} new mutual matches waiting for you. 🎉 Log in and say hi!`;

    await fetch('https://api.resend.com/emails', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: "Sapphy <noreply@sapphy.pages.dev>", // Change to your domain or sandbox
            to: userEmail,
            subject,
            text: bodyText
        })
    });
}