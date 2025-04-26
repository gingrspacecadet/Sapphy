export default {
    async scheduled(event, env, ctx) {
      // 1. Get all users
      const usersQuery = `SELECT email FROM users`;
      const usersResult = await env.DB.prepare(usersQuery).all();
      const users = usersResult.results;
  
      for (const user of users) {
        const userEmail = user.email;
  
        // 2. Get mutual matches for this user
        const matchesQuery = `
          SELECT COUNT(*) as match_count
          FROM swipes s1
          JOIN swipes s2 ON s1.match_email = s2.user_email AND s1.user_email = s2.match_email
          WHERE s1.user_email = ? AND s1.swipe_type = 'like' AND s2.swipe_type = 'like'
        `;
        const matchesResult = await env.DB.prepare(matchesQuery).bind(userEmail).first();
        const matchCount = matchesResult.match_count;
  
        // 3. If they have matches, send an email
        if (matchCount > 0) {
          await sendEmail(userEmail, matchCount, env);
        }
      }
    }
  };
  
  async function sendEmail(userEmail, matchCount, env) {
    const subject = "You've got new mutual matches!";
    const body = `Hey! You have ${matchCount} mutual matches waiting for you. 🎉`;
  
    // Example with Mailgun API:
    await fetch(`https://api.mailgun.net/v3/YOUR_DOMAIN/messages`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`api:${env.MAILGUN_API_KEY}`),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        from: "Your App <noreply@yourdomain.com>",
        to: userEmail,
        subject,
        text: body
      })
    });
  }  