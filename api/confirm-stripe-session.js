export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { sessionId } = req.body;
  
    // You could verify the Stripe session here (optional), but for now just unlock download
    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }
  
    return res.status(200).json({ success: true });
  }
  