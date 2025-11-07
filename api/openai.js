// /api/openai.js — Vercel serverless route using OpenRouter (DeepSeek Chat: free)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: true, detail: "Method not allowed" });
  }

  // Accept any of these names so your env doesn't block you
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.API_KEY ||
    process.env.OPENROUTER_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: true, detail: "Missing OPENROUTER_API_KEY" });
  }
  console.log("Using API Key:", !!apiKey);
  console.log("Prompt length:", prompt.length);

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: true, detail: "Missing prompt" });
  }

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // These MUST match your deployed origin & a title (OpenRouter requires this for free tier)
        "HTTP-Referer": "https://revolveai-facilitato.vercel.app",
        "X-Title": "RevolveAI Facilitator"
      },
      body: JSON.stringify({
        // IMPORTANT: use text-only free model (no <think> blocks)
        model: "deepseek/deepseek-v1",
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You are RevolveAI Facilitator — be concise. When asked for lists, return plain text lines (no JSON/markdown)."
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
