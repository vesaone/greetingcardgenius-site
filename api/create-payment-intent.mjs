export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      toEmail,
      subject,
      templateName,
      customMessage,
      senderName
    } = req.body;

    const apiKey = process.env.AIRWALLEX_API_KEY;

    const response = await fetch('https://pci-api.airwallex.com/api/v1/pa/payment_intents/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`, // ✅ No authToken here
        'Content-Type': 'application/json'
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

    if (!response.ok) {
      console.error('Airwallex API error:', data);
      return res.status(500).json({ error: data.message || 'Failed to create payment intent' });
    }

    return res.status(200).json({ payment_url: data.next_action?.redirect_to_url });
  } catch (err) {
    console.error('Payment intent error:', err);
    return res.status(500).json({ error: 'Server error creating payment intent' });
  }
}
