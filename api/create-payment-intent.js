// File: api/create-payment-intent.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, currency, reference } = req.body;

    // Step 1: Get a bearer token from Airwallex
    const authResponse = await fetch(`${process.env.AIRWALLEX_API_BASE_URL}/api/v1/authentication/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AIRWALLEX_CLIENT_ID,
        api_key: process.env.AIRWALLEX_API_KEY
      })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.token) {
      throw new Error('Failed to authenticate with Airwallex');
    }

    const token = authData.token;

    // Step 2: Create payment intent using the bearer token
    const paymentIntentRes = await fetch(`${process.env.AIRWALLEX_API_BASE_URL}/api/v1/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount,
        currency,
        merchant_order_id: reference,
        request_id: reference
      })
    });

    const paymentIntentData = await paymentIntentRes.json();

    if (!paymentIntentRes.ok) {
      throw new Error(paymentIntentData.message || 'Failed to create payment intent');
    }

    return res.status(200).json(paymentIntentData);
  } catch (error) {
    console.error('Payment intent error:', error);
    return res.status(500).json({ error: error.message });
  }
}
