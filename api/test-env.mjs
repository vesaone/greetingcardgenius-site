// /api/test-env.mjs
export default async function handler(req, res) {
    return res.status(200).json({
      AIRWALLEX_API_KEY: process.env.AIRWALLEX_API_KEY ? '✔️ Loaded' : '❌ Missing'
    });
  }
  