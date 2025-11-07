// /api/diag.js — simple diagnostics for OpenRouter setup
export default async function handler(req, res) {
  try {
    const hasEnvVar = Boolean(process.env.OPENROUTER_API_KEY || process.env.API_KEY);
    let upstreamStatus = null;
    let upstreamBody = null;

    if (hasEnvVar) {
      const r = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${
            process.env.OPENROUTER_API_KEY || process.env.API_KEY
          }`,
          "HTTP-Referer": req.headers.origin || "https://revolveai-facilitato.vercel.app",
          "X-Title": "RevolveAI Facilitator",
        },
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
