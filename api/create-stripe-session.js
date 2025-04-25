import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const {
    toEmail,
    subject,
    customMessage,
    senderName,
    templateName,
    html // only used for AI cards
  } = req.body;

  if (!toEmail || !subject || !senderName) {
    return res.status(400).json({ error: "Missing session data" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price: "price_1RGgooLZwnxz54z4ih7JqVPE", // $1.99 AUD
        quantity: 1,
      }],
      mode: "payment",
      success_url: "https://www.greetingcardgenius.com.au/thank-you?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.greetingcardgenius.com.au/cancelled",
      metadata: {
        toEmail,
        subject,
        customMessage: customMessage || "",
        senderName,
        templateName: templateName || "AI",
        html: html || "" // optional, only for AI cards
      }
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("❌ Stripe error:", err);
    return res.status(500).json({ error: "Failed to create Stripe session" });
  }
}
