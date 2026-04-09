'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type GameId = 'RAPID' | 'TRUE_FALSE' | 'INPUT' | 'MEMORY';

const GAMES: { id: GameId; label: string }[] = [
  { id: 'RAPID', label: 'Rápido' },
  { id: 'TRUE_FALSE', label: 'V o F' },
  { id: 'INPUT', label: 'Teclado' },
  { id: 'MEMORY', label: 'Memoria' },
];

const MEDALS = [
  'bg-yellow-400 text-yellow-900 border-yellow-200 animate-pulse',
  'bg-gray-300 text-gray-700 border-white',
  'bg-amber-600 text-white border-amber-300',
];

export default function Leaderboard({ compact = false }: { compact?: boolean }) {
  const [selectedGame, setSelectedGame] = useState<GameId>('RAPID');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('practice_sessions')
      .select('score_percentage, duration_seconds, student_id, users!inner(full_name, role)')
      .eq('game_type', selectedGame)
      .eq('passed', true)
      .eq('users.role', 'student')
      .order('score_percentage', { ascending: false })
      .order('duration_seconds', { ascending: true })
      .limit(100);

    if (data) {
      const seen = new Map();
      data.forEach(s => {
        if (!seen.has(s.student_id)) {
          seen.set(s.student_id, { ...s, full_name: (s.users as any).full_name });
        }
      });
      setLeaderboard(Array.from(seen.values()).slice(0, 5));
    } else {
      setLeaderboard([]);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchLeaderboard(); }, [selectedGame]);

  const fmtTime = (secs: number) =>
    `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-panel p-6 md:p-8 rounded-3xl shadow-2xl border-t-4 border-t-yellow-400 w-full"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
        <h3 className="text-xl font-display font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Salón de la Fama
        </h3>
        <div className="flex bg-black/10 dark:bg-white/10 p-1 rounded-xl">
          {GAMES.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGame(g.id)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors whitespace-nowrap ${
                selectedGame === g.id
                  ? 'bg-white dark:bg-black/50 text-yellow-600 shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[160px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
          </div>
        )}

        {!isLoading && leaderboard.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 opacity-50 gap-2">
            <Trophy className="w-10 h-10" />
            <p className="font-medium text-sm text-center">Aún no hay campeones.<br/>¡Sé el primero!</p>
          </div>
        )}

        {!isLoading && leaderboard.map((student, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 mb-3 p-3 rounded-2xl transition-colors ${
              i === 0 ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-black/5 dark:bg-white/5'
            }`}
          >
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-sm flex-shrink-0 ${MEDALS[i] ?? 'bg-black/10 dark:bg-white/10 text-foreground border-transparent'}`}>
              {i + 1}
            </span>
            <span className="font-bold flex-1 truncate">{student.full_name}</span>
            <span className="text-green-600 dark:text-green-400 font-bold text-sm">{student.score_percentage}%</span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-mono text-xs bg-blue-500/10 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" /> {fmtTime(student.duration_seconds)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
