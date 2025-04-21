import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { toEmail, subject, templateName, customMessage } = req.body;

    if (!toEmail || !subject || !templateName || !customMessage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const html = `
      <h2>${subject}</h2>
      <p>${customMessage}</p>
    `;

    const data = await resend.emails.send({
      from: 'cards@greetingcardgenius.com.au',
      to: toEmail,
      subject,
      html,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
