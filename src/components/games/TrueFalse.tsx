'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLayout from './GameLayout';
import { useGameLogic } from '@/hooks/useGameLogic';
import { Check, X } from 'lucide-react';

export default function TrueFalse() {
  const { currentQuestion, currentIndex, questions, handleAnswer } = useGameLogic('TRUE_FALSE');
  const [displayedAnswer, setDisplayedAnswer] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    if (!currentQuestion) return;
    setFeedback(null);
    
    // Decide if it should be true or false (50/50 chance)
    const isTrue = Math.random() > 0.5;
    if (isTrue) {
      setDisplayedAnswer(currentQuestion.correctAnswer);
    } else {
      // Generate a wrong answer that is close
      let fakeAnswer = currentQuestion.correctAnswer + (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      if (fakeAnswer <= 0) fakeAnswer = currentQuestion.correctAnswer + 2;
      setDisplayedAnswer(fakeAnswer);
    }
  }, [currentIndex, currentQuestion]);

  if (!currentQuestion) return null;

  const handleChoice = (choice: boolean) => {
    if (feedback) return;
    const isActuallyTrue = displayedAnswer === currentQuestion.correctAnswer;
    const isCorrect = choice === isActuallyTrue;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => {
      handleAnswer(displayedAnswer, isCorrect);
    }, 1500);
  };

  return (
    <GameLayout title="🧐 Verdadero o Falso" current={currentIndex + 1} total={questions.length} colorClass="text-success">
      <div className="flex flex-col items-center w-full mt-10 relative text-center">
        <AnimatePresence mode="wait">
          {!feedback && (
            <motion.div 
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="text-6xl md:text-8xl font-display font-bold mb-16 title-shadow text-black dark:text-white"
            >
              {currentQuestion.num1} <span className="text-secondary">×</span> {currentQuestion.num2} = <span className="text-primary">{displayedAnswer}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6 w-full max-w-md relative min-h-[160px]">
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

          <motion.button
            whileHover={{ scale: feedback ? 1 : 1.05 }}
            whileTap={{ scale: feedback ? 1 : 0.95 }}
            onClick={() => handleChoice(true)}
            disabled={feedback !== null}
            className={`flex-1 flex flex-col items-center justify-center gap-2 text-white text-3xl font-bold py-8 rounded-3xl transition-all ${
              feedback !== null 
                ? 'bg-success/50 cursor-not-allowed shadow-none' 
                : 'bg-success shadow-[0_8px_0_#059669] hover:shadow-[0_4px_0_#059669] hover:translate-y-1'
            }`}
          >
            <Check className="w-12 h-12" />
            ¡Verdadero!
          </motion.button>
          
          <motion.button
            whileHover={{ scale: feedback ? 1 : 1.05 }}
            whileTap={{ scale: feedback ? 1 : 0.95 }}
            onClick={() => handleChoice(false)}
            disabled={feedback !== null}
            className={`flex-1 flex flex-col items-center justify-center gap-2 text-white text-3xl font-bold py-8 rounded-3xl transition-all ${
              feedback !== null 
                ? 'bg-error/50 cursor-not-allowed shadow-none' 
                : 'bg-error shadow-[0_8px_0_#b91c1c] hover:shadow-[0_4px_0_#b91c1c] hover:translate-y-1'
            }`}
          >
            <X className="w-12 h-12" />
            ¡Falso!
          </motion.button>
        </div>
      </div>
    </GameLayout>
  );
}
