const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, subject, templateName, customMessage } = req.body;

  if (!toEmail || !subject || !templateName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Load the HTML template
  const templatePath = path.join(__dirname, '..', 'assets', 'templates', templateName);
  let htmlContent;

  try {
    htmlContent = fs.readFileSync(templatePath, 'utf-8');
  } catch (err) {
    return res.status(404).json({ error: `Template "${templateName}" not found` });
  }

  // Inject message if needed
  const finalHtml = htmlContent.replace('{{message}}', customMessage || '');

  // Send via Resend
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        subject: subject,
        html: finalHtml,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(500).json({ error: 'Failed to send email', details: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Server error sending email' });
  }
};
