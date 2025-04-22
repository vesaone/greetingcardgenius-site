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
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const sig = req.headers['stripe-signature'];
    const buf = await buffer(req);
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { toEmail, subject, customMessage, senderName, templateName } = session.metadata;

      if (!toEmail || !templateName) {
        console.error("❌ Missing email or templateName in metadata");
        return res.status(400).json({ error: "Missing required metadata" });
      }

      const cardPath = path.join(process.cwd(), 'cards', templateName);
      let html = await fs.readFile(cardPath, 'utf-8');

      html = html
        .replace('{{customMessage}}', customMessage || '')
        .replace('{{senderName}}', senderName || 'a friend');

      const result = await resend.emails.send({
        from: 'cards@greetingcardgenius.com.au',
        to: toEmail,
        subject: subject || '🎉 You received a greeting card!',
        html
      });

      console.log("✅ Email sent:", result);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
