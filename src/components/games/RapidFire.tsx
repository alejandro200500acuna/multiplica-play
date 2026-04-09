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
              className="text-7xl md:text-9xl font-display font-bold text-foreground mb-16 title-shadow text-black dark:text-white"
            >
              {currentQuestion.num1} <span className="text-primary">×</span> {currentQuestion.num2}
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
                <div className={`rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 ${feedback === 'correct' ? 'bg-green-100 dark:bg-green-900 border-4 border-success' : 'bg-red-100 dark:bg-red-900 border-4 border-error'}`}>
                  <span className="text-8xl drop-shadow-lg">{feedback === 'correct' ? '😃' : '😢'}</span>
                  <span className={`text-3xl font-display font-bold ${feedback === 'correct' ? 'text-success' : 'text-error'}`}>
                    {feedback === 'correct' ? '¡Correcto!' : '¡Incorrecto!'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {currentQuestion.options?.map((opt, i) => (
             <motion.button
              key={`${currentQuestion.id}-${i}`}
              whileHover={{ scale: feedback ? 1 : 1.05 }}
              whileTap={{ scale: feedback ? 1 : 0.95 }}
              onClick={() => triggerFeedback(opt, opt === currentQuestion.correctAnswer)}
              disabled={feedback !== null}
              className={`text-3xl font-bold py-6 rounded-3xl border-4 transition-all ${
                feedback !== null 
                  ? opt === currentQuestion.correctAnswer 
                    ? 'bg-success text-white border-success shadow-[0_8px_0_#059669]' 
                    : 'bg-white/50 dark:bg-white/5 text-gray-400 border-gray-300 dark:border-gray-700 shadow-none'
                  : 'bg-white dark:bg-white/10 hover:bg-primary hover:text-white dark:hover:bg-primary border-primary/20 hover:border-primary shadow-[0_8px_0_var(--color-primary-100)] dark:shadow-[0_8px_0_var(--color-primary-900)] hover:shadow-[0_4px_0_var(--color-primary-600)]'
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
