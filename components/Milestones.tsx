
import React, { useEffect } from 'react';
import type { Milestone } from '../types';
import Loader from './Loader';
import { MilestoneIcon } from './icons';

interface MilestonesProps {
    milestones: Milestone[] | null;
    fetchData: () => void;
    isLoading: boolean;
    loadingMessage: string;
    businessIdea: string;
}

const Milestones: React.FC<MilestonesProps> = ({ milestones, fetchData, isLoading, loadingMessage, businessIdea }) => {

    useEffect(() => {
        if (businessIdea && !milestones) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessIdea]);

    if (isLoading && !milestones) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader />
                    <p className="mt-2 text-cyan-200">{loadingMessage || 'Generating Milestones...'}</p>
                </div>
            </div>
        );
    }

    if (!milestones) {
        return <div className="text-center text-cyan-200 py-10">Milestones will be generated here.</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Execution Roadmap</h2>
            <div className="relative border-l-2 border-neon-blue/50 ml-6">
                {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="mb-10 ml-12">
                        <span className="absolute flex items-center justify-center w-12 h-12 bg-deep-blue rounded-full -left-6 ring-4 ring-neon-blue">
                           <MilestoneIcon className="w-6 h-6 text-neon-blue" />
                        </span>
                        <div className="bg-black/20 p-6 rounded-lg shadow-lg">
                           <div className="flex justify-between items-center mb-2">
                             <h3 className="text-xl font-semibold text-white">{milestone.title}</h3>
                             <span className="bg-neon-blue/20 text-neon-blue text-xs font-semibold px-2.5 py-0.5 rounded-full">{milestone.duration}</span>
                           </div>
                           <p className="text-base font-normal text-gray-300">{milestone.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Milestones;
