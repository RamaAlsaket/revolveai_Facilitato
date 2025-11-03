// /api/diag.js — diagnostics (safe)
// DOES NOT leak your key; returns only booleans/status.

export default async function handler(req, res) {
  try {
    const hasVar = Boolean(process.env.OPENAI_API_KEY);
    let upstreamStatus = null;
    let upstreamBody = null;

    if (hasVar) {
      // Do a tiny "ping" call to OpenAI to confirm the key works.
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
      upstreamBody = await r.text(); // text so we see error strings plainly
    }

    res.status(200).json({
      ok: true,
      hasEnvVar: hasVar,
      upstreamStatus,      // e.g., 200, 400, 401
      upstreamBodySnippet: upstreamBody?.slice(0, 200) ?? null, // small peek only
    });
  } catch (e) {
    res.status(500).json({ ok: false, detail: String(e) });
  }
}
