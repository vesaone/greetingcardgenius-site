import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';

const __dirname = path.resolve();
const cardDir = path.join(__dirname, 'cards');
const previewDir = path.join(__dirname, 'previews');

const htmlFiles = (await fs.readdir(cardDir)).filter(f => f.endsWith('-card.html'));

const browser = await puppeteer.launch();
const page = await browser.newPage();

for (const file of htmlFiles) {
  const filePath = path.join(cardDir, file);
  const html = await fs.readFile(filePath, 'utf-8');

  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Optional: Watermark
  await page.addStyleTag({ content: `
    body::after {
      content: "Preview Only";
      position: absolute;
      top: 50%;
      left: 50%;
      font-size: 2em;
      color: rgba(200, 0, 0, 0.3);
      transform: translate(-50%, -50%) rotate(-20deg);
      pointer-events: none;
    }
  `});

  const screenshotPath = path.join(previewDir, file.replace('-card.html', '.jpg'));
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`✅ Generated: ${screenshotPath}`);
}

await browser.close();
