import React, { useState } from 'react';
import Loader from './Loader';

interface IdeaInputProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
}

const IdeaInput: React.FC<IdeaInputProps> = ({ onSubmit, isLoading }) => {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isLoading) return;
    onSubmit(idea);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-black/20 p-8 rounded-xl shadow-2xl backdrop-blur-lg">
        <label htmlFor="business-idea" className="block text-lg font-medium text-cyan-200 mb-2">
          Enter Your Business Idea
        </label>
        <textarea
          id="business-idea"
          rows={6}
          className="w-full p-4 bg-white/10 rounded-lg border-2 border-transparent focus:border-neon-blue focus:ring-0 focus:outline-none transition-colors duration-200 text-white placeholder-gray-400"
          placeholder="e.g., A subscription box for eco-friendly pet toys..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !idea.trim()}
          className="mt-6 w-full flex justify-center items-center bg-white text-deep-blue font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-neon-blue hover:text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? <Loader /> : 'Start Analysis'}
        </button>
      </form>
    </div>
  );
};

export default IdeaInput;