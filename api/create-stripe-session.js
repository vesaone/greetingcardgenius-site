import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    toEmail,
    subject,
    senderName,
    customMessage = "",
    templateName = "AI", // default for AI cards
    html = ""
  } = req.body;

  if (!toEmail || !subject || !senderName || !templateName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 🧠 Normalize templateName to match your /cards/[name]-card.html
  const normalizedTemplateName = templateName
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, '')  // keep dashes (critical!)
  .replace(/\.html$/, '')      // strip ".html" if included
  .replace(/-card$/, '');      // optional: avoid "-card-card"


  try {
    const safeHtml = html.length > 400 ? html.slice(0, 400) + "…" : html;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1RGgooLZwnxz54z4ih7JqVPE', // your Stripe price ID
        quantity: 1
      }],
      mode: 'payment',
      success_url: 'https://www.greetingcardgenius.com.au/thank-you?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.greetingcardgenius.com.au/cancelled',
      metadata: {
        toEmail,
        subject,
        senderName,
        customMessage: customMessage.slice(0, 500),
        templateName: normalizedTemplateName,
        html: safeHtml
      }
    });

    return res.status(200).json({ payment_url: session.url });

  } catch (err) {
    console.error("❌ Stripe error:", err);
    return res.status(500).json({ error: err.message });
  }
}
