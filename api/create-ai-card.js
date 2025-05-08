import path from 'path';
import { fileURLToPath } from 'url';
import { generateCardPDF } from './generateCardPDF.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl, messageText, layout = 'email', watermark = false, id } = req.body;

  if (!messageText || !id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pdfName = `card-${id}.pdf`;
  const outputPath = `/tmp/card-preview-${id}.pdf`;
  const publicUrl = `/cards/generated/${pdfName}`;

  try {
    await generateCardPDF({
      imageUrl,
      messageText,
      outputPath,
      layout,
      watermark
    });

    const pdfBytes = await fs.readFile(outputPath);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="card.pdf"`);
      res.send(pdfBytes);

    return res.status(200).json({ success: true, cardUrl: publicUrl });
  } catch (err) {
    console.error("❌ PDF generation failed:", err);
    return res.status(500).json({ success: false, error: 'PDF generation error' });
  }
}