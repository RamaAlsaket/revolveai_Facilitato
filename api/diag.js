// /api/diag.js — simple diagnostics for OpenAI setup
export default async function handler(req, res) {
  try {
    const hasEnvVar = Boolean(process.env.OPENAI_API_KEY);
    let upstreamStatus = null;
    let upstreamBody = null;

    if (hasEnvVar) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "ping" }],
          temperature: 0,
        }),
      });
      upstreamStatus = r.status;
      upstreamBody = await r.text();
    }

    res.status(200).json({
      ok: true,
      hasEnvVar,
      upstreamStatus,
      upstreamBodySnippet: upstreamBody?.slice(0, 200) ?? null,
    });
  } catch (e) {
    res.status(500).json({ ok: false, detail: String(e) });
  }
}
