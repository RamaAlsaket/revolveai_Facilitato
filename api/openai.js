// /api/openai.js — Vercel Serverless API route for OpenRouter (DeepSeek)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key" });
  }

  const { prompt, expectsJson } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  // ✅ JSON sanitizer helper: finds the first valid JSON object/array in the text
  function extractJson(text) {
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (arrMatch) return arrMatch[0];
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) return objMatch[0];
    return text;
  }

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
        model: "deepseek/deepseek-chat:free", // ✅ better JSON compliance
        temperature: expectsJson ? 0.1 : 0.2,
        messages: [
          {
            role: "system",
            content: expectsJson
              ? "Return ONLY valid JSON. No markdown, no code fences, no commentary."
              : "You are RevolveAI Facilitator — concise, structured, and clear.",
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
    let text = data?.choices?.[0]?.message?.content ?? "";

    if (expectsJson) {
      text = extractJson(text);
      try {
        JSON.parse(text); // Validate JSON
      } catch {
        console.warn("⚠️ Model returned invalid JSON, passing raw text back.");
      }
    }

    return res.status(200).json({ ok: true, text });
  } catch (e) {
    return res.status(500).json({ error: true, detail: String(e) });
  }
}
