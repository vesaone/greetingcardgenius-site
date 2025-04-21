import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { toEmail, subject, templateName, customMessage, senderName } = req.body;

  const paymentIntentPayload = {
    amount: 199,
    currency: 'AUD',
    merchant_order_id: `gcg-${Date.now()}`,
    return_url: 'https://greetingcardgenius.com.au/thankyou.html',
    metadata: {
      toEmail,
      subject,
      templateName,
      customMessage,
      senderName
    }
  };

  try {
    const response = await fetch('https://api.airwallex.com/api/v1/pa/payment_intents/create', {
      method: 'POST',
      headers: {
        'x-client-id': process.env.AIRWALLEX_CLIENT_ID,
        'x-api-key': process.env.AIRWALLEX_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentIntentPayload)
    });

    const data = await response.json();
    if (data.next_action && data.next_action.redirect_url) {
      return res.status(200).json({ payment_url: data.next_action.redirect_url });
    } else {
      return res.status(500).json({ error: 'Failed to create payment intent', detail: data });
    }
  } catch (err) {
    console.error('Payment intent error:', err);
    return res.status(500).json({ error: 'Payment intent creation failed' });
  }
}
