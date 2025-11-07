// /api/openai.js — Vercel serverless route using OpenRouter (with model fallbacks)
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

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: true, detail: "Missing prompt" });
  }

  // Ask text-only capable models first; avoid r1 (adds <think> blocks)
  const MODEL_CANDIDATES = [
    "deepseek/deepseek-chat",   // usually available
    "deepseek/deepseek-v3",     // good general model
    "deepseek/deepseek-v1",     // older but text-only
    "openrouter/auto"           // last-resort router
  ];

  const baseHeaders = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    // Required for OpenRouter free tier:
    "HTTP-Referer": "https://revolveai-facilitato.vercel.app",
    "X-Title": "RevolveAI Facilitator"
  };

  let lastDetail = null;

  for (const model of MODEL_CANDIDATES) {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: maxTokens ?? (json ? 3000 : 600),   // <— key change
          response_format: json ? { type: "json_object" } : undefined,
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
        // Capture upstream error detail; continue to next model on 404/400 "no endpoints"
        let detail;
        try {
          const j = await r.json();
          detail = j?.error?.message || j?.message || JSON.stringify(j);
        } catch {
          detail = await r.text();
        }

        lastDetail = `Model ${model} failed: ${detail}`;
        // OpenRouter says "No endpoints found..." for models not enabled; try next
        if (r.status === 404 || (typeof detail === "string" && /no endpoints/i.test(detail))) {
          continue;
        }
        // Other errors: bubble up
        return res.status(r.status).json({ error: true, status: r.status, detail: lastDetail });
      }

      const data = await r.json();
      const text = data?.choices?.[0]?.message?.content ?? "";
      return res.status(200).json({ ok: true, text, modelUsed: model });
    } catch (e) {
      lastDetail = `Model ${model} threw: ${String(e)}`;
      // try next model
      continue;
    }
  }

  // If we got here, all candidates failed
  return res.status(502).json({
    error: true,
    detail: lastDetail || "All model candidates failed"
  });
}
