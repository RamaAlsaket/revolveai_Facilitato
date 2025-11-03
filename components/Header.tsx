
import React from 'react';
import { View } from '../types';
import { AnalysisIcon, MilestoneIcon, MindMapIcon, ExportIcon, ActionPlanIcon, FeasibilityStudyIcon } from './icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  hasIdea: boolean;
  onLogoClick: () => void;
  showFullNav: boolean;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, icon, isActive, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 no-print ${
        isActive
          ? 'bg-neon-blue text-deep-blue shadow-lg'
          : 'text-white hover:bg-white/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ currentView, setView, hasIdea, onLogoClick, showFullNav }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-black/20 backdrop-blur-sm sticky top-0 z-10 shadow-lg no-print">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button onClick={onLogoClick} className="flex-shrink-0 flex items-center space-x-2 text-white transition-transform duration-200 hover:scale-105">
              <span className="font-bold text-xl tracking-tight">RevolveAI</span>
            </button>
          </div>
          {showFullNav && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <NavButton
                label="Analysis"
                icon={<AnalysisIcon />}
                isActive={currentView === View.ANALYSIS}
                onClick={() => setView(View.ANALYSIS)}
                disabled={!hasIdea}
              />
              <NavButton
                label="Mind Map"
                icon={<MindMapIcon />}
                isActive={currentView === View.MIND_MAP}
                onClick={() => setView(View.MIND_MAP)}
                disabled={!hasIdea}
              />
              <NavButton
                label="Milestones"
                icon={<MilestoneIcon />}
                isActive={currentView === View.MILESTONES}
                onClick={() => setView(View.MILESTONES)}
                disabled={!hasIdea}
              />
              <NavButton
                label="Action Plan"
                icon={<ActionPlanIcon />}
                isActive={currentView === View.ACTION_PLAN}
                onClick={() => setView(View.ACTION_PLAN)}
                disabled={!hasIdea}
              />
              <NavButton
                label="Feasibility"
                icon={<FeasibilityStudyIcon />}
                isActive={currentView === View.FEASIBILITY_STUDY}
                onClick={() => setView(View.FEASIBILITY_STUDY)}
                disabled={!hasIdea}
              />
               <button
                  onClick={handlePrint}
                  disabled={!hasIdea}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 text-white hover:bg-white/20 ${!hasIdea ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Export to PDF"
                  aria-label="Export to PDF"
                >
                  <ExportIcon />
                </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
