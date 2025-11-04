// /api/diag.js — simple diagnostics for OpenRouter (DeepSeek)
export default async function handler(req, res) {
  try {
    const hasEnvVar = Boolean(process.env.OPENROUTER_API_KEY);
    let upstreamStatus = null;
    let upstreamBody = null;

    if (hasEnvVar) {
      // Ping OpenRouter directly to verify the key works
      const r = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      });
      upstreamStatus = r.status;
      upstreamBody = await r.text();
    }

    res.status(200).json({
      ok: true,
      hasEnvVar,
      upstreamStatus,
      upstreamBodySnippet: upstreamBody?.slice(0, 300) ?? null,
    });
  } catch (e) {
    res.status(500).json({ ok: false, detail: String(e) });
  }
}
