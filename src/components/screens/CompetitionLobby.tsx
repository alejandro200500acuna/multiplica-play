'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, LogIn, Copy, Check, ArrowLeft, Loader2, AlertCircle,
  Swords, Trophy, Clock, RefreshCw, Zap, Crown
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

interface Question { num1: number; num2: number; answer: number; }

interface ActiveRoom {
  id: string;
  room_code: string;
  status: 'waiting' | 'playing' | 'finished';
  player1_name: string | null;
  player2_name: string | null;
  created_at: string;
}

interface CompWinner {
  winner_id: string;
  winner_name: string;
  wins: number;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function generateQuestions(count = 10): Question[] {
  const all: Question[] = [];
  for (let t = 2; t <= 10; t++) {
    for (let i = 1; i <= 10; i++) {
      all.push({ num1: t, num2: i, answer: t * i });
    }
  }
  return [...all].sort(() => Math.random() - 0.5).slice(0, count);
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}

// ── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: ActiveRoom['status'] }) {
  if (status === 'waiting') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
      Esperando
    </span>
  );
  if (status === 'playing') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-400/20 text-green-400 border border-green-400/30">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      En duelo
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/40 border border-white/10">
      Finalizado
    </span>
  );
}

// ── Active Duels Panel ───────────────────────────────────────────────────────
function ActiveDuelsPanel() {
  const [rooms, setRooms] = useState<ActiveRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    // Only show rooms created in the last 30 minutes to avoid stale/abandoned rooms
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('competition_rooms')
      .select('id, room_code, status, player1_name, player2_name, created_at')
      .in('status', ['waiting', 'playing'])
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(10);
    setRooms(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRooms();

    // Real-time subscription for any room changes
    const channel = supabase
      .channel('active-rooms-lobby')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'competition_rooms'
      }, () => fetchRooms())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchRooms]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-panel rounded-3xl shadow-xl border-t-4 border-t-yellow-400/70 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base">Duelos Activos</h3>
            <p className="text-xs text-foreground/50">Tiempo real ⚡</p>
          </div>
        </div>
        <button
          onClick={fetchRooms}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title="Actualizar"
        >
          <RefreshCw className="w-4 h-4 opacity-60" />
        </button>
      </div>

      {/* Body */}
      <div className="divide-y divide-white/5 min-h-[80px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin opacity-50" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 opacity-50">
            <Swords className="w-8 h-8" />
            <p className="text-sm font-medium">Sin duelos activos en este momento</p>
          </div>
        ) : (
          <AnimatePresence>
            {rooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-6 py-3 hover:bg-white/5 transition-colors"
              >
                {/* Players */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-bold text-sm truncate max-w-[90px]">
                    {room.player1_name ?? '—'}
                  </span>
                  <span className="text-accent font-bold text-xs shrink-0">⚔️</span>
                  <span className={`font-bold text-sm truncate max-w-[90px] ${
                    room.status === 'waiting' ? 'opacity-40 italic' : ''
                  }`}>
                    {room.player2_name ?? (room.status === 'waiting' ? 'Esperando...' : '—')}
                  </span>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <StatusPill status={room.status} />
                  <span className="flex items-center gap-1 text-[10px] opacity-40">
                    <Clock className="w-3 h-3" />
                    {timeAgo(room.created_at)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

// ── Competition Leaderboard ──────────────────────────────────────────────────
function CompetitionLeaderboard() {
  const [winners, setWinners] = useState<CompWinner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Get all finished rooms with a winner
      const { data } = await supabase
        .from('competition_rooms')
        .select('winner_id, player1_id, player1_name, player2_id, player2_name')
        .eq('status', 'finished')
        .not('winner_id', 'is', null);

      if (data) {
        const tally: Record<string, { name: string; wins: number }> = {};
        data.forEach(r => {
          const wid = r.winner_id;
          // Identify winner name
          const wname =
            wid === r.player1_id ? r.player1_name :
            wid === r.player2_id ? r.player2_name :
            'Desconocido';
          if (!tally[wid]) tally[wid] = { name: wname ?? 'Desconocido', wins: 0 };
          tally[wid].wins += 1;
        });

        const sorted = Object.entries(tally)
          .map(([id, v]) => ({ winner_id: id, winner_name: v.name, wins: v.wins }))
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 10);

        setWinners(sorted);
      }
      setLoading(false);
    };
    load();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-panel rounded-3xl shadow-xl border-t-4 border-t-accent overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-pink-600 flex items-center justify-center shadow">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-base">Tabla de Campeones</h3>
          <p className="text-xs text-foreground/50">Mejores duelistas</p>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-[80px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin opacity-50" />
          </div>
        ) : winners.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 opacity-50">
            <Crown className="w-8 h-8" />
            <p className="text-sm font-medium">Aún no hay campeones registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {winners.map((w, i) => {
              const isTop3 = i < 3;
              return (
                <motion.div
                  key={w.winner_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 px-6 py-3 ${
                    i === 0 ? 'bg-yellow-400/8' : ''
                  } hover:bg-white/5 transition-colors`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center shrink-0">
                    {isTop3 ? (
                      <span className="text-xl">{medals[i]}</span>
                    ) : (
                      <span className="text-sm font-bold opacity-40">#{i + 1}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${i === 0 ? 'text-yellow-400' : ''}`}>
                      {w.winner_name}
                    </p>
                  </div>

                  {/* Wins badge */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-display font-bold ${
                      i === 0
                        ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                        : i === 1
                        ? 'bg-gray-300/20 text-gray-300 border border-gray-300/30'
                        : i === 2
                        ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30'
                        : 'bg-accent/15 text-accent border border-accent/20'
                    }`}>
                      <Zap className="w-3 h-3" />
                      {w.wins} {w.wins === 1 ? 'victoria' : 'victorias'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function CompetitionLobby() {
  const { studentName, studentId, setStep, setCompetitionRoom } = useStore();
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Clean up any previous waiting rooms from this player before creating a new one
      if (studentId) {
        await supabase
          .from('competition_rooms')
          .delete()
          .eq('player1_id', studentId)
          .eq('status', 'waiting');
      }
      const code = generateCode();
      const questions = generateQuestions(10);
      const { data, error: dbErr } = await supabase.from('competition_rooms').insert({
        room_code: code,
        player1_id: studentId,
        player1_name: studentName,
        questions,
        status: 'waiting'
      }).select().single();

      if (dbErr) throw dbErr;
      setRoomCode(code);
      setRoomId(data.id);
      setMode('create');
    } catch {
      setError('Error al crear la sala. Intenta de nuevo.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (mode !== 'create' || !roomId) return;
    const channel = supabase
      .channel(`lobby-${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'competition_rooms', filter: `id=eq.${roomId}`
      }, (payload) => {
        if (payload.new.status === 'playing') {
          setCompetitionRoom(roomId, true);
          setStep('COMPETITION_GAME');
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [mode, roomId]);

  const handleJoinRoom = async () => {
    if (joinCode.length !== 6) return;
    setIsLoading(true);
    setError('');
    try {
      const { data: room, error: dbErr } = await supabase
        .from('competition_rooms')
        .select('*')
        .eq('room_code', joinCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (dbErr || !room) { setError('Sala no encontrada o ya está en juego.'); setIsLoading(false); return; }
      if (room.player1_id === studentId) { setError('No puedes unirte a tu propia sala.'); setIsLoading(false); return; }

      await supabase.from('competition_rooms').update({
        player2_id: studentId,
        player2_name: studentName,
        status: 'playing'
      }).eq('id', room.id);

      setCompetitionRoom(room.id, false);
      setStep('COMPETITION_GAME');
    } catch {
      setError('Error al unirse. Verifica el código e intenta de nuevo.');
    }
    setIsLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goBack = () => {
    if (mode === 'select') setStep('MODE_SELECT');
    else { setMode('select'); setError(''); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto flex flex-col gap-5"
    >
      {/* ── Main lobby card ── */}
      <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl border-t-4 border-t-accent">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={goBack} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Competencia</h2>
              <p className="text-foreground/60 text-sm">Multijugador en tiempo real ⚡</p>
            </div>
          </div>
        </div>

        {/* Mode: Select */}
        {mode === 'select' && (
          <div className="flex flex-col gap-4">
            <p className="text-center text-foreground/70 font-medium mb-2">¿Qué deseas hacer?</p>
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full p-6 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xl flex items-center justify-center gap-3 shadow-[0_6px_0_var(--color-primary-dark)] hover:shadow-[0_3px_0_var(--color-primary-dark)] hover:translate-y-[3px] transition-all disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
              Crear una Sala
            </button>
            <button
              onClick={() => { setMode('join'); setError(''); }}
              className="w-full p-6 rounded-2xl bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30 border-2 border-accent/30 hover:border-accent text-white font-bold text-xl flex items-center justify-center gap-3 transition-all"
            >
              <LogIn className="w-6 h-6" />
              Unirse a una Sala
            </button>
            {error && <p className="text-error text-center font-bold text-sm mt-1">{error}</p>}
          </div>
        )}

        {/* Mode: Create - waiting */}
        {mode === 'create' && (
          <div className="flex flex-col items-center gap-6">
            <p className="text-foreground/70 font-medium text-center">Comparte este código con tu oponente</p>
            <div className="w-full bg-black/20 dark:bg-white/5 rounded-2xl p-6 flex items-center justify-center gap-4 border-2 border-accent/30">
              <span className="text-5xl font-display font-bold tracking-widest text-accent">{roomCode}</span>
              <button onClick={copyCode} className="p-3 rounded-xl bg-accent/20 hover:bg-accent/40 transition-colors">
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-accent" />}
              </button>
            </div>
            <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-4 w-full">
              <Loader2 className="w-6 h-6 text-yellow-400 animate-spin flex-shrink-0" />
              <p className="text-yellow-300 font-medium text-sm">Esperando que tu oponente se una...</p>
            </div>
            <p className="text-foreground/40 text-xs text-center">Cuando tu amigo ingrese el código, ¡el duelo comenzará automáticamente!</p>
          </div>
        )}

        {/* Mode: Join */}
        {mode === 'join' && (
          <div className="flex flex-col gap-5">
            <p className="text-foreground/70 font-medium text-center">Ingresa el código de sala de tu amigo</p>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full text-center text-4xl font-display font-bold tracking-widest py-4 rounded-2xl border-4 border-accent/30 focus:border-accent outline-none bg-white/80 dark:bg-black/20 uppercase text-foreground"
            />
            {error && (
              <div className="flex items-center gap-2 text-error bg-error/10 p-3 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{error}</span>
              </div>
            )}
            <button
              onClick={handleJoinRoom}
              disabled={joinCode.length !== 6 || isLoading}
              className="w-full p-5 rounded-2xl bg-gradient-to-r from-accent to-pink-600 text-white font-bold text-xl shadow-[0_6px_0_#be185d] hover:shadow-[0_3px_0_#be185d] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : '⚔️ Entrar al Duelo'}
            </button>
          </div>
        )}
      </div>

      {/* ── Active Duels Panel ── */}
      <ActiveDuelsPanel />

      {/* ── Competition Leaderboard ── */}
      <CompetitionLeaderboard />
    </motion.div>
  );
}
