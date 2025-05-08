import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import fetch from 'node-fetch';

export async function generateCardPDF({ imageUrl, messageText, outputPath }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size

  const { width, height } = page.getSize();

  if (imageUrl) {
    const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
    const image = await pdfDoc.embedJpg(imageBytes);
    const imgDims = image.scaleToFit(width, height / 2);
    page.drawImage(image, {
      x: (width - imgDims.width) / 2,
      y: height - imgDims.height - 40,
      width: imgDims.width,
      height: imgDims.height,
    });
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 14;
  const maxTextWidth = width - 80;

  page.drawText(messageText, {
    x: 40,
    y: height / 2 - 60,
    size: fontSize,
    font: font,
    color: rgb(0.1, 0.1, 0.1),
    maxWidth: maxTextWidth,
    lineHeight: 20
  });

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
}
