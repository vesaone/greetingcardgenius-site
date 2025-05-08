import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: '1024x1024'
      })
    });

    const result = await response.json();

    if (result.data && result.data[0].url) {
      return res.status(200).json({ imageUrl: result.data[0].url });
    } else {
      return res.status(500).json({ error: 'Image generation failed', details: result });
    }

  } catch (error) {
    console.error('Image gen error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}