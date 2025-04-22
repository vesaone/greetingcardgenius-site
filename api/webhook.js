import { sendCard } from '@/utils/sendCard.js'; // again, adjust import path if needed
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { toEmail, subject, templateName, customMessage, senderName } = session.metadata;

    try {
      await sendCard({ toEmail, subject, templateName, customMessage, senderName });
      console.log("✅ Card sent to:", toEmail);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("❌ Failed to send card from webhook:", err.message);
      return res.status(500).send("Delivery failed");
    }
  }

  res.status(200).send("OK");
}
