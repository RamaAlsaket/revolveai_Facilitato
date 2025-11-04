// /api/openai.js — Vercel Serverless API route for OpenRouter (DeepSeek)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key" });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional but recommended:
        "HTTP-Referer": "https://revolveai-facilitato.vercel.app",
        "X-Title": "RevolveAI Facilitator"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        temperature: 0.2, // lower => follows JSON format better
        messages: [
          {
            role: "system",
            content:
              "You are RevolveAI Facilitator — concise, structured, and you return valid JSON when asked."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(r.status).json({ error: true, status: r.status, detail });
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ ok: true, text });
  } catch (e) {
    return res.status(500).json({ error: true, detail: String(e) });
  }
}
