import { sendCard } from '@/utils/sendCard.js'; // adjust import based on your structure

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, subject, templateName, customMessage, senderName } = req.body;

  if (!toEmail || !subject || !templateName || !customMessage) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await sendCard({ toEmail, subject, templateName, customMessage, senderName });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
