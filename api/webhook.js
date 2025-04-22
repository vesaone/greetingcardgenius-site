import { buffer } from 'micro';
import Stripe from 'stripe';
import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { toEmail, subject, templateName, customMessage, senderName } = session.metadata;

    try {
      const cardPath = path.join(process.cwd(), 'cards', templateName);
      let html = await fs.readFile(cardPath, 'utf-8');

      html = html
        .replace('{{customMessage}}', customMessage)
        .replace('{{senderName}}', senderName || 'a friend');

      await resend.emails.send({
        from: 'cards@greetingcardgenius.com.au',
        to: toEmail,
        subject,
        html,
      });

      console.log("✅ Card emailed to", toEmail);
    } catch (err) {
      console.error("❌ Email sending failed:", err);
    }
  }

  res.status(200).json({ received: true });
}
