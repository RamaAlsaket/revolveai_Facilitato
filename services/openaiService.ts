// src/services/openaiService.ts
// Converted from the original Gemini service to OpenAI.
// IMPORTANT: No process.env or @google/genai on the client.
// All LLM calls go through /api/openai to keep your key on the server.

import type { GenerateContentResponse } from '@google/genai'; // kept only for type parity; not used
import { AnalysisFramework } from '../types';
import type {
  MindMapNode,
  Milestone,
  AnalysisData,
  ActionPlanData,
  FeasibilityStudyData,
  FeasibilityInputs,
} from '../types';
import { FRAMEWORKS } from '../constants';


// --- Helper: call your serverless route that proxies to OpenAI ---
async function callOpenAI(prompt: string, expectsJson = false): Promise<string> {
  const res = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, expectsJson }), // send flag to backend
  });
  const data = await res.json();
  if (!res.ok || data?.error) throw new Error(data?.detail || 'OpenRouter request failed');
  return (data.text || '').toString().trim();
}

// --- Helper: keep parity with original "getFrameworkDefinition" ---
const getFrameworkDefinition = (framework: AnalysisFramework) => {
  const definition = FRAMEWORKS.find(f => f.id === framework);
  if (!definition) {
    throw new Error(`Framework definition for ${framework} not found.`);
  }
  return definition;
};


/** Extract a JSON array of strings from a model response safely. */
function extractJsonArray(text: string): string[] {
  // strip code fences if present
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  // Try direct parse first
  try {
    const maybe = JSON.parse(cleaned);
    if (Array.isArray(maybe) && maybe.every(q => typeof q === "string")) {
      return maybe;
    }
  } catch (_) {
    /* ignore and try fallback */
  }

  // Fallback: find first [...] block and parse that
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const arr = JSON.parse(match[0]);
      if (Array.isArray(arr) && arr.every(q => typeof q === "string")) {
        return arr;
      }
    } catch (_) {/* ignore */}
  }

  // Last resort: degrade to line split (filters junk)
  return cleaned
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !/^q\d*\s*[:\-]/i.test(s)) // drop "Q1:" style
    .slice(0, 5);
}

// ------------------------------------------------------------------
// 1) generateRefinementQuestions (keeps same signature + behavior)
// ------------------------------------------------------------------
export const generateRefinementQuestions = async (
  idea: string,
  onNewQuestion: (question: string) => void
): Promise<void> => {
  const prompt = `
You are an expert venture strategist.

Task: Generate 3–5 highly specific clarification questions to refine this single business idea.
- Questions must be tailored to THIS idea only (no generic startup questions).
- Focus on value proposition, target segment, differentiation, feasibility, and measurable outcomes as relevant.
- Keep each question short and clear (<= 180 characters).
- DO NOT number questions. DO NOT add commentary.

Output FORMAT (STRICT):
Return ONLY a JSON array of strings, no keys, no markdown, no code fences, no prose.
Example:
[
  "Question one?",
  "Question two?",
  "Question three?"
]

Business Idea:
"${idea}"
`.trim();

  try {
    const text = await callOpenAI(prompt);
    const arr = extractJsonArray(text);
    arr.forEach(q => q && onNewQuestion(q));
  } catch (error) {
    console.error('Error generating refinement questions:', error);
    throw new Error('Failed to generate refinement questions.');
  }
};

// ------------------------------------------------------------------
// 2) summarizeIdeaWithAnswers (same output: one paragraph)
// ------------------------------------------------------------------
export const summarizeIdeaWithAnswers = async (
  idea: string,
  questions: string[],
  answers: string[]
): Promise<string> => {
  const qaPairs = questions
    .map((q, i) => `Q: ${q}\nA: ${answers[i] || 'No answer provided.'}`)
    .join('\n\n');

  const prompt = `You are an expert business consultant. You have an original business idea and Q&A clarifications. Synthesize a single concise paragraph as a "Refined Business Idea" (no headings, just the paragraph).

Original Idea: "${idea}"

Questions and Answers:
${qaPairs}

Output: one compelling paragraph, tailored to this idea.`;

  try {
    const text = await callOpenAI(prompt);
    return text;
  } catch (error) {
    console.error('Error summarizing idea:', error);
    throw new Error('Failed to summarize idea.');
  }
};

// ------------------------------------------------------------------
// 3) generateAnalysis (returns JSON adhering to framework schema)
// ------------------------------------------------------------------
export const generateAnalysis = async (
  idea: string,
  framework: AnalysisFramework
): Promise<AnalysisData> => {
  const frameworkDef = getFrameworkDefinition(framework);

  const prompt = `You are a world-class business strategist. Conduct a detailed ${frameworkDef.name} analysis for the specific business idea below. Every point must be uniquely tailored to this idea (no generic content).

Business Idea: "${idea}"

Return JSON ONLY that matches this schema (do not include markdown or commentary):
${JSON.stringify(frameworkDef.schema, null, 2)}`;

  try {
    const jsonText = await callOpenAI(prompt, true);
    return JSON.parse(jsonText) as AnalysisData;
  } catch (error) {
    console.error(`Error generating ${framework} analysis:`, error);
    throw new Error(`Failed to generate analysis for ${framework}.`);
  }
};

// ------------------------------------------------------------------
// 4) generateMindMap (returns JSON MindMapNode like original)
// ------------------------------------------------------------------
export const generateMindMap = async (idea: string): Promise<MindMapNode> => {
  const prompt = `Create a comprehensive, hierarchical mind map for the business idea: "${idea}".
Return JSON ONLY with this structure (no markdown, no commentary):
{
  "name": "${idea}",
  "children": [
    { "name": "Value Proposition", "children": [ { "name": "...", "children": [ { "name": "...", "value": 10 } ] } ] },
    { "name": "Market Analysis", "children": [ ... ] },
    { "name": "Product & Service", "children": [ ... ] },
    { "name": "Go-to-Market Strategy", "children": [ ... ] },
    { "name": "Operations", "children": [ ... ] },
    { "name": "Financials", "children": [ ... ] }
  ]
}
Rules:
- 3–4 levels deep overall.
- Every node specific to this idea.
- The leaf nodes at the deepest level should include a numeric "value" field (e.g., 10).`;

  try {
    const jsonText = await callOpenAI(prompt, true);
    return JSON.parse(jsonText) as MindMapNode;
  } catch (error) {
    console.error('Error generating mind map data:', error);
    throw new Error('Failed to generate mind map data.');
  }
};

// ------------------------------------------------------------------
// 5) generateMilestones (returns JSON array; same schema as original)
// ------------------------------------------------------------------
export const generateMilestones = async (idea: string): Promise<Milestone[]> => {
  const prompt = `Generate a sequence of 5–7 key milestones to develop the business idea: "${idea}".
Each milestone must be specific to this idea (no generic advice). Provide JSON array ONLY:
[
  { "id": 1, "title": "…", "description": "…", "duration": "2 weeks" }
]`;

  try {
    const jsonText = await callOpenAI(prompt, true);
    return JSON.parse(jsonText) as Milestone[];
  } catch (error) {
    console.error('Error generating milestones:', error);
    throw new Error('Failed to generate milestones.');
  }
};

// ------------------------------------------------------------------
// 6) generateActionPlan (returns JSON array of phases like original)
// ------------------------------------------------------------------
export const generateActionPlan = async (idea: string): Promise<ActionPlanData> => {
  const prompt = `Generate a detailed, phased action plan to implement the business idea: "${idea}".
Each phase includes "phase", "description", and "steps" (with "id", "title", "description", "dependencies": [] if any).
Return JSON array ONLY (no markdown), e.g.:
[
  {
    "phase": "Phase 1: Research & Validation",
    "description": "…",
    "steps": [
      { "id": 1, "title": "…", "description": "…", "dependencies": [] },
      { "id": 2, "title": "…", "description": "…", "dependencies": ["…"] }
    ]
  }
]`;

  try {
    const jsonText = await callOpenAI(prompt,true);
    return JSON.parse(jsonText) as ActionPlanData;
  } catch (error) {
    console.error('Error generating action plan:', error);
    throw new Error('Failed to generate action plan.');
  }
};

// ------------------------------------------------------------------
// 7) generateFeasibilityStudy (returns JSON object like original)
// ------------------------------------------------------------------
export const generateFeasibilityStudy = async (
  idea: string,
  inputs: FeasibilityInputs
): Promise<FeasibilityStudyData> => {
  const prompt = `
You are an expert business analyst. Conduct a comprehensive, highly customized Feasibility Study for THIS specific idea only. Avoid generic advice.

Business Idea: "${idea}"

Optional User Inputs:
- Estimated Budget: ${inputs.budget || 'Not provided'}
- Team Size: ${inputs.teamSize || 'Not provided'}
- Desired Timeline to Launch: ${inputs.timeline || 'Not provided'}
- Target Market Size: ${inputs.marketSize || 'Not provided'}

Analyze and return JSON ONLY with this exact structure (no markdown):
{
  "overview": "A concise overview paragraph.",
  "verdict": "Highly Feasible" | "Feasible with Adjustments" | "Needs Revision" | "High Risk / Not Yet Feasible",
  "market": { "explanation": "…", "score": "Low" | "Medium" | "High", "recommendations": ["…"] },
  "technical": { "explanation": "…", "score": "Low" | "Medium" | "High", "recommendations": ["…"] },
  "financial": { "explanation": "…", "score": "Low" | "Medium" | "High", "recommendations": ["…"] },
  "operational": { "explanation": "…", "score": "Low" | "Medium" | "High", "recommendations": ["…"] },
  "legalAndEthical": { "explanation": "…", "score": "Low" | "Medium" | "High", "recommendations": ["…"] },
  "environmentalAndSocial": { "explanation": "…", "score": "Low" | "Medium" | "High", "recommendations": ["…"] },
  "costSimulation": { "totalProjectedCost": "…", "expectedROI": "…", "breakEvenTimeline": "…" },
  "finalInsights": ["…", "…"]
}`;

  try {
    const jsonText = await callOpenAI(prompt, true);
    return JSON.parse(jsonText) as FeasibilityStudyData;
  } catch (error) {
    console.error('Error generating feasibility study:', error);
    throw new Error('Failed to generate feasibility study.');
  }
};
