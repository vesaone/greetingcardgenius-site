import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const mock = {
    toEmail: 'admin@quantumnova.com.au',
    subject: '🎉 Happy Birthday from GreetingCardGenius!',
    customMessage: 'Test message works perfectly.',
    senderName: 'Test Bot',
    templateName: 'birthday-card.html'
  };

  try {
    const cardPath = path.join(process.cwd(), 'cards', mock.templateName);
    let html = await fs.readFile(cardPath, 'utf-8');

    html = html
      .replace('{{customMessage}}', mock.customMessage)
      .replace('{{senderName}}', mock.senderName);

    const response = await resend.emails.send({
      from: 'cards@greetingcardgenius.com.au',
      to: mock.toEmail,
      subject: mock.subject,
      html
    });

    console.log('✅ Manual Resend Test Email Sent:', response);
    res.status(200).json({ success: true, response });
  } catch (err) {
    console.error('❌ Manual Resend Test Error:', err);
    res.status(500).json({ error: err.message });
  }
}
