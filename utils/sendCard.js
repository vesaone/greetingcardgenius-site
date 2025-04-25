import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendCard({ toEmail, subject, customMessage, senderName, templateName, html }) {
  try {
    let emailHtml = html;

    // 👇 If no HTML provided, assume it's a static template name
    if (!html && templateName) {
      const normalizedTemplate = templateName
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/card$/, '');

      const filename = `${normalizedTemplate}-card.html`;
      const filePath = path.join(process.cwd(), 'cards', filename);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Card template "${filename}" not found`);
      }

      const templateHtml = fs.readFileSync(filePath, 'utf-8');

      // Replace {{customMessage}} and {{senderName}} placeholders
      emailHtml = templateHtml
        .replace(/{{\s*customMessage\s*}}/gi, customMessage || '')
        .replace(/{{\s*senderName\s*}}/gi, senderName || '');
    }

    // ✅ Send via Resend
    await resend.emails.send({
      from: 'cards@greetingcardgenius.com.au',
      to: toEmail,
      subject: subject || 'You’ve received a card!',
      html: emailHtml
    });

    console.log(`✅ Card sent to ${toEmail}`);
    return { success: true };

  } catch (err) {
    console.error("❌ Resend failed:", err);
    throw err;
  }
}
