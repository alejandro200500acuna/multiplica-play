'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, CheckCircle2, Edit3, Puzzle, Trophy, Medal, RotateCcw, AlertTriangle, Check, X } from 'lucide-react';
import { useStore, GameType } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Leaderboard from '@/components/Leaderboard';

const GAMES: { id: GameType; name: string; description: string; icon: any; color: string; shadow: string }[] = [
  {
    id: 'RAPID',
    name: 'Respuesta Rápida',
    description: 'Elige la respuesta correcta antes de que se acabe el tiempo',
    icon: Zap,
    color: 'bg-primary text-white',
    shadow: 'shadow-[0_6px_0_var(--color-primary-dark)] hover:shadow-[0_2px_0_var(--color-primary-dark)]'
  },
  {
    id: 'TRUE_FALSE',
    name: 'Verdadero o Falso',
    description: '¿Es correcta la operación? ¡No te dejes engañar!',
    icon: CheckCircle2,
    color: 'bg-success text-white',
    shadow: 'shadow-[0_6px_0_#059669] hover:shadow-[0_2px_0_#059669]'
  },
  {
    id: 'INPUT',
    name: 'Completar',
    description: 'Escribe el resultado exacto con el teclado',
    icon: Edit3,
    color: 'bg-secondary text-white',
    shadow: 'shadow-[0_6px_0_var(--color-secondary-dark)] hover:shadow-[0_2px_0_var(--color-secondary-dark)]'
  },
  {
    id: 'MEMORY',
    name: 'Memoria Matemática',
    description: 'Encuentra las parejas de operaciones y resultados',
    icon: Puzzle,
    color: 'bg-accent text-white',
    shadow: 'shadow-[0_6px_0_#db2777] hover:shadow-[0_2px_0_#db2777]'
  }
];

export default function GamesScreen() {
  const { studentName, studentId, setStep, setGame } = useStore();
  const [scores, setScores] = useState<Record<string, number>>({
    RAPID: 0,
    TRUE_FALSE: 0,
    INPUT: 0,
    MEMORY: 0
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!studentId || studentId === 'fallback-id') return;

    const fetchScores = async () => {
      const { data } = await supabase
        .from('practice_sessions')
        .select('game_type, score_percentage')
        .eq('student_id', studentId);
        
      if (data) {
        const bestScores: Record<string, number> = { RAPID: 0, TRUE_FALSE: 0, INPUT: 0, MEMORY: 0 };
        data.forEach(session => {
          if (session.score_percentage > bestScores[session.game_type]) {
            bestScores[session.game_type] = session.score_percentage;
          }
        });
        setScores(bestScores);
      }
    };
    
    fetchScores();
  }, [studentId]);

  const handleSelectGame = (gameId: GameType) => {
    setGame(gameId);
    setStep('PLAYING');
  };

  const confirmResetScores = async () => {
    if (!studentId || studentId === 'fallback-id') return;
    
    setIsResetting(true);
    try {
      const { error } = await supabase
        .from('practice_sessions')
        .delete()
        .eq('student_id', studentId);
        
      if (!error) {
        setScores({
          RAPID: 0,
          TRUE_FALSE: 0,
          INPUT: 0,
          MEMORY: 0
        });
      }
    } catch (err) {
      console.error('Error resetting scores', err);
    } finally {
      setIsResetting(false);
      setShowResetModal(false);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto items-start">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 md:p-10 rounded-3xl flex-1 shadow-2xl border-t-4 border-t-primary w-full"
        >
          <div className="flex items-center justify-center mb-10 relative">
            <button 
              onClick={() => setStep('TABLES')}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors absolute left-0 top-1/2 -translate-y-1/2 text-slate-700"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <div className="flex flex-col items-center">
              <span className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-1.5 rounded-full text-sm font-bold mb-2 inline-block shadow-sm">
                ¡Bienvenido/a, {studentName || 'Estudiante'}! ✨
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-slate-900">
                Elige un desafío 🎮
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GAMES.map((game, idx) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <button
                  onClick={() => handleSelectGame(game.id)}
                  className={cn(
                    "w-full p-6 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-300 relative overflow-hidden group shadow-md",
                    game.color,
                    "hover:translate-y-[-2px]"
                  )}
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                  <game.icon className="w-16 h-16 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="font-display font-bold text-2xl mb-2 text-white">{game.name}</h3>
                    <p className="text-white/90 font-medium">{game.description}</p>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tarjeta de Puntuaciones */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 md:p-8 rounded-3xl w-full lg:w-80 shadow-xl border border-slate-200 bg-white flex flex-col"
        >
          <div className="flex flex-col items-center mb-6">
            <Trophy className="w-14 h-14 text-amber-500 mb-2 drop-shadow" />
            <h3 className="text-2xl font-display font-bold text-center text-slate-900">
              Mi Puntuación
            </h3>
            <p className="text-xs font-semibold text-slate-500">Mejor puntaje por juego</p>
          </div>

          <div className="flex flex-col gap-4 mb-6">
            {GAMES.map((game) => (
              <div key={`score-${game.id}`} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between hover:border-amber-400 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", game.color)}>
                    <game.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs leading-tight text-slate-800">{game.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-display font-bold text-xl ${scores[game.id!] > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {scores[game.id!]}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowResetModal(true)}
            disabled={Object.values(scores).every(v => v === 0)}
            className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-error/10 text-error hover:bg-error hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
            Empezar de nuevo
          </button>
        </motion.div>
      </div>

      {/* Global Leaderboard visible to all */}
      <div className="w-full max-w-6xl mx-auto mt-6">
        <Leaderboard />
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border-t-4 border-t-error"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-10 h-10 text-error" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">¿Empezar de cero?</h3>
                <p className="text-foreground/70 mb-8 font-medium">
                  Esto limpiará todo tu progreso y empezarás desde cero % en todos los juegos. ¿Estás seguro/a?
                </p>
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setShowResetModal(false)}
                    disabled={isResetting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                  <button
                    onClick={confirmResetScores}
                    disabled={isResetting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-error text-white hover:bg-red-700 shadow-[0_4px_0_#991b1b] hover:translate-y-[2px] hover:shadow-[0_2px_0_#991b1b] transition-all"
                  >
                    {isResetting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    Limpiar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
