'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

const CONFETTI = ['🎉','⭐','🏆','✨','🎊','🥇'];

export default function CompetitionResult() {
  const { studentId, setStep, competitionRoomId, competitionIsPlayer1 } = useStore();
  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!competitionRoomId) return;
    const load = async () => {
      const { data } = await supabase
        .from('competition_rooms').select('*').eq('id', competitionRoomId).single();
      setRoom(data);
      setIsLoading(false);
    };
    load();
  }, [competitionRoomId]);

  if (isLoading || !room) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  const myScore = competitionIsPlayer1 ? room.player1_score : room.player2_score;
  const oppScore = competitionIsPlayer1 ? room.player2_score : room.player1_score;
  const oppName = competitionIsPlayer1 ? room.player2_name : room.player1_name;
  const myName = competitionIsPlayer1 ? room.player1_name : room.player2_name;
  const total = room.questions.length;

  const won = myScore > oppScore;
  const tied = myScore === oppScore;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg mx-auto">
      <div className={`glass-panel p-8 md:p-12 rounded-3xl shadow-2xl border-t-8 text-center ${
        won ? 'border-t-yellow-400' : tied ? 'border-t-blue-400' : 'border-t-gray-500'
      }`}>

        {/* Result header */}
        <div className="mb-8">
          {won ? (
            <>
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, duration: 0.8 }}
              >
                <Trophy className="w-28 h-28 text-yellow-400 mx-auto drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
              </motion.div>
              <div className="text-4xl mb-3">{CONFETTI.sort(() => Math.random() - 0.5).join(' ')}</div>
              <h2 className="text-4xl font-display font-bold text-yellow-400 mb-2">¡Ganaste! 🎉</h2>
              <p className="text-foreground/70 font-medium">¡Eres el campeón de este duelo!</p>
            </>
          ) : tied ? (
            <>
              <span className="text-8xl block mb-4">🤝</span>
              <h2 className="text-4xl font-display font-bold text-blue-400 mb-2">¡Empate!</h2>
              <p className="text-foreground/70 font-medium">¡Están perfectamente igualados!</p>
            </>
          ) : (
            <>
              <span className="text-8xl block mb-4">😤</span>
              <h2 className="text-4xl font-display font-bold text-foreground mb-2">¡Casi!</h2>
              <p className="text-foreground/70 font-medium">¡Practica más para ganar la próxima!</p>
            </>
          )}
        </div>

        {/* Score comparison */}
        <div className="flex justify-center items-center gap-6 mb-8 bg-black/10 dark:bg-white/5 rounded-2xl p-6">
          <div className="text-center">
            <p className="text-sm opacity-60 mb-2 font-medium">{myName?.split(' ')[0]} (Tú)</p>
            <p className={`text-6xl font-display font-bold ${won ? 'text-yellow-400' : 'text-primary'}`}>
              {myScore}
              <span className="text-2xl opacity-40">/{total}</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold opacity-20">VS</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-60 mb-2 font-medium">{oppName?.split(' ')[0]}</p>
            <p className={`text-6xl font-display font-bold ${!won && !tied ? 'text-yellow-400' : 'text-accent'}`}>
              {oppScore}
              <span className="text-2xl opacity-40">/{total}</span>
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex gap-2 mb-8">
          <div className="flex-1 text-center bg-primary/10 rounded-xl p-3">
            <p className="text-2xl font-display font-bold text-primary">{Math.round((myScore / total) * 100)}%</p>
            <p className="text-xs opacity-60">Tu acierto</p>
          </div>
          <div className="flex-1 text-center bg-accent/10 rounded-xl p-3">
            <p className="text-2xl font-display font-bold text-accent">{Math.round((oppScore / total) * 100)}%</p>
            <p className="text-xs opacity-60">Acierto rival</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setStep('COMPETITION_LOBBY')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-accent to-pink-600 text-white shadow-[0_6px_0_#be185d] hover:shadow-[0_3px_0_#be185d] hover:translate-y-[3px] transition-all"
          >
            <RotateCcw className="w-5 h-5" /> Nueva Batalla
          </button>
          <button
            onClick={() => setStep('MODE_SELECT')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <Home className="w-5 h-5" /> Volver al Menú
          </button>
        </div>
      </div>
    </motion.div>
  );
}
