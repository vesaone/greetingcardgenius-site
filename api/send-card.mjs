import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, subject, templateName, customMessage, senderName } = req.body;

  if (!toEmail || !subject || !templateName || !customMessage) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const cardPath = path.join(process.cwd(), 'cards', templateName);
    let html = await fs.readFile(cardPath, 'utf-8');

    html = html
      .replace('{{customMessage}}', customMessage)
      .replace('{{senderName}}', senderName || 'a friend');

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
