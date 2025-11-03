
import React, { useState, useCallback } from 'react';
import { View, AnalysisFramework } from './types';
import type { MindMapNode, Milestone, AnalysisResult, ActionPlanData, FeasibilityStudyData, FeasibilityInputs } from './types';
import Header from './components/Header';
import IdeaInput from './components/IdeaInput';
import RefinementChat from './components/RefinementChat';
import AnalysisDashboard from './components/AnalysisDashboard';
import Milestones from './components/Milestones';
import MindMap from './components/MindMap';
import ActionPlan from './components/ActionPlan';
import FeasibilityStudy from './components/FeasibilityStudy';
import { generateAnalysis, generateMindMap, generateMilestones, generateRefinementQuestions, summarizeIdeaWithAnswers, generateActionPlan, generateFeasibilityStudy } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.IDEA_INPUT);
  const [businessIdea, setBusinessIdea] = useState<string>('');
  const [refinedIdea, setRefinedIdea] = useState<string>('');
  const [refinementQuestions, setRefinementQuestions] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlanData | null>(null);
  const [feasibilityStudy, setFeasibilityStudy] = useState<FeasibilityStudyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleIdeaSubmit = async (idea: string) => {
    if (!idea) return;
    setIsLoading(true);
    setLoadingMessage('Thinking of insightful questions...');
    setError(null);
    setBusinessIdea(idea);
    setRefinedIdea('');
    setAnalysisResults(null);
    setMindMapData(null);
    setMilestones(null);
    setActionPlan(null);
    setFeasibilityStudy(null);
    setRefinementQuestions([]);
    
    setView(View.REFINEMENT);

    try {
      await generateRefinementQuestions(idea, (newQuestion) => {
        setRefinementQuestions(prevQuestions => [...prevQuestions, newQuestion]);
      });
    } catch (err) {
      setError('Failed to generate refinement questions. Please try again.');
      console.error(err);
      setView(View.IDEA_INPUT);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefinementSubmit = async (answers: string[]) => {
    setIsLoading(true);
    setLoadingMessage('Refining your idea...');
    setError(null);
    try {
      const summary = await summarizeIdeaWithAnswers(businessIdea, refinementQuestions, answers);
      setRefinedIdea(summary);

      setLoadingMessage('Generating initial analysis...');
      const initialAnalysis = await generateAnalysis(summary, AnalysisFramework.SWOT);
      setAnalysisResults({ [AnalysisFramework.SWOT]: initialAnalysis });
      setView(View.ANALYSIS);
    } catch (err) {
      setError('Failed to process answers and generate analysis. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeIdea = refinedIdea || businessIdea;

  const fetchAnalysis = useCallback(async (framework: AnalysisFramework) => {
    if (!activeIdea) return;
    setIsLoading(true);
    setLoadingMessage(`Generating ${framework} analysis...`);
    setError(null);
    try {
      const result = await generateAnalysis(activeIdea, framework);
      setAnalysisResults(prev => ({ ...prev, [framework]: result }));
    } catch (err) {
      setError(`Failed to generate ${framework} analysis. Please try again.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeIdea]);

  const fetchMindMap = useCallback(async () => {
    if (!activeIdea) return;
    setIsLoading(true);
    setLoadingMessage('Generating Mind Map...');
    setError(null);
    try {
      const data = await generateMindMap(activeIdea);
      setMindMapData(data);
    } catch (err) {
      setError('Failed to generate mind map. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeIdea]);

  const fetchMilestones = useCallback(async () => {
    if (!activeIdea) return;
    setIsLoading(true);
    setLoadingMessage('Generating Milestones...');
    setError(null);
    try {
      const data = await generateMilestones(activeIdea);
      setMilestones(data);
    } catch (err) {
      setError('Failed to generate milestones. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeIdea]);

  const fetchActionPlan = useCallback(async () => {
    if (!activeIdea) return;
    setIsLoading(true);
    setLoadingMessage('Generating Action Plan...');
    setError(null);
    try {
      const data = await generateActionPlan(activeIdea);
      setActionPlan(data);
    } catch (err) {
      setError('Failed to generate action plan. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeIdea]);

  const fetchFeasibilityStudy = useCallback(async (inputs: FeasibilityInputs) => {
    if (!activeIdea) return;
    setIsLoading(true);
    setLoadingMessage('Generating Feasibility Study...');
    setError(null);
    try {
      const data = await generateFeasibilityStudy(activeIdea, inputs);
      setFeasibilityStudy(data);
    } catch (err) {
      setError('Failed to generate feasibility study. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeIdea]);

  const renderContent = () => {
    switch (view) {
      case View.REFINEMENT:
        return <RefinementChat 
                  questions={refinementQuestions}
                  onSubmit={handleRefinementSubmit}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                />;
      case View.ANALYSIS:
        return <AnalysisDashboard 
                  results={analysisResults} 
                  fetchAnalysis={fetchAnalysis} 
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  businessIdea={activeIdea}
               />;
      case View.MIND_MAP:
        return <MindMap 
                  data={mindMapData} 
                  fetchData={fetchMindMap} 
                  isLoading={isLoading} 
                  loadingMessage={loadingMessage}
                  businessIdea={activeIdea}
               />;
      case View.MILESTONES:
        return <Milestones 
                  milestones={milestones} 
                  fetchData={fetchMilestones} 
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  businessIdea={activeIdea}
               />;
      case View.ACTION_PLAN:
        return <ActionPlan
                  plan={actionPlan}
                  fetchData={fetchActionPlan}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  businessIdea={activeIdea}
                />;
      case View.FEASIBILITY_STUDY:
        return <FeasibilityStudy
                  studyData={feasibilityStudy}
                  fetchData={fetchFeasibilityStudy}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  businessIdea={activeIdea}
                />;
      case View.IDEA_INPUT:
      default:
        return <IdeaInput onSubmit={handleIdeaSubmit} isLoading={isLoading} />;
    }
  };
  
  const resetApp = () => {
    setBusinessIdea('');
    setRefinedIdea('');
    setView(View.IDEA_INPUT);
    setAnalysisResults(null);
    setMindMapData(null);
    setMilestones(null);
    setActionPlan(null);
    setFeasibilityStudy(null);
    setError(null);
  };

  const showFullNav = view !== View.IDEA_INPUT && view !== View.REFINEMENT;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-start to-dark-end text-white font-sans flex flex-col">
      <Header 
        currentView={view} 
        setView={setView} 
        hasIdea={!!businessIdea} 
        onLogoClick={resetApp}
        showFullNav={showFullNav}
      />
      <main className="flex-grow flex flex-col items-center p-4 sm:p-6 md:p-8">
        {error && (
            <div className="bg-red-500/80 text-white p-4 rounded-lg mb-4 max-w-6xl w-full text-center">
              <strong>Error:</strong> {error}
            </div>
        )}
        {activeIdea && view !== View.IDEA_INPUT && (
          <div className="w-full max-w-6xl mb-6 p-4 bg-black/20 rounded-lg shadow-lg">
            <h2 className="text-sm font-light text-cyan-200 uppercase tracking-wider">{refinedIdea ? 'Refined Idea' : 'Original Idea'}</h2>
            <p className="text-lg text-white mt-1">{activeIdea}</p>
          </div>
        )}
        {view === View.IDEA_INPUT && !businessIdea && (
           <div className="text-center mb-8 animate-fade-in-up">
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">RevolveAI Facilitator</h1>
             <p className="mt-4 text-lg text-cyan-200 max-w-2xl">Transform your business concept into a concrete plan.</p>
           </div>
        )}
        <div className="w-full max-w-6xl flex-grow flex flex-col printable">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
