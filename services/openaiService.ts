// src/services/openaiService.ts
// Replaces the old Gemini code — now uses OpenAI's API safely through your Vercel env var.

export async function runFeasibility(prompt: string): Promise<string> {
  try {
    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.detail || "OpenAI request failed");
    }

    return data.text as string;
  } catch (error) {
    console.error("Error running OpenAI Feasibility:", error);
    throw error;
  }
}
