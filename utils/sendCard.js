import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCard({ toEmail, subject, templateName, customMessage, senderName }) {
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

    return { success: true, data };
  } catch (error) {
    console.error('❌ Resend error:', error);
    throw new Error('Failed to send card: ' + error.message);
  }
}
