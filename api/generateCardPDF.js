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
    // Front cover (image + logo)
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

    // Logo + site footer
    frontPage.drawText('greetingcardgenius.com', {
      x: margin,
      y: 20,
      size: 10,
      color: rgb(0.4, 0.4, 0.4)
    });

    addWatermark(frontPage);

    // Inside page with message
    const messagePage = pdfDoc.addPage([pageWidth, pageHeight]);
    const lines = font.splitTextIntoLines(messageText, fontSize, pageWidth - 2 * margin);
    messagePage.drawText(lines.join('\n'), {
      x: margin,
      y: pageHeight - margin - fontSize,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
      lineHeight: 20
    });

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

    // Decorative border (email layout only)
    page.drawRectangle({
      x: 20,
      y: 20,
      width: pageWidth - 40,
      height: pageHeight - 40,
      borderColor: rgb(0.8, 0.8, 1),
      borderWidth: 2
    });

    const words = messageText.split(" ");
let line = "";
const lines = [];

for (let i = 0; i < words.length; i++) {
  const testLine = line + words[i] + " ";
  const testWidth = font.widthOfTextAtSize(testLine.trim(), fontSize);

  if (testWidth < pageWidth - 2 * margin) {
    line = testLine;
  } else {
    lines.push(line.trim());
    line = words[i] + " ";
  }
}
if (line) lines.push(line.trim());

// Draw wrapped lines
let textY = pageHeight - margin - (imageUrl ? 320 : 40);
for (const l of lines) {
  page.drawText(l, {
    x: margin,
    y: textY,
    size: fontSize,
    font,
    color: rgb(0.1, 0.1, 0.1)
  });
  textY -= fontSize + 4; // adjust line spacing
}


    addWatermark(page);
  }

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
}