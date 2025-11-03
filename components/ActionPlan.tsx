
import React, { useEffect, useState } from 'react';
import type { ActionPlanData } from '../types';
import Loader from './Loader';
import { ActionPlanIcon } from './icons';

interface ActionPlanProps {
    plan: ActionPlanData | null;
    fetchData: () => void;
    isLoading: boolean;
    loadingMessage: string;
    businessIdea: string;
}

const AccordionItem: React.FC<{ phase: any, index: number, isOpen: boolean, onToggle: () => void }> = ({ phase, index, isOpen, onToggle }) => {
    return (
        <div className="bg-black/20 rounded-lg shadow-md mb-4 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-5 text-left font-semibold text-white hover:bg-black/30 transition-colors duration-200"
                aria-expanded={isOpen}
                aria-controls={`phase-content-${index}`}
            >
                <div>
                    <h3 className="text-xl text-neon-blue">{phase.phase}</h3>
                    <p className="text-sm font-normal text-gray-300 mt-1">{phase.description}</p>
                </div>
                <svg className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                id={`phase-content-${index}`}
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
                <div className="p-5 border-t border-white/20">
                    {phase.steps.map((step: any) => (
                        <div key={step.id} className="mb-4 pb-4 border-b border-white/10 last:border-b-0 last:pb-0 last:mb-0">
                            <h4 className="font-bold text-white">{step.title}</h4>
                            <p className="text-gray-300 text-sm mt-1 mb-2">{step.description}</p>
                            {step.dependencies && step.dependencies.length > 0 && (
                                <div className="flex items-center text-xs text-gray-400">
                                    <span className="font-semibold mr-2">Dependencies:</span>
                                    <div className="flex flex-wrap gap-1">
                                    {step.dependencies.map((dep: string, i: number) => (
                                        <span key={i} className="bg-gray-600/50 px-2 py-0.5 rounded">{dep}</span>
                                    ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const ActionPlan: React.FC<ActionPlanProps> = ({ plan, fetchData, isLoading, loadingMessage, businessIdea }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        if (businessIdea && !plan) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessIdea]);
    
    useEffect(() => {
        // When plan data arrives, open the first phase by default.
        if (plan && plan.length > 0) {
            setOpenIndex(0);
        }
    }, [plan]);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (isLoading && !plan) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader />
                    <p className="mt-2 text-cyan-200">{loadingMessage || 'Generating Action Plan...'}</p>
                </div>
            </div>
        );
    }

    if (!plan) {
        return <div className="text-center text-cyan-200 py-10">Action plan will be generated here.</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in">
            <div className="text-center mb-8">
                <ActionPlanIcon className="w-12 h-12 mx-auto text-neon-blue"/>
                <h2 className="text-3xl font-bold mt-2 text-white">Implementation Action Plan</h2>
                <p className="text-cyan-200">A step-by-step guide from idea to execution.</p>
            </div>
            <div>
                {plan.map((phase, index) => (
                    <AccordionItem 
                        key={index}
                        phase={phase}
                        index={index}
                        isOpen={openIndex === index}
                        onToggle={() => handleToggle(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ActionPlan;
