// /api/openai.js — Vercel Serverless API Route for OpenAI
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // You can change this to "gpt-4" or "gpt-3.5-turbo" if you prefer
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: "You are RevolveAI Facilitator – Feasibility Feature Upgrade. Be structured, clear, and friendly.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: true, status: r.status, detail });
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "No text returned";
    res.status(200).json({ ok: true, text });
  } catch (e) {
    res.status(500).json({ error: true, detail: String(e) });
  }
}
