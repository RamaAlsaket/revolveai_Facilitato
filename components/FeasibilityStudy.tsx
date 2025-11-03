
import React, { useState } from 'react';
import type { FeasibilityStudyData, FeasibilityInputs, FeasibilityVerdict, FeasibilityDimension } from '../types';
import Loader from './Loader';
import { FeasibilityStudyIcon } from './icons';

interface FeasibilityStudyProps {
    studyData: FeasibilityStudyData | null;
    fetchData: (inputs: FeasibilityInputs) => void;
    isLoading: boolean;
    loadingMessage: string;
    businessIdea: string;
}

const ScoreBadge: React.FC<{ score: 'Low' | 'Medium' | 'High' }> = ({ score }) => {
    const colorClasses = {
        'Low': 'bg-red-500/30 text-red-200 border-red-500/50',
        'Medium': 'bg-yellow-500/30 text-yellow-200 border-yellow-500/50',
        'High': 'bg-green-500/30 text-green-200 border-green-500/50',
    };
    return (
        <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${colorClasses[score]}`}>
            {score}
        </span>
    );
};

const VerdictDisplay: React.FC<{ verdict: FeasibilityVerdict }> = ({ verdict }) => {
    const verdictConfig = {
        'Highly Feasible': {
            icon: '✅',
            color: 'text-green-400',
            bgColor: 'bg-green-500/20'
        },
        'Feasible with Adjustments': {
            icon: '⚙️',
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/20'
        },
        'Needs Revision': {
            icon: '⚠️',
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/20'
        },
        'High Risk / Not Yet Feasible': {
            icon: '❌',
            color: 'text-red-400',
            bgColor: 'bg-red-500/20'
        },
    };
    const config = verdictConfig[verdict];

    return (
        <div className={`p-4 rounded-lg flex items-center justify-center space-x-4 ${config.bgColor}`}>
            <span className="text-3xl">{config.icon}</span>
            <h3 className={`text-2xl font-bold ${config.color}`}>{verdict}</h3>
        </div>
    );
}

const DimensionCard: React.FC<{ title: string; data: FeasibilityDimension }> = ({ title, data }) => (
    <div className="bg-black/20 p-6 rounded-lg shadow-lg flex flex-col">
        <div className="flex justify-between items-start mb-3">
            <h4 className="text-xl font-bold text-cyan-200">{title}</h4>
            <ScoreBadge score={data.score} />
        </div>
        <p className="text-gray-300 mb-4 flex-grow">{data.explanation}</p>
        <div>
            <h5 className="font-semibold text-white mb-2">Recommendations:</h5>
            <ul className="space-y-2 text-sm list-disc list-inside text-gray-400">
                {data.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
        </div>
    </div>
);


const FeasibilityStudy: React.FC<FeasibilityStudyProps> = ({ studyData, fetchData, isLoading, loadingMessage, businessIdea }) => {
    const [inputs, setInputs] = useState<FeasibilityInputs>({
        budget: '',
        teamSize: '',
        timeline: '',
        marketSize: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(inputs);
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader />
                    <p className="mt-2 text-cyan-200">{loadingMessage || 'Generating Feasibility Study...'}</p>
                </div>
            </div>
        );
    }

    if (!studyData) {
        return (
            <div className="w-full max-w-3xl mx-auto p-4 animate-fade-in">
                <div className="bg-black/20 p-8 rounded-xl shadow-2xl backdrop-blur-lg">
                    <div className="text-center mb-6">
                        <FeasibilityStudyIcon className="w-12 h-12 mx-auto text-neon-blue"/>
                        <h2 className="text-3xl font-bold mt-2 text-white">Feasibility Study</h2>
                        <p className="text-cyan-200">Provide optional details to improve the analysis.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-300">Estimated Budget ($)</label>
                            <input type="text" name="budget" id="budget" value={inputs.budget} onChange={handleInputChange} className="mt-1 w-full p-2 bg-white/10 rounded-lg border-2 border-transparent focus:border-neon-blue focus:ring-0 focus:outline-none transition-colors duration-200 text-white" placeholder="e.g., 50,000" />
                        </div>
                        <div>
                            <label htmlFor="teamSize" className="block text-sm font-medium text-gray-300">Team Size</label>
                            <input type="text" name="teamSize" id="teamSize" value={inputs.teamSize} onChange={handleInputChange} className="mt-1 w-full p-2 bg-white/10 rounded-lg border-2 border-transparent focus:border-neon-blue focus:ring-0 focus:outline-none transition-colors duration-200 text-white" placeholder="e.g., 3 co-founders" />
                        </div>
                        <div>
                            <label htmlFor="timeline" className="block text-sm font-medium text-gray-300">Desired Launch Timeline</label>
                            <input type="text" name="timeline" id="timeline" value={inputs.timeline} onChange={handleInputChange} className="mt-1 w-full p-2 bg-white/10 rounded-lg border-2 border-transparent focus:border-neon-blue focus:ring-0 focus:outline-none transition-colors duration-200 text-white" placeholder="e.g., 6 months" />
                        </div>
                         <div>
                            <label htmlFor="marketSize" className="block text-sm font-medium text-gray-300">Target Market Size (Optional)</label>
                            <input type="text" name="marketSize" id="marketSize" value={inputs.marketSize} onChange={handleInputChange} className="mt-1 w-full p-2 bg-white/10 rounded-lg border-2 border-transparent focus:border-neon-blue focus:ring-0 focus:outline-none transition-colors duration-200 text-white" placeholder="e.g., 100,000 potential users" />
                        </div>
                        <button type="submit" className="mt-6 w-full flex justify-center items-center bg-neon-blue text-deep-blue font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-105">
                            Generate Study
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
    const { overview, verdict, costSimulation, finalInsights, ...dimensions } = studyData;

    return (
        <div className="w-full max-w-6xl mx-auto p-4 animate-fade-in space-y-8">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-white">Feasibility Study Report</h2>
            </div>
            
            <VerdictDisplay verdict={verdict} />

            <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Feasibility Overview</h3>
                <p className="text-lg text-gray-300 bg-black/20 p-6 rounded-lg">{overview}</p>
            </div>
            
            <div>
                 <h3 className="text-2xl font-semibold text-white mb-4">Feasibility Breakdown</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DimensionCard title="Market" data={dimensions.market} />
                    <DimensionCard title="Technical" data={dimensions.technical} />
                    <DimensionCard title="Financial" data={dimensions.financial} />
                    <DimensionCard title="Operational" data={dimensions.operational} />
                    <DimensionCard title="Legal & Ethical" data={dimensions.legalAndEthical} />
                    <DimensionCard title="Environmental & Social" data={dimensions.environmentalAndSocial} />
                 </div>
            </div>

            {costSimulation && (
                <div>
                    <h3 className="text-2xl font-semibold text-white mb-4">Cost Simulation</h3>
                    <div className="bg-black/20 p-6 rounded-lg overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/20 text-cyan-200">
                                    <th className="p-3">Metric</th>
                                    <th className="p-3">Estimate</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-3 font-semibold">Total Projected Cost</td>
                                    <td className="p-3">{costSimulation.totalProjectedCost}</td>
                                </tr>
                                <tr className="bg-black/20">
                                    <td className="p-3 font-semibold">Expected ROI</td>
                                    <td className="p-3">{costSimulation.expectedROI}</td>
                                </tr>
                                 <tr>
                                    <td className="p-3 font-semibold">Break-even Timeline</td>
                                    <td className="p-3">{costSimulation.breakEvenTimeline}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Insights & Next Steps</h3>
                <div className="bg-black/20 p-6 rounded-lg">
                    <ul className="space-y-3 list-disc list-inside text-gray-300">
                        {finalInsights.map((insight, i) => <li key={i}>{insight}</li>)}
                    </ul>
                </div>
            </div>

            <div className="text-center text-cyan-200 pt-8">
                <p>✨ RevolveAI Facilitator — helping you turn your idea into a structured, data-driven, and achievable reality.</p>
            </div>

        </div>
    );
};

export default FeasibilityStudy;
