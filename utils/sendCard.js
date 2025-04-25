
import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCard({ toEmail, subject, templateName, customMessage, senderName, inlineHtml }) {
  try {
    let html;

    if (inlineHtml) {
      html = inlineHtml
        .replace('{{customMessage}}', customMessage || '')
        .replace('{{senderName}}', senderName || 'a friend');
    } else {
      const cardPath = path.join(process.cwd(), 'cards', templateName);
      console.log(`📄 Reading card file from: ${cardPath}`);

      try {
        await fs.access(cardPath);
      } catch {
        throw new Error(`Card template "${templateName}" not found at ${cardPath}`);
      }

      html = await fs.readFile(cardPath, 'utf-8');
      html = html
        .replace('{{customMessage}}', customMessage)
        .replace('{{senderName}}', senderName || 'a friend');
    }

    const data = await resend.emails.send({
      from: 'cards@greetingcardgenius.com.au',
      to: toEmail,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${toEmail} (${inlineHtml ? 'inline' : templateName})`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ sendCard failed:', error);
    throw new Error('Failed to send card: ' + error.message);
  }
}
