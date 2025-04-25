
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
You are an AI assistant that writes greeting cards.
Your output must be a JSON object with:
- "title": A creative greeting card subject line
- "body": The main HTML-formatted message content
Wrap the message in basic <div> styling and add this footer at the end:
<small style='color:gray;'>Sent via Greeting Card Genius</small>

Use the sender's name at the end of the message.
Do not explain the card.
Do not include code fences.
Respond with a valid JSON object only.
`;

    const userPrompt = `
Create a greeting card with:
- Tone: "${tone}"
- Occasion/Theme: "${occasion}"
- Recipient: "${recipient}"
- Sender: "${sender}"
- Extra Message (optional): "${customMessage || '[none]'}"

Make it styled in HTML with subtle background color, friendly font, and tone-matching colors if appropriate.
Be clever and authentic in tone.
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

    return res.status(200).json({ title: parsed.title, html: parsed.body });
  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: "Failed to generate card. " + error.message });
  }
}
