// /api/create-payment-intent.mjs
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { amount, currency, reference } = req.body;

  try {
    const response = await fetch("https://api.airwallex.com/api/v1/pa/payment_intents/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AIRWALLEX_API_KEY}`,
        "Content-Type": "application/json",
        "x-client-id": process.env.AIRWALLEX_CLIENT_ID
      },
      body: JSON.stringify({
        request_id: `req_${Date.now()}`,
        amount,
        currency,
        merchant_order_id: reference,
        descriptor: "Greeting Card Genius",
        return_url: "https://www.greetingcardgenius.com.au/success.html"
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create payment intent" });
  }
}
