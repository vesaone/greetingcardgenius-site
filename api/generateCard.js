// /api/generateCard.js

import fetch from 'node-fetch';
import { createCanvas, loadImage } from 'canvas';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { prompt, cardText } = await req.json ? await req.json() : req.body;

  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

  // 1. Call Stability.ai to generate the AI image
  const aiImageResponse = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STABILITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      output_format: "png",
    }),
  });

  const aiImageData = await aiImageResponse.json();
  const aiImageUrl = aiImageData.image; // If their API returns a URL (adjust if needed)

  if (!aiImageUrl) {
    return res.status(500).json({ error: "Failed to generate image." });
  }

  // 2. Stitch the AI image + card text
  const canvas = createCanvas(800, 1200);
  const ctx = canvas.getContext('2d');

  const image = await loadImage(aiImageUrl);
  ctx.drawImage(image, 0, 0, 800, 800); // Image takes top 2/3rds

  ctx.fillStyle = 'black';
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(cardText, 400, 1050, 700); // Text goes lower

  const buffer = canvas.toBuffer('image/png');

  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
}
