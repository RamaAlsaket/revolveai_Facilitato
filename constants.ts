
import { AnalysisFramework } from './types';
import { Type } from '@google/genai';

interface FrameworkDefinition {
  id: AnalysisFramework;
  name: string;
  description: string;
  schema: any;
}

export const FRAMEWORKS: FrameworkDefinition[] = [
  {
    id: AnalysisFramework.SWOT,
    name: 'SWOT Analysis',
    description: 'Strengths, Weaknesses, Opportunities, Threats.',
    schema: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['strengths', 'weaknesses', 'opportunities', 'threats']
    }
  },
  {
    id: AnalysisFramework.PESTLE,
    name: 'PESTLE Analysis',
    description: 'Political, Economic, Social, Technological, Legal, Environmental.',
     schema: {
      type: Type.OBJECT,
      properties: {
        political: { type: Type.ARRAY, items: { type: Type.STRING } },
        economic: { type: Type.ARRAY, items: { type: Type.STRING } },
        social: { type: Type.ARRAY, items: { type: Type.STRING } },
        technological: { type: Type.ARRAY, items: { type: Type.STRING } },
        legal: { type: Type.ARRAY, items: { type: Type.STRING } },
        environmental: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['political', 'economic', 'social', 'technological', 'legal', 'environmental']
    }
  },
  {
    id: AnalysisFramework.PortersFiveForces,
    name: "Porter's Five Forces",
    description: 'Analyze competitive forces within an industry.',
    schema: {
        type: Type.OBJECT,
        properties: {
            threatOfNewEntrants: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Factors affecting how easily new competitors can enter the market." },
            bargainingPowerOfBuyers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Factors affecting the power of customers to drive down prices." },
            bargainingPowerOfSuppliers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Factors affecting the power of suppliers to drive up prices." },
            threatOfSubstituteProducts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Factors affecting the likelihood of customers finding a different way of doing what your business does." },
            industryRivalry: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Factors affecting the intensity of competition among existing players." }
        },
        required: ["threatOfNewEntrants", "bargainingPowerOfBuyers", "bargainingPowerOfSuppliers", "threatOfSubstituteProducts", "industryRivalry"]
    }
  },
  {
    id: AnalysisFramework.BusinessModelCanvas,
    name: 'Business Model Canvas',
    description: 'A strategic management template for developing new or documenting existing business models.',
    schema: {
        type: Type.OBJECT,
        properties: {
            keyPartners: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
            valuePropositions: { type: Type.ARRAY, items: { type: Type.STRING } },
            customerRelationships: { type: Type.ARRAY, items: { type: Type.STRING } },
            customerSegments: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyResources: { type: Type.ARRAY, items: { type: Type.STRING } },
            channels: { type: Type.ARRAY, items: { type: Type.STRING } },
            costStructure: { type: Type.ARRAY, items: { type: Type.STRING } },
            revenueStreams: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["keyPartners", "keyActivities", "valuePropositions", "customerRelationships", "customerSegments", "keyResources", "channels", "costStructure", "revenueStreams"]
    }
  },
  {
    id: AnalysisFramework.SCAMPER,
    name: 'SCAMPER',
    description: 'A creative thinking technique to help innovate on existing products, services, or ideas.',
    schema: {
        type: Type.OBJECT,
        properties: {
            substitute: { type: Type.ARRAY, items: { type: Type.STRING } },
            combine: { type: Type.ARRAY, items: { type: Type.STRING } },
            adapt: { type: Type.ARRAY, items: { type: Type.STRING } },
            modify: { type: Type.ARRAY, items: { type: Type.STRING } },
            putToAnotherUse: { type: Type.ARRAY, items: { type: Type.STRING } },
            eliminate: { type: Type.ARRAY, items: { type: Type.STRING } },
            reverse: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["substitute", "combine", "adapt", "modify", "putToAnotherUse", "eliminate", "reverse"]
    }
  },
  {
    id: AnalysisFramework.ValuePropositionCanvas,
    name: 'Value Proposition Canvas',
    description: 'Map your product features to customer needs.',
    schema: {
      type: Type.OBJECT,
      properties: {
        gains: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Benefits customers expect or desire." },
        pains: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Negative emotions, risks, or costs customers experience." },
        customerJobs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What customers are trying to get done." },
        gainCreators: { type: Type.ARRAY, items: { type: Type.STRING }, description: "How your product creates customer gains." },
        painRelievers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "How your product alleviates customer pains." },
        productsAndServices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What you offer." },
      },
      required: ['gains', 'pains', 'customerJobs', 'gainCreators', 'painRelievers', 'productsAndServices']
    }
  },
  {
    id: AnalysisFramework.RiskAnalysisMatrix,
    name: 'Risk Analysis Matrix',
    description: 'Identify and prioritize risks by impact and probability.',
    schema: {
        type: Type.OBJECT,
        properties: {
            risks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        risk: { type: Type.STRING, description: "Description of the potential risk." },
                        probability: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                        impact: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                        mitigation: { type: Type.STRING, description: "Strategy to mitigate the risk." }
                    },
                    required: ["risk", "probability", "impact", "mitigation"]
                }
            }
        },
        required: ["risks"]
    }
  }
];
