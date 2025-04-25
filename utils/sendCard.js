import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendCard({ toEmail, subject, customMessage, senderName, templateName, html }) {
  try {
    let emailHtml = html;

    // ✅ If no AI HTML, fall back to template
    if (!html && templateName) {
      // 🛡️ Prevent double "-card"
      const baseName = templateName.toLowerCase().endsWith('-card')
        ? templateName.toLowerCase()
        : `${templateName.toLowerCase()}-card`;

      const filename = `${baseName}.html`;
      const filePath = path.join(process.cwd(), 'cards', filename);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Card template "${filename}" not found`);
      }

      const templateHtml = fs.readFileSync(filePath, 'utf-8');

      emailHtml = templateHtml
        .replace(/{{\s*customMessage\s*}}/gi, customMessage || '')
        .replace(/{{\s*senderName\s*}}/gi, senderName || '');
    }

    if (!emailHtml) {
      throw new Error('No HTML content available to send.');
    }

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
