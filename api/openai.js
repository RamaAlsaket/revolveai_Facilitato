// /api/openai.js — Vercel Serverless API route for OpenRouter (DeepSeek via OpenRouter)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Accept either OPENROUTER_API_KEY or API_KEY (fallback)
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.API_KEY ||
    process.env.OPENAI_API_KEY; // last-ditch fallback if someone reused the name

  if (!apiKey) {
    return res.status(500).json({ error: true, detail: "Missing OPENROUTER_API_KEY" });
  }

  const { prompt, model: clientModel } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: true, detail: "Missing prompt" });
  }

  // Use a safer, short, plain-text friendly free model
  // (The R1 reasoning models often prepend <think> blocks and can exceed limits)
  const model = clientModel || "deepseek/deepseek-chat:free";

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",

        // OpenRouter recommends these (set Referer to your deployed origin)
        "HTTP-Referer": req.headers.origin || "https://revolveai-facilitato.vercel.app",
        "X-Title": "RevolveAI Facilitator",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are RevolveAI Facilitator. Be concise and return VALID JSON when asked. Do not wrap outputs in markdown fences. Never include <think> blocks in your final answer.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const textDetail = await r.text(); // preserve raw detail for debugging
    if (!r.ok) {
      // Bubble up exact upstream error so you see it in Network tab
      return res.status(r.status).json({ error: true, status: r.status, detail: textDetail });
    }

    const data = JSON.parse(textDetail);
    let text = data?.choices?.[0]?.message?.content ?? "";

    // Strip <think> ... </think> if present
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    return res.status(200).json({ ok: true, text });
  } catch (e) {
    return res.status(500).json({ error: true, detail: String(e) });
  }
}
