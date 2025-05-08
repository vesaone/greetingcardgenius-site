import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import fetch from 'node-fetch';

export async function generateCardPDF({ imageUrl, messageText, outputPath, layout = 'email', watermark = false }) {
  const pdfDoc = await PDFDocument.create();

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 40;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 14;

  const sanitizeText = (text) =>
    text.replace(/\n/g, " ").replace(/[^\x00-\x7F]/g, "");

  const wrapText = (text, maxWidth) => {
    const words = sanitizeText(text).split(" ");
    let line = "";
    const lines = [];

    for (let word of words) {
      const testLine = line + word + " ";
      const width = font.widthOfTextAtSize(testLine.trim(), fontSize);

      if (width < maxWidth) {
        line = testLine;
      } else {
        lines.push(line.trim());
        line = word + " ";
      }
    }
    if (line) lines.push(line.trim());
    return lines;
  };

  const addWatermark = (page) => {
    if (watermark) {
      page.drawText('PREVIEW ONLY — Purchase to Send', {
        x: margin,
        y: 30,
        size: 10,
        color: rgb(1, 0, 0),
        opacity: 0.5
      });
    }
  };

  if (layout === 'print') {
    // FRONT: image + logo
    const frontPage = pdfDoc.addPage([pageWidth, pageHeight]);

    if (imageUrl) {
      const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
      const embeddedImage = await pdfDoc.embedJpg(imageBytes);
      const imgDims = embeddedImage.scaleToFit(pageWidth - 2 * margin, pageHeight - 2 * margin);

      frontPage.drawImage(embeddedImage, {
        x: (pageWidth - imgDims.width) / 2,
        y: (pageHeight - imgDims.height) / 2,
        width: imgDims.width,
        height: imgDims.height
      });
    }

    frontPage.drawText('greetingcardgenius.com', {
      x: margin,
      y: 20,
      size: 10,
      color: rgb(0.4, 0.4, 0.4)
    });

    addWatermark(frontPage);

    // INSIDE: message
    const messagePage = pdfDoc.addPage([pageWidth, pageHeight]);
    const lines = wrapText(messageText, pageWidth - 2 * margin);
    let y = pageHeight - margin - 40;

    for (const l of lines) {
      messagePage.drawText(l, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1)
      });
      y -= fontSize + 4;
    }

    addWatermark(messagePage);
  } else {
    // EMAIL LAYOUT
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    if (imageUrl) {
      const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
      const embeddedImage = await pdfDoc.embedJpg(imageBytes);
      const imgDims = embeddedImage.scaleToFit(pageWidth - 2 * margin, 300);

      page.drawImage(embeddedImage, {
        x: margin,
        y: pageHeight - margin - imgDims.height,
        width: imgDims.width,
        height: imgDims.height
      });
    }

    // Decorative border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: pageWidth - 40,
      height: pageHeight - 40,
      borderColor: rgb(0.8, 0.8, 1),
      borderWidth: 2
    });

    const lines = wrapText(messageText, pageWidth - 2 * margin);
    let y = pageHeight - margin - (imageUrl ? 320 : 40);

    for (const l of lines) {
      page.drawText(l, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1)
      });
      y -= fontSize + 4;
    }

    addWatermark(page);
  }

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
}
