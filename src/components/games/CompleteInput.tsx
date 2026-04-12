'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from './GameLayout';
import { useGameLogic } from '@/hooks/useGameLogic';
import { ArrowRight } from 'lucide-react';

export default function CompleteInput() {
  const { currentQuestion, currentIndex, questions, handleAnswer } = useGameLogic('INPUT');
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue('');
    setFeedback(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || feedback) return;
    
    // User wants to avoid accidental Enter, but this is the form submit.
    // If they want to remove it entirely, we could just handle click on the button.
    // However, keeping standard form behavior but with guard.
    
    const numValue = parseInt(inputValue, 10);
    const isCorrect = numValue === currentQuestion?.correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
      handleAnswer(numValue, isCorrect);
    }, 1500);
  };

  const handleInputChange = (value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 2000);
      return;
    }
    setShowWarning(false);
    setInputValue(value);
  };

  if (!currentQuestion) return null;

  return (
    <GameLayout title="✍️ Completar" current={currentIndex + 1} total={questions.length} colorClass="text-secondary-dark">
      <div className="flex flex-col items-center w-full mt-10 relative">
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-lg">
          <AnimatePresence mode="wait">
            {!feedback && (
              <motion.div 
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-4 text-6xl md:text-8xl font-display font-bold mb-16 title-shadow text-black dark:text-white"
              >
                <span>{currentQuestion.num1}</span>
                <span className="text-secondary">×</span>
                <span>{currentQuestion.num2}</span>
                <span className="text-primary">=</span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={feedback !== null}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Block enter to avoid "finishing activity" accidentally
                      e.preventDefault();
                      // Only submit if user explicitly uses the button or we decide to keep ENTER for submission
                    }
                  }}
                  className="w-32 md:w-48 text-center bg-black/60 border-b-8 border-secondary focus:border-primary focus:outline-none rounded-2xl shadow-inner text-white font-bold py-4 text-5xl md:text-7xl placeholder:text-white/20"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full relative min-h-[160px]">
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: -50 }}
                  animate={{ opacity: 1, scale: 1, y: -20 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-x-0 top-0 flex items-center justify-center z-50 pointer-events-none"
                >
                  <div className={`rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 ${feedback === 'correct' ? 'bg-green-100 dark:bg-green-900 border-4 border-success' : 'bg-red-100 dark:bg-red-900 border-4 border-error'}`}>
                    <span className="text-8xl drop-shadow-lg">{feedback === 'correct' ? '😃' : '😢'}</span>
                    <span className={`text-3xl font-display font-bold ${feedback === 'correct' ? 'text-success' : 'text-error'}`}>
                      {feedback === 'correct' ? '¡Correcto!' : '¡Incorrecto!'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-10 inset-x-0 p-2 bg-red-400/20 border border-red-400/30 rounded-xl text-red-300 text-center font-bold text-xs"
                >
                  ⚠️ Solo debes colocar números
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={!inputValue.trim() || feedback !== null}
              className={`group flex items-center justify-center gap-3 w-full font-display font-bold text-3xl py-6 rounded-3xl transition-all ${
                feedback !== null
                  ? 'bg-secondary/50 text-white/50 cursor-not-allowed shadow-none'
                  : 'bg-secondary text-white shadow-[0_8px_0_var(--color-secondary-dark)] hover:shadow-[0_4px_0_var(--color-secondary-dark)] hover:translate-y-1'
              }`}
            >
              Comprobar
              <ArrowRight className="w-8 h-8 group-hover:scale-125 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </GameLayout>
  );
}
