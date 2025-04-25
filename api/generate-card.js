
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { occasion, tone, recipient, sender, customMessage } = req.body;

  if (!occasion || !tone || !recipient || !sender) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const systemPrompt = `
You are a creative AI who writes fun, emotional, or hilarious HTML greeting cards.
Return a JSON object like:
{
  "title": "Card Title",
  "body": "<div style='...'>Styled message body here</div>"
}
Always end the message with the sender name and a footer: 
<small style='color:gray;'>Sent via Greeting Card Genius</small>
You must match the requested tone (funny, savage, romantic, sad, weird, etc.) with matching creativity, length, and energy.
Avoid being too generic or short.
`;

    const userPrompt = `
Write a greeting card with:
- Occasion: ${occasion}
- Tone/Vibe: ${tone}
- Recipient: ${recipient}
- Sender: ${sender}
- Extra Message: ${customMessage || '[none]'}

Make it clever, stylish, humorous, dramatic or touching. Include some HTML formatting and wrap the content with friendly styling and colors if fitting.
Do NOT include code fences. Just the valid JSON output.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.95
    });

    const raw = completion.choices[0].message.content;
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({ error: "Could not extract JSON from OpenAI response." });
    }

    const parsed = JSON.parse(match[0]);
    return res.status(200).json({ title: parsed.title, html: parsed.body });

  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: "Failed to generate card. " + error.message });
  }
}
