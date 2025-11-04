export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey)
      return res.status(500).json({ error: "OPENROUTER_API_KEY is not set" });

    // ✅ DeepSeek R1 (free) model
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are RevolveAI Facilitator — structured, concise, and always output valid JSON when asked.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(r.status).json({ error: "Upstream error", detail });
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ ok: true, text });
  } catch (e) {
    return res.status(500).json({ error: true, detail: String(e) });
  }
}
