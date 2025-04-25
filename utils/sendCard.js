import fs from "fs";
import path from "path";

export async function sendCard({ toEmail, subject, senderName, customMessage, templateName, html }) {
  let cardHtml;

  if (html) {
    // ✅ AI card: use provided HTML directly
    cardHtml = html;
  } else if (templateName) {
    // ✅ Template card: load file
    const filePath = path.join(process.cwd(), "cards", `${templateName}.html`);
    try {
      cardHtml = fs.readFileSync(filePath, "utf8");
    } catch (err) {
      throw new Error(`Card template "${templateName}" not found`);
    }

    // Optionally replace tokens like {{sender}}, {{message}} etc.
    cardHtml = cardHtml
      .replace(/{{sender}}/g, senderName)
      .replace(/{{message}}/g, customMessage);
  } else {
    throw new Error("No template or HTML provided.");
  }

  // Proceed to send cardHtml via Resend or whatever system you're using
  // e.g. sendEmail({ to: toEmail, subject, html: cardHtml });
}
