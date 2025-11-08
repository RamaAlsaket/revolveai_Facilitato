// /api/openai.js — Vercel serverless route using OpenRouter (DeepSeek-friendly)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: true, detail: "Method not allowed" });
  }

  // Accept several env names so deployment doesn’t get stuck
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.API_KEY ||
    process.env.OPENROUTER_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: true, detail: "Missing OPENROUTER_API_KEY" });
  }

  // Read the body FIRST (do not log prompt before this)
  const { prompt, json: wantJson, maxTokens } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: true, detail: "Missing prompt" });
  }

  // Choose a model that’s available on free tier (no <think> blocks)
  // deepseek-v1 works well for JSON; fallback list is optional.
  const MODEL = "deepseek/deepseek-v1";

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Required by OpenRouter free tier:
        "HTTP-Referer": "https://revolveai-facilitato.vercel.app",
        "X-Title": "RevolveAI Facilitator"
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: typeof maxTokens === "number" ? maxTokens : 400, // small by default
        // Ask for strict JSON only when the client needs it
        ...(wantJson ? { response_format: { type: "json_object" } } : {}),
        messages: [
          {
            role: "system",
            content:
              "You are RevolveAI Facilitator — concise and structured. When asked for JSON, return a single valid JSON object/array with no extra commentary."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!r.ok) {
      // Bubble up readable upstream detail
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
