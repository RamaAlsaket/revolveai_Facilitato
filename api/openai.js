// /api/openai.js — Vercel Serverless API route for OpenAI
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set in environment variables" });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",  // safe default; change if you have access to another
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are RevolveAI Facilitator – Feasibility Feature Upgrade. Be structured, clear, and friendly.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      // Surface underlying OpenAI error to the client so you can see it in the UI
      return res.status(r.status).json({ error: "Upstream error", status: r.status, detail });
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ ok: true, text });
  } catch (e) {
    return res.status(500).json({ error: true, detail: String(e) });
  }
}
