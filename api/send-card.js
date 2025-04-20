const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, subject, templateName, customMessage } = req.body;

  if (!toEmail || !subject || !templateName || !customMessage) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const templatePath = path.join(process.cwd(), 'assets', 'templates', templateName);
    const rawHtml = fs.readFileSync(templatePath, 'utf8');
    const html = rawHtml.replace('{{message}}', customMessage);

    // Replace this with your actual email-sending logic via Supabase/SendGrid
    const emailResponse = await fetch('https://api.supabase.com/fake-email-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        to: toEmail,
        subject,
        html,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error(`Email API failed: ${emailResponse.status}`);
    }

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send email' });
  }
};
