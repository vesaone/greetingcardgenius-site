import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.warn("❌ Method not allowed");
    return res.status(405).end();
  }

  const { toEmail, subject, customMessage, senderName, templateName } = req.body;
  console.log("📨 Payload received:", req.body);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1RGgooLZwnxz54z4ih7JqVPE',
        quantity: 1
      }],
      mode: 'payment',
      success_url: 'https://greetingcardgenius.com/thank-you.html',
      cancel_url: 'https://greetingcardgenius.com/cancelled.html',
      metadata: {
        toEmail,
        subject,
        customMessage,
        senderName,
        templateName
      }
    });

    console.log("✅ Stripe session created:", session.url);
    res.status(200).json({ payment_url: session.url });

  } catch (err) {
    console.error("❌ Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
}
