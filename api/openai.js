// /api/openai.js — Vercel Serverless API route for OpenRouter (DeepSeek)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Read ONLY OPENROUTER_API_KEY to keep it unambiguous
  const apiKey = process.env.API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: true, detail: "Missing OPENROUTER_API_KEY" });
  }

  const { prompt, model } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: true, detail: "Missing prompt" });
  }

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // OpenRouter recommends these headers
        "HTTP-Referer": "https://revolveai-facilitato.vercel.app",
        "X-Title": "RevolveAI Facilitator",
      },
      body: JSON.stringify({
        // pick one; or allow client to pass model in req.body.model
        model: "deepseek/deepseek-chat:free",   // << was deepseek-r1:free
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "You are RevolveAI Facilitator — concise, structured, and you return valid JSON when asked. Avoid any markdown unless explicitly requested.",
          },
          { role: "user", content: prompt },
        ],
      }),
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
