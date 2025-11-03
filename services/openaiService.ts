// src/services/openaiService.ts
// Client-side service that calls our serverless API route /api/openai.
// IMPORTANT: No process.env here. No @google/genai imports.

import type { AnalysisFramework } from '../types';
import type {
  MindMapNode,
  Milestone,
  AnalysisData,
  ActionPlanData,
  FeasibilityStudyData,
  FeasibilityInputs,
} from '../types';
import { FRAMEWORKS } from '../constants';

// Helper to call the server route
async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok || (data && data.error)) {
    throw new Error(data?.detail || 'OpenAI request failed');
  }
  return (data.text as string).trim();
}

// 1) generateRefinementQuestions
export async function generateRefinementQuestions(
  idea: string,
  onNewQuestion: (q: string) => void
): Promise<void> {
  const prompt = `You are an expert business consultant. Given the idea below, output 3–5 highly specific clarifying questions (one per line, no numbering).

Idea: "${idea}"`;
  const out = await callOpenAI(prompt);
  out
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach(onNewQuestion);
}

// 2) summarizeIdeaWithAnswers
export async function summarizeIdeaWithAnswers(
  idea: string,
  questions: string[],
  answers: string[]
): Promise<string> {
  const qaPairs = questions
    .map((q, i) => `Q: ${q}\nA: ${answers[i] || 'No answer provided.'}`)
    .join('\n\n');

  const prompt = `Synthesize the refined business idea into one concise paragraph.

Original Idea: "${idea}"

Q&A:
${qaPairs}

Output: one paragraph only.`;
  return await callOpenAI(prompt);
}

// 3) generateAnalysis (expects JSON)
export async function generateAnalysis(
  idea: string,
  framework: AnalysisFramework
): Promise<AnalysisData> {
  const def = FRAMEWORKS.find((f) => f.id === framework);
  if (!def) throw new Error(\`Framework definition for \${framework} not found.\`);

  const prompt = `Conduct a detailed ${def.name} analysis for this idea: "${idea}".
Return JSON ONLY matching this shape (no extra text, no markdown):
${JSON.stringify(def.schema, null, 2)}
Rules:
- Every point must be specific to this idea.
- Output pure JSON only.`;

  const jsonText = await callOpenAI(prompt);
  try {
    return JSON.parse(jsonText) as AnalysisData;
  } catch (e) {
    console.error('parse analysis failed:', jsonText);
    throw new Error(\`Failed to parse ${def.name} JSON.\`);
  }
}

// 4) generateMindMap (expects JSON)
export async function generateMindMap(idea: string): Promise<MindMapNode> {
  const prompt = `Create a hierarchical mind map for: "${idea}".
Return JSON ONLY with this shape:
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
Rules: 3–4 levels deep; every node specific to this idea; JSON only.`;
  const jsonText = await callOpenAI(prompt);
  try {
    return JSON.parse(jsonText) as MindMapNode;
  } catch (e) {
    console.error('parse mind map failed:', jsonText);
    throw new Error('Failed to parse mind map JSON.');
  }
}

// 5) generateMilestones (expects JSON array)
export async function generateMilestones(idea: string): Promise<Milestone[]> {
  const prompt = `Generate 5–7 sequential milestones for: "${idea}".
Return JSON array ONLY:
[
  { "id": 1, "title": "...", "description": "...", "duration": "2 weeks" }
]`;
  const jsonText = await callOpenAI(prompt);
  try {
    return JSON.parse(jsonText) as Milestone[];
  } catch (e) {
    console.error('parse milestones failed:', jsonText);
    throw new Error('Failed to parse milestones JSON.');
  }
}

// 6) generateActionPlan (expects JSON array of phases)
export async function generateActionPlan(idea: string): Promise<ActionPlanData> {
  const prompt = `Create a phased action plan for: "${idea}".
Return JSON array ONLY:
[
  {
    "phase": "Phase 1: Research & Validation",
    "description": "...",
    "steps": [
      { "id": 1, "title": "...", "description": "...", "dependencies": [] },
      { "id": 2, "title": "...", "description": "...", "dependencies": ["..."] }
    ]
  }
]`;
  const jsonText = await callOpenAI(prompt);
  try {
    return JSON.parse(jsonText) as ActionPlanData;
  } catch (e) {
    console.error('parse action plan failed:', jsonText);
    throw new Error('Failed to parse action plan JSON.');
  }
}

// 7) generateFeasibilityStudy (expects JSON object)
export async function generateFeasibilityStudy(
  idea: string,
  inputs: FeasibilityInputs
): Promise<FeasibilityStudyData> {
  const prompt = `Create a feasibility study for: "${idea}".

Inputs:
- Budget: ${inputs.budget || 'Not provided'}
- Team Size: ${inputs.teamSize || 'Not provided'}
- Timeline: ${inputs.timeline || 'Not provided'}
- Market Size: ${inputs.marketSize || 'Not provided'}

Return JSON ONLY with this exact shape:
{
  "overview": "...",
  "verdict": "Highly Feasible" | "Feasible with Adjustments" | "Needs Revision" | "High Risk / Not Yet Feasible",
  "market": { "explanation": "...", "score": "Low|Medium|High", "recommendations": ["..."] },
  "technical": { "explanation": "...", "score": "Low|Medium|High", "recommendations": ["..."] },
  "financial": { "explanation": "...", "score": "Low|Medium|High", "recommendations": ["..."] },
  "operational": { "explanation": "...", "score": "Low|Medium|High", "recommendations": ["..."] },
  "legalAndEthical": { "explanation": "...", "score": "Low|Medium|High", "recommendations": ["..."] },
  "environmentalAndSocial": { "explanation": "...", "score": "Low|Medium|High", "recommendations": ["..."] },
  "costSimulation": { "totalProjectedCost": "...", "expectedROI": "...", "breakEvenTimeline": "..." },
  "finalInsights": ["...", "..."]
}
Rules: JSON only, no markdown; tailor every line to this idea.`;

  const jsonText = await callOpenAI(prompt);
  try {
    return JSON.parse(jsonText) as FeasibilityStudyData;
  } catch (e) {
    console.error('parse feasibility failed:', jsonText);
    throw new Error('Failed to parse feasibility JSON.');
  }
}
