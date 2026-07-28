'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from './GameLayout';
import { useGameLogic } from '@/hooks/useGameLogic';

export default function RapidFire() {
  const { currentQuestion, currentIndex, questions, handleAnswer } = useGameLogic('RAPID');
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    if (!currentQuestion) return;
    
    setTimeLeft(15);
    setFeedback(null);
  }, [currentIndex, currentQuestion]);

  useEffect(() => {
    if (feedback || !currentQuestion) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerFeedback(-1, false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [feedback, currentIndex, currentQuestion]);

  const triggerFeedback = (opt: number, isCorrect: boolean) => {
    if (feedback) return;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => {
      handleAnswer(opt, isCorrect);
    }, 1500); // Wait 1.5 seconds so the user can clearly see the face
  };

  if (!currentQuestion) return null;

  return (
    <GameLayout title="⚡ Respuesta Rápida" current={currentIndex + 1} total={questions.length} colorClass="text-primary">
      <div className="flex flex-col items-center w-full relative">
        <div className="w-full max-w-md h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-12 overflow-hidden shadow-inner">
          <motion.div 
            className={`h-full ${timeLeft > 5 ? 'bg-primary' : 'bg-red-500'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 15) * 100}%` }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {!feedback && (
            <motion.div 
              key={currentQuestion.id}
              initial={{ opacity: 0, scale: 0.5, rotateX: 90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-6xl md:text-8xl font-display font-bold text-slate-900 mb-12"
            >
              {currentQuestion.num1} <span className="text-indigo-600">×</span> {currentQuestion.num2}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-lg relative min-h-[200px]">
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -50 }}
                animate={{ opacity: 1, scale: 1, y: -20 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <div className={`rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 border-4 bg-white ${feedback === 'correct' ? 'border-emerald-500 text-emerald-800' : 'border-rose-500 text-rose-800'}`}>
                  <span className="text-8xl drop-shadow-lg">{feedback === 'correct' ? '😃' : '😢'}</span>
                  <span className={`text-3xl font-display font-bold ${feedback === 'correct' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {feedback === 'correct' ? '¡Correcto!' : '¡Incorrecto!'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {currentQuestion.options?.map((opt, i) => (
             <motion.button
              key={`${currentQuestion.id}-${i}`}
              whileHover={{ scale: feedback ? 1 : 1.04 }}
              whileTap={{ scale: feedback ? 1 : 0.96 }}
              onClick={() => triggerFeedback(opt, opt === currentQuestion.correctAnswer)}
              disabled={feedback !== null}
              className={`text-3xl font-bold py-6 rounded-3xl border-2 transition-all ${
                feedback !== null 
                  ? opt === currentQuestion.correctAnswer 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-slate-50 border-indigo-200 text-indigo-950 hover:bg-indigo-600 hover:text-white shadow-sm'
              }`}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
