import { buffer } from 'micro';
import Stripe from 'stripe';
import { sendCard } from '@/utils/sendCard.js';

export const config = {
  api: {
    bodyParser: false
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16'
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const buf = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const metadata = session.metadata;
    if (!metadata) {
      console.error("❌ No metadata found in session");
      return res.status(400).send("Missing metadata");
    }

    const { toEmail, subject, customMessage, senderName, templateName } = metadata;

    try {
      console.log(`📤 Sending card to ${toEmail}`);
      await sendCard({ toEmail, subject, customMessage, senderName, templateName });
      return res.status(200).send('✅ Email sent');
    } catch (err) {
      console.error('❌ Error sending email:', err);
      return res.status(500).send('Failed to send email');
    }
  }

  res.status(200).send('✅ Webhook received');
}
