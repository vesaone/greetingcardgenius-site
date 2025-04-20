const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { amount, currency, reference } = req.body;

    const client_id = process.env.AIRWALLEX_CLIENT_ID;
    const api_key = process.env.AIRWALLEX_API_KEY;
    const base_url = process.env.AIRWALLEX_API_BASE_URL || 'https://api.airwallex.com';

    if (!client_id || !api_key) {
      return res.status(500).json({ error: 'Airwallex credentials not found in environment' });
    }

    // 🔐 Step 1: Get Bearer Token
    const authResponse = await fetch(`${base_url}/api/v1/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': client_id,
        'x-api-key': api_key
      }
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return res.status(authResponse.status).json({
        error: 'Failed to authenticate with Airwallex',
        details: authData
      });
    }

    const token = authData.token;

    // 💳 Step 2: Create Payment Intent
    const paymentResponse = await fetch(`${base_url}/api/v1/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        request_id: `req_${Date.now()}`,
        amount,
        currency,
        merchant_order_id: reference
      })
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      return res.status(paymentResponse.status).json({
        error: 'Failed to create payment intent',
        details: paymentData
      });
    }

    return res.status(200).json(paymentData);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
};
