import { sendCard } from '../utils/sendCard.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, subject, templateName, customMessage, senderName, inlineHtml } = req.body;

  if (!toEmail || !subject || (!templateName && !inlineHtml)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await sendCard({
      toEmail,
      subject,
      templateName,
      customMessage,
      senderName,
      inlineHtml
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
