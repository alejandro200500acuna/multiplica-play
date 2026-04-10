'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Loader2, Wifi, WifiOff } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

interface Question { num1: number; num2: number; answer: number; }

function generateOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  let attempts = 0;
  while (opts.size < 4 && attempts < 50) {
    const delta = Math.floor(Math.random() * 19) - 9;
    const candidate = correct + delta;
    if (candidate > 0 && candidate !== correct) opts.add(candidate);
    attempts++;
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

const OPTION_COLORS = [
  'from-blue-500 to-blue-700 shadow-[0_5px_0_#1d4ed8]',
  'from-pink-500 to-rose-700 shadow-[0_5px_0_#be123c]',
  'from-amber-500 to-orange-700 shadow-[0_5px_0_#c2410c]',
  'from-emerald-500 to-green-700 shadow-[0_5px_0_#15803d]',
];

export default function CompetitionGame() {
  const { studentName, studentId, setStep, competitionRoomId, competitionIsPlayer1 } = useStore();
  const [room, setRoom] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [myFinished, setMyFinished] = useState(false);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bothDone, setBothDone] = useState(false);
  const [opponentOnline, setOpponentOnline] = useState(true);

  const myScoreKey = competitionIsPlayer1 ? 'player1_score' : 'player2_score';
  const myFinKey = competitionIsPlayer1 ? 'player1_finished' : 'player2_finished';
  const oppScoreKey = competitionIsPlayer1 ? 'player2_score' : 'player1_score';
  const oppFinKey = competitionIsPlayer1 ? 'player2_finished' : 'player1_finished';
  const oppNameKey = competitionIsPlayer1 ? 'player2_name' : 'player1_name';

  // Load initial room
  useEffect(() => {
    if (!competitionRoomId) return;
    const load = async () => {
      const { data } = await supabase
        .from('competition_rooms').select('*').eq('id', competitionRoomId).single();
      if (data) {
        setRoom(data);
        setQuestions(data.questions);
        setOptions(generateOptions(data.questions[0].answer));
        setMyScore(data[myScoreKey] ?? 0);
        setOpponentScore(data[oppScoreKey] ?? 0);
        setMyFinished(data[myFinKey] ?? false);
        setOpponentFinished(data[oppFinKey] ?? false);
      }
      setIsLoading(false);
    };
    load();
  }, [competitionRoomId]);

  // Realtime subscription for opponent updates
  useEffect(() => {
    if (!competitionRoomId) return;
    const channel = supabase
      .channel(`game-${competitionRoomId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'competition_rooms', filter: `id=eq.${competitionRoomId}`
      }, (payload) => {
        const d = payload.new;
        setOpponentScore(d[oppScoreKey] ?? 0);
        const oppDone = d[oppFinKey] ?? false;
        setOpponentFinished(oppDone);
        if (d.status === 'finished') {
          setBothDone(true);
        }
      })
      .subscribe((status) => {
        setOpponentOnline(status === 'SUBSCRIBED');
      });

    return () => { supabase.removeChannel(channel); };
  }, [competitionRoomId, oppScoreKey, oppFinKey]);

  // Navigate to results when both done
  useEffect(() => {
    if (bothDone) {
      setTimeout(() => setStep('COMPETITION_RESULT'), 2000);
    }
  }, [bothDone]);

  const handleAnswer = useCallback(async (opt: number) => {
    if (selected !== null || myFinished || !questions[currentQ]) return;

    setSelected(opt);
    const correct = questions[currentQ].answer;
    const isCorrect = opt === correct;
    const newScore = isCorrect ? myScore + 1 : myScore;
    const isLastQ = currentQ === questions.length - 1;

    const updates: any = { [myScoreKey]: newScore };
    if (isLastQ) {
      updates[myFinKey] = true;
      // Check if opponent already finished to close the game
      const { data: fresh } = await supabase
        .from('competition_rooms').select(`${oppFinKey}, ${oppScoreKey}`).eq('id', competitionRoomId).single();
      if (fresh?.[oppFinKey]) {
        const oppFinalScore = fresh[oppScoreKey] ?? 0;
        const winnerId = newScore > oppFinalScore
          ? studentId
          : newScore < oppFinalScore
          ? (competitionIsPlayer1 ? room?.player2_id : room?.player1_id)
          : null;
        updates.status = 'finished';
        updates.winner_id = winnerId;
      }
    }

    await supabase.from('competition_rooms').update(updates).eq('id', competitionRoomId!);
    setMyScore(newScore);

    if (isLastQ) {
      setMyFinished(true);
      if (opponentFinished) setBothDone(true);
    } else {
      setTimeout(() => {
        setSelected(null);
        const next = currentQ + 1;
        setCurrentQ(next);
        setOptions(generateOptions(questions[next].answer));
      }, 900);
    }
  }, [selected, myFinished, questions, currentQ, myScore, myScoreKey, myFinKey, oppFinKey, oppScoreKey, competitionRoomId, studentId, competitionIsPlayer1, room, opponentFinished]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-accent" />
        <p className="font-bold opacity-60">Cargando el duelo...</p>
      </div>
    );
  }

  const currQ = questions[currentQ];
  if (!currQ) return null;
  const opponentName = room?.[oppNameKey] || 'Oponente';
  const total = questions.length;
  const myPercent = Math.round((myScore / total) * 100);
  const oppPercent = Math.round((opponentScore / total) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5">
      {/* Scoreboard */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5 rounded-3xl shadow-xl border-t-4 border-t-accent">
        <div className="flex items-center justify-between mb-3">
          <div className="text-center flex-1">
            <p className="text-xs opacity-60 font-medium mb-1">Tú ({studentName?.split(' ')[0]})</p>
            <p className="text-5xl font-display font-bold text-primary">{myScore}</p>
            {myFinished && <span className="text-xs text-green-400 font-bold">✓ Terminaste</span>}
          </div>
          <div className="text-center px-3">
            <p className="text-2xl font-display font-bold opacity-30">VS</p>
            <p className="text-xs opacity-50 mt-1">{currentQ + 1}/{total}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs opacity-60 font-medium mb-1">
              {opponentName.split(' ')[0]}
              {opponentOnline
                ? <Wifi className="inline w-3 h-3 text-green-400 ml-1" />
                : <WifiOff className="inline w-3 h-3 text-red-400 ml-1" />}
            </p>
            <p className="text-5xl font-display font-bold text-accent">{opponentScore}</p>
            {opponentFinished && <span className="text-xs text-green-400 font-bold">✓ Terminó</span>}
          </div>
        </div>
        {/* Progress bars */}
        <div className="flex gap-3">
          <div className="flex-1 bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div animate={{ width: `${myPercent}%` }} className="bg-primary h-full rounded-full" />
          </div>
          <div className="flex-1 bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
            <motion.div animate={{ width: `${oppPercent}%` }} className="bg-accent h-full rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        {!myFinished ? (
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="glass-panel p-8 md:p-12 rounded-3xl shadow-2xl text-center"
          >
            <p className="text-foreground/60 font-medium mb-2 text-sm">Pregunta {currentQ + 1} de {total}</p>
            <h3 className="text-6xl md:text-8xl font-display font-bold text-foreground mb-10">
              {currQ.num1} <span className="text-primary">×</span> {currQ.num2}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {options.map((opt, i) => {
                let cls = `bg-gradient-to-br ${OPTION_COLORS[i]} hover:translate-y-[-3px] hover:shadow-none text-white`;
                if (selected !== null) {
                  if (opt === currQ.answer) cls = 'bg-green-500 shadow-[0_5px_0_#166534] text-white scale-105';
                  else if (opt === selected && opt !== currQ.answer) cls = 'bg-red-500 opacity-70 text-white';
                  else cls = 'bg-white/5 text-white/30 cursor-default';
                }
                return (
                  <motion.button
                    key={opt}
                    whileTap={selected === null ? { scale: 0.95, y: 5 } : {}}
                    onClick={() => handleAnswer(opt)}
                    disabled={selected !== null}
                    className={`py-5 rounded-2xl font-display font-bold text-3xl transition-all duration-200 ${cls}`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 rounded-3xl shadow-2xl text-center"
          >
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
            <h3 className="text-3xl font-display font-bold mb-2">¡Listo! Tu resultado: {myScore}/{total}</h3>
            <p className="opacity-60 font-medium">Esperando que {opponentName.split(' ')[0]} termine...</p>
            <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mt-6" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Both done overlay */}
      <AnimatePresence>
        {bothDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="glass-panel p-10 rounded-3xl text-center shadow-2xl">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-display font-bold mb-2">¡Duelo Terminado!</h2>
              <p className="opacity-60">Calculando resultados...</p>
              <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mt-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
