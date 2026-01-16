
import React, { useState } from 'react';
import { Category, AgeGroup } from '../types';

interface AIStylistProps {
  onComplete: (filters: { category: string; ageGroup: string }) => void;
}

const AIStylist: React.FC<AIStylistProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState({ category: 'All', ageGroup: 'All' });

  const questions = [
    {
      text: "What are you looking for today?",
      options: Object.values(Category).map(v => ({ label: v, value: v })),
      key: 'category'
    },
    {
      text: "Which age group are you shopping for?",
      options: Object.values(AgeGroup).map(v => ({ label: v, value: v })),
      key: 'ageGroup'
    },
    {
      text: "What is your main style goal?",
      options: [
        { label: 'Be Bold', value: 'bold' },
        { label: 'Be Simple', value: 'simple' },
        { label: 'Surprise Me', value: 'surprise' }
      ],
      key: 'goal'
    }
  ];

  const handleOption = (val: string) => {
    const newAnswers = { ...answers, [questions[step].key]: val };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(newAnswers);
      setIsOpen(false);
      setStep(0);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[100] animate-float glass-royal border-amber-500/30 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
      >
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-[10px]">AI</div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />
      <div className="relative glass-royal w-full max-w-sm rounded-[2rem] p-8 border-amber-500/20 animate-text-reveal">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black text-[10px] font-bold">AI</div>
             <span className="text-[10px] uppercase tracking-widest text-amber-500">Stylist Assistant</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-gray-300 min-h-[50px] animate-text-reveal" key={step}>
            {questions[step].text}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {questions[step].options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleOption(opt.value)}
                className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 text-[10px] uppercase tracking-widest text-amber-500 transition-all"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStylist;
