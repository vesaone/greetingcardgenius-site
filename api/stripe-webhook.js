import { buffer } from 'micro';
import Stripe from 'stripe';
import sendCard from '../utils/sendCard.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Stripe signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    let {
      toEmail,
      subject,
      customMessage,
      senderName,
      templateName,
      html
    } = session.metadata || {};

    // 🛡️ Strip any trailing "-card.html" to prevent double suffixing
    if (templateName && templateName.toLowerCase().endsWith('-card.html')) {
      templateName = templateName.replace(/-card\.html$/i, '');
    }

    try {
      console.log(`📨 Sending card to: ${toEmail}`);
      await sendCard({
        toEmail,
        subject,
        customMessage,
        senderName,
        templateName,
        html
      });

      return res.status(200).send('✅ Email sent');
    } catch (err) {
      console.error('❌ Resend failed:', err);
      return res.status(500).send('Email error');
    }
  }

  return res.status(200).send('Event received');
}
