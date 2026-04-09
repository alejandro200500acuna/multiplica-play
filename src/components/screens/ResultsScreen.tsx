'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, LayoutGrid, LogOut, Star, Trophy, Frown, Clock, Flame } from 'lucide-react';
import { useStore } from '@/store/useStore';
import confetti from 'canvas-confetti';

export default function ResultsScreen() {
  const { studentName, scorePercentage, correctAnswers, passed, resetGame, resetAll, setStep, timeTaken, isNewRecord } = useStore();

  useEffect(() => {
    if (passed) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [passed]);

  const formatTime = (seconds: number) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-8 md:p-12 rounded-3xl w-full max-w-2xl mx-auto shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-full h-4 ${passed ? 'bg-success' : 'bg-error'}`} />

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        {passed ? (
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-50 rounded-full scale-150 animate-pulse" />
            <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-2xl relative z-10" />
            <Star className="w-10 h-10 text-yellow-500 absolute -top-4 -right-4 animate-spin-slow" />
            <Star className="w-8 h-8 text-yellow-500 absolute top-10 -left-6 rotate-12" />
          </div>
        ) : (
          <Frown className="w-32 h-32 text-error drop-shadow-lg" />
        )}
      </motion.div>

      <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 title-shadow text-white">
        {passed ? '¡Felicidades!' : '¡Sigue practicando!'}
      </h2>
      
      <p className="text-xl md:text-2xl font-bold bg-white/50 dark:bg-black/20 px-6 py-2 rounded-full mb-8 text-foreground">
        {studentName}, has obtenido {scorePercentage}%
      </p>

      {isNewRecord && (
        <motion.div
          initial={{ scale: 0.8, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-gradient-to-r from-orange-400 to-rose-500 text-white font-bold px-6 py-3 rounded-full mb-6 shadow-[0_0_15px_rgba(249,115,22,0.5)] flex items-center justify-center gap-2 w-full border-2 border-white/20"
        >
          <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
          ¡Has superado tu tiempo de respuesta anterior!
          <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-2 md:gap-4 w-full mb-10">
        <div className="bg-success text-white py-4 md:px-2 rounded-2xl flex flex-col items-center justify-center shadow-inner">
          <span className="text-[10px] md:text-xs font-bold opacity-80 uppercase tracking-widest text-center leading-tight mb-1">Correctas</span>
          <span className="text-3xl md:text-4xl font-display font-bold">{correctAnswers}</span>
        </div>
        <div className="bg-error text-white py-4 md:px-2 rounded-2xl flex flex-col items-center justify-center shadow-inner">
          <span className="text-[10px] md:text-xs font-bold opacity-80 uppercase tracking-widest text-center leading-tight mb-1">Incorrectas</span>
          <span className="text-3xl md:text-4xl font-display font-bold">
            {passed && scorePercentage === 100 ? 0 : Math.round((correctAnswers / (scorePercentage/100)) - correctAnswers)}
          </span>
        </div>
        <div className="bg-primary text-white py-4 md:px-2 rounded-2xl flex flex-col items-center justify-center shadow-inner">
          <span className="text-[10px] md:text-xs font-bold opacity-80 uppercase tracking-widest text-center leading-tight mb-1">Tiempo</span>
          <span className="text-2xl md:text-3xl font-display font-bold flex items-center gap-1">
            <Clock className="w-4 h-4 md:w-5 md:h-5 opacity-70 hidden md:block" />
            {formatTime(timeTaken)}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <button
          onClick={() => {
            resetGame();
            setStep('PLAYING');
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 px-6 rounded-2xl shadow-[0_6px_0_var(--color-primary-dark)] hover:shadow-[0_2px_0_var(--color-primary-dark)] hover:translate-y-[4px] transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Reintentar
        </button>
        <button
          onClick={() => {
            resetGame();
            setStep('GAMES');
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-secondary text-white font-bold py-4 px-6 rounded-2xl shadow-[0_6px_0_var(--color-secondary-dark)] hover:shadow-[0_2px_0_var(--color-secondary-dark)] hover:translate-y-[4px] transition-all"
        >
          <LayoutGrid className="w-5 h-5" />
          Otro Juego
        </button>
        <button
          onClick={resetAll}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-gray-500 text-white font-bold py-4 px-6 rounded-2xl shadow-[0_6px_0_#374151] hover:shadow-[0_2px_0_#374151] hover:translate-y-[4px] transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
