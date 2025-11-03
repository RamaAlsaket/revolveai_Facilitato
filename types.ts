
export enum View {
  IDEA_INPUT = 'IDEA_INPUT',
  REFINEMENT = 'REFINEMENT',
  ANALYSIS = 'ANALYSIS',
  MIND_MAP = 'MIND_MAP',
  MILESTONES = 'MILESTONES',
  ACTION_PLAN = 'ACTION_PLAN',
  FEASIBILITY_STUDY = 'FEASIBILITY_STUDY',
}

export enum AnalysisFramework {
  SWOT = 'SWOT',
  PESTLE = 'PESTLE',
  PortersFiveForces = "Porter's Five Forces",
  BusinessModelCanvas = 'Business Model Canvas',
  SCAMPER = 'SCAMPER',
  ValuePropositionCanvas = 'Value Proposition Canvas',
  RiskAnalysisMatrix = 'Risk Analysis Matrix',
}

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface PESTLEData {
  political: string[];
  economic: string[];
  social: string[];
  technological: string[];
  legal: string[];
  environmental: string[];
}

export interface PortersFiveForcesData {
  threatOfNewEntrants: string[];
  bargainingPowerOfBuyers: string[];
  bargainingPowerOfSuppliers: string[];
  threatOfSubstituteProducts: string[];
  industryRivalry: string[];
}

export interface BusinessModelCanvasData {
  keyPartners: string[];
  keyActivities: string[];
  valuePropositions: string[];
  customerRelationships: string[];
  customerSegments: string[];
  keyResources: string[];
  channels: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface SCAMPERData {
  substitute: string[];
  combine: string[];
  adapt: string[];
  modify: string[];
  putToAnotherUse: string[];
  eliminate: string[];
  reverse: string[];
}

export interface ValuePropositionCanvasData {
    gains: string[];
    pains: string[];
    customerJobs: string[];
    gainCreators: string[];
    painRelievers: string[];
    productsAndServices: string[];
}

export interface Risk {
    risk: string;
    probability: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    mitigation: string;
}

export interface RiskAnalysisMatrixData {
    risks: Risk[];
}


export type AnalysisData = SWOTData | PESTLEData | PortersFiveForcesData | BusinessModelCanvasData | SCAMPERData | ValuePropositionCanvasData | RiskAnalysisMatrixData;

export interface AnalysisResult {
    [key: string]: AnalysisData;
}

export interface MindMapNode {
  name: string;
  children?: MindMapNode[];
  value?: number;
}

export interface Milestone {
  id: number;
  title: string;
  description: string;
  duration: string;
}

export interface ActionStep {
    id: number;
    title: string;
    description: string;
    dependencies: string[];
}

export interface ActionPhase {
    phase: string;
    description: string;
    steps: ActionStep[];
}

export type ActionPlanData = ActionPhase[];

// Feasibility Study Types
export interface FeasibilityDimension {
    explanation: string;
    score: 'Low' | 'Medium' | 'High';
    recommendations: string[];
}

export interface CostSimulation {
    totalProjectedCost: string;
    expectedROI: string;
    breakEvenTimeline: string;
}

export type FeasibilityVerdict = 'Highly Feasible' | 'Feasible with Adjustments' | 'Needs Revision' | 'High Risk / Not Yet Feasible';

export interface FeasibilityStudyData {
    overview: string;
    verdict: FeasibilityVerdict;
    market: FeasibilityDimension;
    technical: FeasibilityDimension;
    financial: FeasibilityDimension;
    operational: FeasibilityDimension;
    legalAndEthical: FeasibilityDimension;
    environmentalAndSocial: FeasibilityDimension;
    costSimulation?: CostSimulation;
    finalInsights: string[];
}

export interface FeasibilityInputs {
    budget: string;
    teamSize: string;
    timeline: string;
    marketSize: string;
}
