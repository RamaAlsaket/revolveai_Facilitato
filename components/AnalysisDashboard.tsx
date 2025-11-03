
import React, { useState, useEffect } from 'react';
import { AnalysisFramework } from '../types';
import type { AnalysisResult, AnalysisData, SWOTData, PESTLEData, PortersFiveForcesData, BusinessModelCanvasData, SCAMPERData, ValuePropositionCanvasData, RiskAnalysisMatrixData } from '../types';
import { FRAMEWORKS } from '../constants';
import Loader from './Loader';

interface AnalysisDashboardProps {
  results: AnalysisResult | null;
  fetchAnalysis: (framework: AnalysisFramework) => void;
  isLoading: boolean;
  loadingMessage: string;
  businessIdea: string;
}

const AnalysisCard: React.FC<{ title: string, items: string[], className?: string }> = ({ title, items, className }) => (
    <div className={`bg-white/10 p-4 rounded-lg flex-1 min-w-[200px] ${className}`}>
        <h4 className="font-bold text-neon-blue mb-2 capitalize">{title.replace(/([A-Z])/g, ' $1').trim()}</h4>
        <ul className="space-y-2 text-sm">
            {items && items.length > 0 
              ? items.map((item, index) => <li key={index} className="before:content-['•'] before:mr-2 before:text-neon-blue">{item}</li>)
              : <li>No items found.</li>
            }
        </ul>
    </div>
);

const RiskTable: React.FC<{ data: RiskAnalysisMatrixData }> = ({ data }) => {
    const getColor = (level: 'Low' | 'Medium' | 'High') => {
        switch (level) {
            case 'Low': return 'bg-green-500/30 text-green-200';
            case 'Medium': return 'bg-yellow-500/30 text-yellow-200';
            case 'High': return 'bg-red-500/30 text-red-200';
        }
    };
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/10 text-cyan-200 uppercase">
                    <tr>
                        <th className="p-3">Risk</th>
                        <th className="p-3">Probability</th>
                        <th className="p-3">Impact</th>
                        <th className="p-3">Mitigation Strategy</th>
                    </tr>
                </thead>
                <tbody>
                    {data.risks.map((r, i) => (
                        <tr key={i} className="border-b border-white/10">
                            <td className="p-3">{r.risk}</td>
                            <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${getColor(r.probability)}`}>{r.probability}</span></td>
                            <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${getColor(r.impact)}`}>{r.impact}</span></td>
                            <td className="p-3">{r.mitigation}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const AnalysisDisplay: React.FC<{ data: AnalysisData, framework: AnalysisFramework }> = ({ data, framework }) => {
    switch(framework) {
        case AnalysisFramework.SWOT:
            const swot = data as SWOTData;
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnalysisCard title="Strengths" items={swot.strengths} />
                    <AnalysisCard title="Weaknesses" items={swot.weaknesses} />
                    <AnalysisCard title="Opportunities" items={swot.opportunities} />
                    <AnalysisCard title="Threats" items={swot.threats} />
                </div>
            );
        case AnalysisFramework.PESTLE:
            const pestle = data as PESTLEData;
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnalysisCard title="Political" items={pestle.political} />
                    <AnalysisCard title="Economic" items={pestle.economic} />
                    <AnalysisCard title="Social" items={pestle.social} />
                    <AnalysisCard title="Technological" items={pestle.technological} />
                    <AnalysisCard title="Legal" items={pestle.legal} />
                    <AnalysisCard title="Environmental" items={pestle.environmental} />
                </div>
            );
         case AnalysisFramework.PortersFiveForces:
            const porters = data as PortersFiveForcesData;
            return (
                <div className="space-y-4">
                    <AnalysisCard title="Threat of New Entrants" items={porters.threatOfNewEntrants} />
                    <AnalysisCard title="Bargaining Power of Buyers" items={porters.bargainingPowerOfBuyers} />
                    <AnalysisCard title="Bargaining Power of Suppliers" items={porters.bargainingPowerOfSuppliers} />
                    <AnalysisCard title="Threat of Substitute Products" items={porters.threatOfSubstituteProducts} />
                    <AnalysisCard title="Industry Rivalry" items={porters.industryRivalry} />
                </div>
            );
        case AnalysisFramework.BusinessModelCanvas:
            const bmc = data as BusinessModelCanvasData;
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(bmc).map(([key, value]) => (
                        <AnalysisCard key={key} title={key} items={value} />
                    ))}
                </div>
            );
        case AnalysisFramework.SCAMPER:
            const scamper = data as SCAMPERData;
             return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(scamper).map(([key, value]) => (
                        <AnalysisCard key={key} title={key} items={value} />
                    ))}
                </div>
            );
        case AnalysisFramework.ValuePropositionCanvas:
            const vpc = data as ValuePropositionCanvasData;
            return (
                 <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <h3 className="text-xl font-bold text-center text-cyan-200">Customer Profile</h3>
                        <AnalysisCard title="Customer Jobs" items={vpc.customerJobs} />
                        <AnalysisCard title="Pains" items={vpc.pains} />
                        <AnalysisCard title="Gains" items={vpc.gains} />
                    </div>
                    <div className="flex-1 space-y-4">
                        <h3 className="text-xl font-bold text-center text-cyan-200">Value Map</h3>
                         <AnalysisCard title="Products & Services" items={vpc.productsAndServices} />
                         <AnalysisCard title="Pain Relievers" items={vpc.painRelievers} />
                         <AnalysisCard title="Gain Creators" items={vpc.gainCreators} />
                    </div>
                 </div>
            );
        case AnalysisFramework.RiskAnalysisMatrix:
            return <RiskTable data={data as RiskAnalysisMatrixData} />;
        default: return <p>Analysis display not implemented for this framework.</p>;
    }
};


const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ results, fetchAnalysis, isLoading, loadingMessage, businessIdea }) => {
  const [selectedFramework, setSelectedFramework] = useState<AnalysisFramework>(AnalysisFramework.SWOT);
  
  const handleSelectFramework = (framework: AnalysisFramework) => {
    setSelectedFramework(framework);
    if (!results?.[framework] && businessIdea) {
      fetchAnalysis(framework);
    }
  };

  useEffect(() => {
    // This effect ensures that if the component mounts for a new idea,
    // it fetches the default SWOT analysis if it's not already present.
    if (businessIdea && !results?.[AnalysisFramework.SWOT]) {
      fetchAnalysis(AnalysisFramework.SWOT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessIdea]);

  const currentData = results?.[selectedFramework];
  const isCurrentlyLoading = isLoading && !currentData;

  return (
    <div className="w-full flex-grow flex flex-col animate-fade-in">
        <div className="bg-black/20 backdrop-blur-lg p-4 rounded-t-xl shadow-lg no-print">
            <div className="flex flex-wrap items-center gap-2">
                {FRAMEWORKS.map(fw => (
                    <button 
                        key={fw.id}
                        onClick={() => handleSelectFramework(fw.id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${selectedFramework === fw.id ? 'bg-neon-blue text-deep-blue shadow-md' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        {fw.name}
                    </button>
                ))}
            </div>
        </div>
        <div className="bg-black/10 p-6 rounded-b-xl flex-grow shadow-inner min-h-[400px] flex flex-col">
            {isCurrentlyLoading ? (
                <div className="w-full h-full flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <Loader />
                        <p className="mt-2 text-cyan-200">{loadingMessage || `Generating ${selectedFramework} analysis...`}</p>
                    </div>
                </div>
            ) : currentData ? (
                <div className="animate-fade-in">
                    <h3 className="text-2xl font-bold mb-4 text-white">{FRAMEWORKS.find(f => f.id === selectedFramework)?.name}</h3>
                    <AnalysisDisplay data={currentData} framework={selectedFramework} />
                </div>
            ) : (
                 <div className="w-full h-full flex-grow flex items-center justify-center">
                    <div className="text-center text-cyan-200 py-10">
                        <p>Select a framework to begin analysis.</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default AnalysisDashboard;
