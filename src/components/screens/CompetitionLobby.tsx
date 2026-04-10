'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, LogIn, Copy, Check, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

interface Question { num1: number; num2: number; answer: number; }

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

  // Watch for player2 joining the created room
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg mx-auto">
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
    </motion.div>
  );
}
