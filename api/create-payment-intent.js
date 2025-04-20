const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { amount, currency, reference } = req.body;

  if (!amount || !currency || !reference) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client_id = process.env.AIRWALLEX_CLIENT_ID;
  const api_key = process.env.AIRWALLEX_API_KEY;
  const base_url = process.env.AIRWALLEX_API_BASE_URL || "https://api.airwallex.com";

  const authToken = Buffer.from(`${client_id}:${api_key}`).toString('base64');

  try {
    const response = await fetch(`${base_url}/api/v1/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        currency,
        merchant_order_id: reference
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || "Airwallex error", details: data });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};
