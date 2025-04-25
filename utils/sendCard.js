import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendCard({ toEmail, subject, customMessage, senderName, templateName, html }) {
  try {
    let emailHtml = html;

    // 👇 If no HTML provided, assume it's a static template card
    if (!html && templateName) {
      const normalizedTemplate = templateName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')   // Remove anything except letters and numbers
        .replace(/html$/, '');        // Remove trailing "html" if it exists

      const filename = `${normalizedTemplate}-card.html`;
      const filePath = path.join(process.cwd(), 'cards', filename);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Card template "${filename}" not found`);
      }

      const templateHtml = fs.readFileSync(filePath, 'utf-8');

      // 🔁 Replace placeholders in the template
      emailHtml = templateHtml
        .replace(/{{\s*customMessage\s*}}/gi, customMessage || '')
        .replace(/{{\s*senderName\s*}}/gi, senderName || '');
    }

    if (!emailHtml) {
      throw new Error('No HTML content available to send.');
    }

    // ✅ Send via Resend
    await resend.emails.send({
      from: 'cards@greetingcardgenius.com.au',
      to: toEmail,
      subject: subject || 'You’ve received a card!',
      html: emailHtml
    });

    console.log(`✅ Card sent successfully to ${toEmail}`);
    return { success: true };

  } catch (err) {
    console.error("❌ Resend failed:", err);
    throw err;
  }
}
