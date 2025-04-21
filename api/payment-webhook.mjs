import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const event = req.body;
    if (event.type !== 'payment_intent.succeeded') {
      return res.status(200).json({ message: 'Event ignored' });
    }

    const meta = event.data.metadata;
    const cardPath = path.join(process.cwd(), 'cards', meta.templateName);
    let html = await fs.readFile(cardPath, 'utf-8');

    html = html
      .replace('{{customMessage}}', meta.customMessage)
      .replace('{{senderName}}', meta.senderName || 'a friend');

    await resend.emails.send({
      from: 'cards@greetingcardgenius.com.au',
      to: meta.toEmail,
      subject: meta.subject,
      html
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook send error:', err);
    return res.status(500).json({ error: 'Webhook failed' });
  }
}
