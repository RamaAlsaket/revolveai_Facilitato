// /api/openai.js — Vercel Serverless API route for OpenRouter (DeepSeek chat)

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // IMPORTANT: Make sure the name matches what you set in Vercel
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENROUTER_API_KEY" });
    }

    // Vercel Node serverless parses JSON into req.body
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // Use a chat model (NOT R1) — R1 adds <think> blocks that break your UI
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Recommended (helps with OpenRouter rate limits):
        "HTTP-Referer": "https://revolveai-facilitato.vercel.app",
        "X-Title": "RevolveAI Facilitator"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat:free",
        temperature: 0.2, // low temp for structured outputs
        messages: [
          {
            role: "system",
            content:
              "You are RevolveAI Facilitator — be concise, structured, and follow formatting instructions exactly. Do NOT include markdown code fences or <think> blocks."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const raw = await r.text();

    // If upstream fails, surface the reason back to the client
    if (!r.ok) {
      return res.status(r.status).json({
        error: true,
        status: r.status,
        detail: raw.slice(0, 800) // send first part of error text for debugging
      });
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(502).json({
        error: true,
        status: 502,
        detail: "Upstream returned non-JSON response",
        snippet: raw.slice(0, 800)
      });
    }

    const text = data?.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ ok: true, text });
  } catch (e) {
    return res.status(500).json({ error: true, detail: String(e) });
  }
}
