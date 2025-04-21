// /api/create-payment-intent.mjs
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, subject, templateName, customMessage, senderName } = req.body;

  if (!toEmail || !templateName || !subject) {
    return res.status(400).json({ error: 'Missing fields for payment intent' });
  }

  try {
    const authToken = Buffer.from(`${process.env.AIRWALLEX_API_KEY}:`).toString('base64');

    const response = await fetch('https://pci-api.airwallex.com/api/v1/pa/payment_intents/create', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Content-Type': 'application/json',
        'x-api-key': process.env.AIRWALLEX_CLIENT_KEY
      },
      body: JSON.stringify({
        request_id: `req_${Date.now()}`,
        amount: 1.99,
        currency: 'AUD',
        merchant_order_id: `order_${Date.now()}`,
        return_url: 'https://www.greetingcardgenius.com.au/payment-success.html',
        metadata: {
          toEmail,
          subject,
          templateName,
          customMessage,
          senderName
        }
      })
    });

    const data = await response.json();

    if (!data || !data.id) {
      console.error("Airwallex API response:", data);
      return res.status(500).json({ error: 'Failed to create payment intent' });
    }

    const checkoutUrl = `https://checkout.airwallex.com/payment_intents/${data.id}/confirm`;

    return res.status(200).json({ payment_url: checkoutUrl });
  } catch (error) {
    console.error('Payment intent error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
