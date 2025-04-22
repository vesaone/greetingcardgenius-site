import { buffer } from 'micro';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let event;

  try {
    const sig = req.headers['stripe-signature'];
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);

    console.log('✅ Webhook received:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const { toEmail, subject, customMessage, senderName, templateName } = session.metadata;

      console.log('📦 Metadata received:', session.metadata);

      const fs = await import('fs/promises');
      const path = await import('path');

      const cardPath = path.join(process.cwd(), 'cards', templateName);
      let html = await fs.readFile(cardPath, 'utf-8');

      html = html
        .replace('{{customMessage}}', customMessage)
        .replace('{{senderName}}', senderName || 'a friend');

      const emailResponse = await resend.emails.send({
        from: 'cards@greetingcardgenius.com.au',
        to: toEmail,
        subject,
        html,
      });

      console.log('✅ Email sent via Resend:', emailResponse);
    }

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('❌ Webhook error:', error.message || error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
