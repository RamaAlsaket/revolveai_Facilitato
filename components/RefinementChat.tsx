
import React, { useState, useEffect } from 'react';
import Loader from './Loader';

interface RefinementChatProps {
  questions: string[];
  onSubmit: (answers: string[]) => void;
  isLoading: boolean;
  loadingMessage: string;
}

const RefinementChat: React.FC<RefinementChatProps> = ({ questions, onSubmit, isLoading, loadingMessage }) => {
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    // Keep answers array in sync with questions array as it grows
    if (questions.length > answers.length) {
        setAnswers(currentAnswers => [
            ...currentAnswers,
            ...Array(questions.length - currentAnswers.length).fill('')
        ]);
    }
  }, [questions.length, answers.length]);


  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onSubmit(answers);
  };

  const allAnswersProvided = !isLoading && questions.length > 0 && answers.length === questions.length && answers.every(answer => answer.trim() !== '');

  // Only show the main loader when fetching questions (i.e., when answers are empty)
  const showMainLoader = isLoading && !answers.some(a => a.trim() !== '');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-black/20 p-8 rounded-xl shadow-2xl backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-cyan-200 mb-6 text-center">Let's Refine Your Idea</h2>
        <div className="space-y-6 min-h-[300px]">
          {questions.map((question, index) => (
            <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <label htmlFor={`question-${index}`} className="block text-md font-medium text-white mb-2">
                {`Q${index + 1}: ${question}`}
              </label>
              <textarea
                id={`question-${index}`}
                rows={3}
                className="w-full p-3 bg-white/10 rounded-lg border-2 border-transparent focus:border-neon-blue focus:ring-0 focus:outline-none transition-colors duration-200 text-white placeholder-gray-400 disabled:opacity-60"
                placeholder="Your answer..."
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                disabled={isLoading}
              />
            </div>
          ))}
          {showMainLoader && (
            <div className="text-center text-cyan-200 py-10 flex items-center justify-center animate-fade-in">
                <Loader />
                <span className="ml-3">{loadingMessage}</span>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !allAnswersProvided}
          className="mt-8 w-full flex justify-center items-center bg-neon-blue text-deep-blue font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading && !showMainLoader ? <><Loader /> <span className="ml-2">{loadingMessage}</span></> : 'Create Refined Plan'}
        </button>
      </form>
    </div>
  );
};

export default RefinementChat;