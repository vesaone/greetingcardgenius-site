
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
You are a creative AI that writes emotionally charged or hilarious HTML greeting cards.
Only respond with a JSON object in this format:
{
  "title": "Card Title",
  "body": "<div style='background:#fffbe6;padding:20px;border-radius:10px;font-family:sans-serif;color:#222'> ... </div>"
}
The body must include:
- a well-styled <div> wrapping the content
- a strong creative message using the given tone
- an appropriate closing line including the sender's name
- a final line: <small style='color:gray;'>Sent via Greeting Card Genius</small>
Never include Markdown or code fences.
Respond with valid JSON only.
`;

    const userPrompt = `
Write a greeting card for the following:

Occasion/Theme: ${occasion}
Tone/Vibe: ${tone}
Recipient: ${recipient}
Sender: ${sender}
Extra Message: ${customMessage || '[none]'}

Make it dramatic, weird, sweet, savage, or funny — depending on the tone. Be bold. Match the mood. Always include closing with the sender name and footer.
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

    // Ensure footer and sender are included (fallback)
    const footer = "<small style='color:gray;'>Sent via Greeting Card Genius</small>";
    let html = parsed.body;
    if (!html.includes(footer)) {
      html += `<br />${footer}`;
    }
    if (!html.toLowerCase().includes(sender.toLowerCase())) {
      html += `<br /><p style='font-style:italic;'>– ${sender}</p>`;
    }

    return res.status(200).json({ title: parsed.title, html });

  } catch (error) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: "Failed to generate card. " + error.message });
  }
}
