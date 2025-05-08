import path from 'path';
import { fileURLToPath } from 'url';
import { generateCardPDF } from './generateCardPDF.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { messageText, imageUrl } = req.body;

  const timestamp = Date.now();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const outputPath = path.join(__dirname, `../public/cards/generated/card-${timestamp}.pdf`);
  const publicUrl = `/cards/generated/card-${timestamp}.pdf`;

  try {
    await generateCardPDF({
      imageUrl,
      messageText,
      outputPath
    });

    return res.status(200).json({
      success: true,
      cardUrl: publicUrl
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return res.status(500).json({ success: false, error: "Failed to generate PDF." });
  }
}
