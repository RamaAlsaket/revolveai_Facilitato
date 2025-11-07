// /api/openai.js — Vercel serverless route using OpenRouter (DeepSeek)
// Accepts options from the client so long JSON responses work.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: true, detail: "Method not allowed" });
  }

  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.API_KEY ||
    process.env.OPENROUTER_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: true, detail: "Missing OPENROUTER_API_KEY" });
  }

  // ⬅️ Accept options from the client
  const { prompt, json, maxTokens } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: true, detail: "Missing prompt" });
  }

  // Large JSON needs more than 400 tokens
  const MAX_ALLOWED = 8000;
  const max_tokens = Math.min(Number(maxTokens) || 3200, MAX_ALLOWED);

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://revolveai-facilitato.vercel.app",
        "X-Title": "RevolveAI Facilitator",
      },
      body: JSON.stringify({
        // If deepseek/deepseek-v1 is unavailable on your key, swap to "deepseek/deepseek-chat"
        model: "deepseek/deepseek-v1",
        temperature: 0.2,
        max_tokens,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          {
            role: "system",
            content:
              "You are RevolveAI Facilitator — concise and structured. When asked for JSON, return a single valid JSON object/array with no extra commentary.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!r.ok) {
      let detail;
      try {
        const j = await r.json();
        detail = j?.error?.message || j?.message || JSON.stringify(j);
      } catch {
        detail = await r.text();
      }
      return res.status(r.status).json({ error: true, status: r.status, detail });
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ ok: true, text });
  } catch (e) {
    return res.status(500).json({ error: true, detail: String(e) });
  }
}
