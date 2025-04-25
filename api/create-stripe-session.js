
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing session_id" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed." });
    }

    const metadata = session.metadata;
    const response = await fetch(`${process.env.BASE_URL}/api/send-card`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toEmail: metadata.toEmail,
        subject: metadata.subject,
        customMessage: metadata.customMessage,
        senderName: metadata.senderName,
        html: metadata.html,
      })
    });

    const result = await response.json();
    if (response.ok) {
      return res.status(200).json({ success: true, data: result });
    } else {
      return res.status(500).json({ error: "Failed to send card", details: result });
    }
  } catch (error) {
    console.error("❌ Stripe confirm error:", error);
    return res.status(500).json({ error: "Unable to confirm payment" });
  }
}
