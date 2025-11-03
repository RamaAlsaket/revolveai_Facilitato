
import { GoogleGenAI, Type } from '@google/genai';
import type { GenerateContentResponse } from '@google/genai';
import { AnalysisFramework } from '../types';
import type { MindMapNode, Milestone, AnalysisData, ActionPlanData, FeasibilityStudyData, FeasibilityInputs } from '../types';
import { FRAMEWORKS } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getFrameworkDefinition = (framework: AnalysisFramework) => {
    const definition = FRAMEWORKS.find(f => f.id === framework);
    if (!definition) {
        throw new Error(`Framework definition for ${framework} not found.`);
    }
    return definition;
};

export const generateRefinementQuestions = async (
  idea: string,
  onNewQuestion: (question: string) => void
): Promise<void> => {
  const prompt = `You are an expert business consultant. Given the following business idea, ask 3-5 insightful questions to clarify the core value proposition, target audience, and key differentiators. The questions must be highly specific to this idea and not generic business questions that could apply to any venture. Output each question on a new line, and only output the questions. Do not number them or use any prefixes.
  
  Business Idea: "${idea}"`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
      },
    });

    let buffer = '';
    for await (const chunk of response) {
      buffer += chunk.text;
      let eolIndex;
      while ((eolIndex = buffer.indexOf('\n')) >= 0) {
        const line = buffer.substring(0, eolIndex).trim();
        buffer = buffer.substring(eolIndex + 1);
        if (line) {
          onNewQuestion(line);
        }
      }
    }
    // Handle any remaining text in the buffer after the loop
    if (buffer.trim()) {
      onNewQuestion(buffer.trim());
    }

  } catch (error) {
    console.error('Error generating refinement questions:', error);
    throw new Error('Failed to generate refinement questions.');
  }
};

export const summarizeIdeaWithAnswers = async (idea: string, questions: string[], answers: string[]): Promise<string> => {
    const qaPairs = questions.map((q, i) => `Q: ${q}\nA: ${answers[i] || 'No answer provided.'}`).join('\n\n');
    const prompt = `You are an expert business consultant. You have an original business idea and a series of clarifying questions and answers. Synthesize all this information into a concise, one-paragraph 'Refined Business Idea' that can be used for further analysis.
    
    Original Idea: "${idea}"
    
    Questions and Answers:
    ${qaPairs}
    
    Synthesize this into a single, compelling paragraph.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error summarizing idea:', error);
        throw new Error('Failed to summarize idea.');
    }
};

export const generateAnalysis = async (idea: string, framework: AnalysisFramework): Promise<AnalysisData> => {
    const frameworkDef = getFrameworkDefinition(framework);
    const prompt = `You are a world-class business strategist. Conduct a detailed ${frameworkDef.name} analysis for the specific business idea provided below. Every point in your analysis must be directly and uniquely tailored to this idea, avoiding generic statements. Provide deep, actionable insights relevant only to this concept.
    
    Business Idea: "${idea}"`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: frameworkDef.schema,
                temperature: 0.5,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AnalysisData;
    } catch (error) {
        console.error(`Error generating ${framework} analysis:`, error);
        throw new Error(`Failed to generate analysis for ${framework}.`);
    }
};

export const generateMindMap = async (idea: string): Promise<MindMapNode> => {
    const prompt = `Create a comprehensive, hierarchical mind map for the business idea: "${idea}". The structure should be a JSON object with a root node named after the idea. It must have these top-level children: 'Value Proposition', 'Market Analysis', 'Product & Service', 'Go-to-Market Strategy', 'Operations', and 'Financials'. Each child must have at least 2-3 relevant, nested children. Aim for 3-4 levels of depth in total. Every node and leaf in this mind map must be specifically about the business idea provided. Do not use generic business terms; instead, populate the map with concepts, strategies, and components that are unique to this specific business.`;

    const mindMapSchema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        children: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              children: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                         children: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    value: { type: Type.NUMBER, description: "A heuristic value, e.g., 10" }
                                },
                                required: ['name', 'value']
                            }
                        }
                    },
                    required: ['name']
                }
              },
            },
            required: ['name']
          }
        }
      },
      required: ['name', 'children']
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: mindMapSchema,
                temperature: 0.6,
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error generating mind map data:', error);
        throw new Error('Failed to generate mind map data.');
    }
};

export const generateMilestones = async (idea: string): Promise<Milestone[]> => {
    const prompt = `Generate a sequence of 5-7 key milestones to develop the business idea: "${idea}". The milestones must be highly specific and tailored directly to this unique idea, avoiding generic business advice. Consider the specific type, size, and goals of this business when creating the timeline. For each milestone, provide a concrete title, a detailed description of what needs to be achieved, and a realistic duration. Present it as a JSON array where each object has an "id", "title", "description", and a suggested "duration" (e.g., "2 weeks", "1 month"). The milestones should be logical and progressive, from validation to launch.`;
    
    const milestoneSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.INTEGER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                duration: { type: Type.STRING },
            },
            required: ['id', 'title', 'description', 'duration']
        }
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: milestoneSchema,
                temperature: 0.7,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error generating milestones:', error);
        throw new Error('Failed to generate milestones.');
    }
};


export const generateActionPlan = async (idea: string): Promise<ActionPlanData> => {
    const prompt = `Generate a detailed, phased action plan to implement the business idea: "${idea}". The action plan must be highly specific and directly applicable to this particular business concept, not a generic template. Create logical phases (e.g., "Phase 1: Research & Validation"). For each phase, provide a detailed description and a list of concrete, actionable steps. Each step must have a specific title, a clear description of the task, and any dependencies on other steps. Present it as a JSON array of phases. Each phase object should have a "phase" title, a "description", and an array of "steps". Each step object should have an "id" (a unique number), "title", "description", and an array of "dependencies" (referencing step titles, can be empty). The plan should cover everything from initial validation to launch and early-stage scaling.`;
    
    const actionPlanSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                phase: { type: Type.STRING },
                description: { type: Type.STRING },
                steps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.INTEGER },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['id', 'title', 'description', 'dependencies']
                    }
                }
            },
            required: ['phase', 'description', 'steps']
        }
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: actionPlanSchema,
                temperature: 0.7,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error generating action plan:', error);
        throw new Error('Failed to generate action plan.');
    }
};

export const generateFeasibilityStudy = async (idea: string, inputs: FeasibilityInputs): Promise<FeasibilityStudyData> => {
    const prompt = `
You are an expert business analyst. Conduct a comprehensive and highly customized Feasibility Study for the specific business idea provided below. Your entire analysis must be grounded in the context of this idea, its potential market, and the user's inputs. Avoid generic advice and focus on providing a real-world viability assessment for THIS concept only.

Business Idea: "${idea}"

Optional User Inputs:
- Estimated Budget: ${inputs.budget || 'Not provided'}
- Team Size: ${inputs.teamSize || 'Not provided'}
- Desired Timeline to Launch: ${inputs.timeline || 'Not provided'}
- Target Market Size: ${inputs.marketSize || 'Not provided'}

Analyze the idea across these six dimensions:
1.  **Market Feasibility**: Evaluate customer demand, target segments, competition, and market growth.
2.  **Technical Feasibility**: Assess required technology, resources, scalability, and implementation complexity.
3.  **Financial Feasibility**: Consider total development/operational cost, potential ROI, and break-even estimate.
4.  **Operational Feasibility**: Analyze workflow, human resources, partnerships, and process efficiency.
5.  **Legal & Ethical Feasibility**: Check for compliance, licensing, AI/data ethics, or privacy constraints.
6.  **Environmental & Social Feasibility**: Evaluate sustainability and community impact.

Your final output must be a JSON object adhering to the provided schema. For each of the six feasibility dimensions, provide a concise 'explanation', a 'score' ('Low', 'Medium', or 'High'), and one or two actionable 'recommendations'. If the user provided financial inputs (at least budget), include a 'costSimulation' object. Conclude with a final 'verdict' and a list of 'finalInsights'.`;

    const feasibilityDimensionSchema = {
        type: Type.OBJECT,
        properties: {
            explanation: { type: Type.STRING, description: "Short explanation of the current feasibility status for this dimension." },
            score: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1-2 actionable recommendations for improvement." }
        },
        required: ['explanation', 'score', 'recommendations']
    };

    const feasibilityStudySchema = {
        type: Type.OBJECT,
        properties: {
            overview: { type: Type.STRING, description: "A concise overview paragraph summarizing the overall feasibility." },
            verdict: { type: Type.STRING, enum: ['Highly Feasible', 'Feasible with Adjustments', 'Needs Revision', 'High Risk / Not Yet Feasible'] },
            market: feasibilityDimensionSchema,
            technical: feasibilityDimensionSchema,
            financial: feasibilityDimensionSchema,
            operational: feasibilityDimensionSchema,
            legalAndEthical: feasibilityDimensionSchema,
            environmentalAndSocial: feasibilityDimensionSchema,
            costSimulation: {
                type: Type.OBJECT,
                properties: {
                    totalProjectedCost: { type: Type.STRING },
                    expectedROI: { type: Type.STRING },
                    breakEvenTimeline: { type: Type.STRING }
                },
                required: ['totalProjectedCost', 'expectedROI', 'breakEvenTimeline']
            },
            finalInsights: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of key insights and next-step recommendations." }
        },
        required: [
            'overview', 'verdict', 'market', 'technical', 'financial',
            'operational', 'legalAndEthical', 'environmentalAndSocial', 'finalInsights'
        ]
    };
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: feasibilityStudySchema,
                temperature: 0.6,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as FeasibilityStudyData;
    } catch (error) {
        console.error('Error generating feasibility study:', error);
        throw new Error('Failed to generate feasibility study.');
    }
};
