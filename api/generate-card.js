
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
You are an AI assistant that writes greeting cards based on user input.
Return a JSON object with a creative card title and full HTML-formatted message body.
Match the tone requested. Use humorous, poetic, weird, savage, or heartfelt vibes depending on the tone.
Always end the message with an appropriate sign-off based on tone.
Add "<small style='color:gray;'>Sent via Greeting Card Genius</small>" at the bottom.
Only return a valid JSON object. Do not explain it. Do not include code fences.
`;

    const userPrompt = `
Write a unique greeting card for the following:
Occasion/Theme: "${occasion}"
Tone/Vibe: "${tone}"
Recipient: "${recipient}"
Sender: "${sender}"
Include this custom message if provided: "${customMessage || '[none]'}"
Respond ONLY with a JSON object like: {"title": "Card Title", "html": "<p>HTML Body</p>"}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.9
    });

    const raw = completion.choices[0].message.content;

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(500).json({ error: "Could not extract JSON from OpenAI response." });
    }

    const parsed = JSON.parse(match[0]);
    return res.status(200).json({ title: parsed.title, html: parsed.html });

  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: "Failed to generate card. " + error.message });
  }
}
