const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { amount, currency, reference } = req.body;

  const client_id = process.env.AIRWALLEX_CLIENT_ID;
  const api_key = process.env.AIRWALLEX_API_KEY;

  try {
    // Step 1: Get a bearer token
    const authResponse = await fetch('https://api.airwallex.com/api/v1/authentication/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ client_id, api_key })
    });

    const authData = await authResponse.json();

    if (!authData.token) {
      console.error("Authentication failed:", authData);
      return res.status(401).json({ error: 'Failed to authenticate with Airwallex' });
    }

    // Step 2: Use the token to create a payment intent
    const token = authData.token;

    const intentResponse = await fetch('https://api.airwallex.com/api/v1/pa/payment_intents/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        currency,
        merchant_order_id: reference
      })
    });

    const intentData = await intentResponse.json();

    if (!intentResponse.ok) {
      console.error("Payment intent error:", intentData);
      return res.status(500).json({ error: 'Payment intent creation failed', details: intentData });
    }

    return res.status(200).json(intentData);

  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
};
