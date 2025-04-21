// /api/payment-webhook.mjs
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const expectedSecret = process.env.AIRWALLEX_WEBHOOK_SECRET;
  const signature = req.headers['x-signature'];
  const rawBody = await getRawBody(req);

  // Verify signature
  const crypto = await import('crypto');
  const hmac = crypto.createHmac('sha256', expectedSecret);
  hmac.update(rawBody);
  const expectedSignature = hmac.digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(rawBody);

  if (event.type === 'payment_intent.succeeded') {
    const emailData = event.data?.metadata;
    if (emailData) {
      // Resend integration to send card
      await fetch(`${process.env.VERCEL_URL || 'https://greetingcardgenius.com.au'}/api/send-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
    }
  }

  return res.status(200).json({ success: true });
}

// Raw body parser (needed for signature verification)
import getRawBodyLib from 'raw-body';
function getRawBody(req) {
  return getRawBodyLib(req, {
    encoding: 'utf-8',
    length: req.headers['content-length'],
  });
}
