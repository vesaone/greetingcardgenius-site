import { generateCardPDF } from './generateCardPDF.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl, messageText, layout = 'email', watermark = false } = req.body;

  if (!messageText) {
    return res.status(400).json({ error: 'Missing messageText' });
  }

  try {
    const pdfBytes = await generateCardPDF({
      imageUrl,
      messageText,
      layout,
      watermark
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="preview.pdf"`);
    res.status(200).send(pdfBytes);
  } catch (err) {
    console.error("❌ PDF generation failed:", err);
    res.status(500).json({ error: "PDF generation error" });
  }
}
