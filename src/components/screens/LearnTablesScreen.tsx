'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, PenLine, CheckCircle2, RotateCcw, ChevronRight, Home, ClipboardList, Star, CalendarDays } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

type Mode = 'select' | 'study' | 'quiz';
type Result = 'pending' | 'correct' | 'wrong';

const TABLES = Array.from({ length: 9 }, (_, i) => i + 2); // 2-10
const MULTIPLIERS = Array.from({ length: 10 }, (_, i) => i + 1); // 1-10

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const TABLE_COLORS: Record<number, string> = {
  2:  'from-violet-500 to-purple-700',
  3:  'from-blue-500 to-blue-700',
  4:  'from-cyan-500 to-teal-700',
  5:  'from-green-500 to-emerald-700',
  6:  'from-yellow-500 to-amber-600',
  7:  'from-orange-500 to-red-600',
  8:  'from-pink-500 to-rose-700',
  9:  'from-fuchsia-500 to-pink-700',
  10: 'from-indigo-500 to-violet-700',
};

interface PracticeRecord {
  id: string;
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
  practiced_at: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('es-CR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function ScoreBadge({ pct }: { pct: number }) {
  const color =
    pct === 100 ? 'bg-green-500 text-white' :
    pct >= 70   ? 'bg-yellow-400 text-yellow-900' :
                  'bg-red-400 text-white';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  );
}

export default function LearnTablesScreen() {
  const { setStep, studentId } = useStore();
  const [mode, setMode] = useState<Mode>('select');
  const [selectedTable, setSelectedTable] = useState(2);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''));
  const [results, setResults] = useState<Result[]>(Array(10).fill('pending'));
  const [isComplete, setIsComplete] = useState(false);
  const [verified, setVerified] = useState(false);
  const [quizOrder, setQuizOrder] = useState<number[]>(MULTIPLIERS);
  const [showHistory, setShowHistory] = useState(false);

  // Records per table
  const [tableRecords, setTableRecords] = useState<PracticeRecord[]>([]);
  const [lastScores, setLastScores] = useState<Record<number, number | null>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load last score for each table (for the grid badges)
  const loadLastScores = useCallback(async () => {
    if (!studentId) return;
    const scores: Record<number, number | null> = {};
    // Fetch max 1 record per table in one query
    const { data } = await supabase
      .from('table_practice_records')
      .select('table_number, score_percentage, practiced_at')
      .eq('student_id', studentId)
      .order('practiced_at', { ascending: false });

    if (data) {
      for (const row of data) {
        if (!(row.table_number in scores)) {
          scores[row.table_number] = row.score_percentage;
        }
      }
    }
    setLastScores(scores);
  }, [studentId]);

  // Load history for the current table
  const loadTableRecords = useCallback(async (tableNum: number) => {
    if (!studentId) return;
    const { data } = await supabase
      .from('table_practice_records')
      .select('id, score_percentage, correct_answers, total_questions, practiced_at')
      .eq('student_id', studentId)
      .eq('table_number', tableNum)
      .order('practiced_at', { ascending: false })
      .limit(20);
    setTableRecords(data ?? []);
  }, [studentId]);

  useEffect(() => {
    loadLastScores();
  }, [loadLastScores]);

  useEffect(() => {
    if (mode !== 'select') {
      loadTableRecords(selectedTable);
    }
  }, [mode, selectedTable, loadTableRecords]);

  const openTable = (t: number) => {
    setSelectedTable(t);
    setAnswers(Array(10).fill(''));
    setResults(Array(10).fill('pending'));
    setVerified(false);
    setIsComplete(false);
    setShowHistory(false);
    setMode('study');
  };

  const startQuiz = () => {
    setQuizOrder(shuffle(MULTIPLIERS));
    setAnswers(Array(10).fill(''));
    setResults(Array(10).fill('pending'));
    setVerified(false);
    setIsComplete(false);
    setMode('quiz');
  };

  const getCorrectAnswer = (rowIndex: number) => selectedTable * quizOrder[rowIndex];

  const handleAnswerChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  };

  const saveRecord = async (correctCount: number) => {
    if (!studentId) return;
    setIsSaving(true);
    const pct = Math.round((correctCount / 10) * 100);
    await supabase.from('table_practice_records').insert({
      student_id: studentId,
      table_number: selectedTable,
      score_percentage: pct,
      correct_answers: correctCount,
      total_questions: 10,
    });
    setIsSaving(false);
    // Refresh caches
    await loadLastScores();
    await loadTableRecords(selectedTable);
  };

  const verify = () => {
    const newResults: Result[] = answers.map((ans, i) => {
      const correct = getCorrectAnswer(i);
      return parseInt(ans) === correct ? 'correct' : 'wrong';
    });
    setResults(newResults);
    setVerified(true);

    const correctCount = newResults.filter(r => r === 'correct').length;

    if (newResults.every(r => r === 'correct')) {
      setIsComplete(true);
      saveRecord(correctCount);
    } else {
      // Save partial attempt record
      saveRecord(correctCount);
      setTimeout(() => {
        const retryAnswers = answers.map((ans, i) =>
          newResults[i] === 'correct' ? ans : ''
        );
        setAnswers(retryAnswers);
        setVerified(false);
      }, 1800);
    }
  };

  const goNextTable = () => {
    const nextTable = selectedTable < 10 ? selectedTable + 1 : 2;
    openTable(nextTable);
    setMode('study');
  };

  const correctCount = results.filter(r => r === 'correct').length;
  const color = TABLE_COLORS[selectedTable] ?? 'from-primary to-secondary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full mx-auto flex flex-col gap-6 ${
        mode === 'study' ? 'max-w-4xl' : 'max-w-2xl'
      }`}
    >
      {/* Header */}
      <div className="glass-panel p-5 md:p-6 rounded-3xl shadow-xl border-t-4 border-t-secondary flex items-center gap-4">
        <button
          onClick={() => mode === 'select' ? setStep('MODE_SELECT') : setMode(mode === 'quiz' ? 'study' : 'select')}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-bold">
            {mode === 'select' ? '📚 Aprender las Tablas' :
             mode === 'study' ? `Tabla del ${selectedTable}` :
             `Repasando: Tabla del ${selectedTable}`}
          </h2>
          <p className="text-foreground/60 text-sm font-medium">
            {mode === 'select' ? 'Elige una tabla para estudiar' :
             mode === 'study' ? 'Estudia bien antes de repasar' :
             'Escribe los resultados correctamente'}
          </p>
        </div>
      </div>

      {/* SELECT MODE: Table picker with last-score badges */}
      {mode === 'select' && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-xl">
          <p className="text-center font-bold text-foreground/70 mb-6">¿Qué tabla quieres aprender hoy?</p>
          <div className="grid grid-cols-3 gap-4">
            {TABLES.map(t => (
              <motion.button
                key={t}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openTable(t)}
                className={`bg-gradient-to-br ${TABLE_COLORS[t]} text-white font-display font-bold text-4xl py-6 rounded-2xl shadow-lg flex flex-col items-center gap-1 relative`}
              >
                {t}
                <span className="text-xs font-sans font-medium opacity-80">Ver tabla</span>
                {lastScores[t] !== undefined && lastScores[t] !== null && (
                  <div className="absolute top-2 right-2">
                    <ScoreBadge pct={lastScores[t]!} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
          <button
            onClick={() => setStep('MODE_SELECT')}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
          >
            <Home className="w-5 h-5" /> Volver al Menú
          </button>
        </div>
      )}

      {/* STUDY MODE: Two-column layout — table | history */}
      {mode === 'study' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start"
        >
          {/* LEFT: Table display */}
          <div className="glass-panel p-6 rounded-3xl shadow-xl">
            <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 mb-5 text-white`}>
              <h3 className="text-center text-2xl font-display font-bold mb-4 opacity-90">
                Tabla del {selectedTable}
              </h3>
              <div className="flex flex-col gap-2">
                {MULTIPLIERS.map(m => (
                  <motion.div
                    key={m}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: m * 0.05 }}
                    className="flex items-center justify-between bg-white/20 rounded-xl px-4 py-2.5 font-display font-bold text-lg"
                  >
                    <span>{selectedTable} × {m}</span>
                    <span className="opacity-50">=</span>
                    <span className="text-xl">{selectedTable * m}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMode('select')}
                className="flex-1 py-3 rounded-2xl font-bold bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Cambiar
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={startQuiz}
                className={`flex-1 py-3 rounded-2xl font-bold bg-gradient-to-r ${color} text-white shadow-lg flex items-center justify-center gap-2`}
              >
                <PenLine className="w-5 h-5" /> ¡Repasar!
              </motion.button>
            </div>
          </div>

          {/* RIGHT: Practice history always visible */}
          <div className="flex flex-col gap-3">
            <div className="glass-panel rounded-3xl shadow-xl overflow-hidden">
              <div className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r ${color} text-white`}>
                <ClipboardList className="w-5 h-5 opacity-90" />
                <div>
                  <p className="font-display font-bold text-base">Mis Prácticas</p>
                  <p className="text-xs opacity-70">Tabla del {selectedTable}</p>
                </div>
                {tableRecords.length > 0 && (
                  <span className="ml-auto text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    {tableRecords.length} {tableRecords.length === 1 ? 'intento' : 'intentos'}
                  </span>
                )}
              </div>

              {tableRecords.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 px-5 text-center opacity-50">
                  <ClipboardList className="w-10 h-10" />
                  <p className="text-sm font-medium">Aún no hay prácticas registradas</p>
                  <p className="text-xs">Presiona ¡Repasar! para comenzar</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {tableRecords.map((r, idx) => {
                    const isFirst = idx === 0;
                    const pctColor =
                      r.score_percentage === 100 ? 'text-green-400' :
                      r.score_percentage >= 70   ? 'text-yellow-400' :
                                                   'text-red-400';
                    const bgColor =
                      r.score_percentage === 100 ? 'bg-green-500/10' :
                      r.score_percentage >= 70   ? 'bg-yellow-400/10' :
                                                   'bg-red-400/10';
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`px-5 py-3 ${isFirst ? bgColor : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            {isFirst && (
                              <span className="text-[10px] bg-secondary/30 text-secondary font-bold px-1.5 py-0.5 rounded-full">
                                Última
                              </span>
                            )}
                            <span className={`font-display font-bold text-lg ${pctColor}`}>
                              {r.score_percentage}%
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-xs opacity-50">
                            <Star className="w-3 h-3" />
                            {r.correct_answers}/{r.total_questions}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs opacity-40">
                          <CalendarDays className="w-3 h-3" />
                          {formatDate(r.practiced_at)}
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              r.score_percentage === 100 ? 'bg-green-400' :
                              r.score_percentage >= 70   ? 'bg-yellow-400' :
                                                           'bg-red-400'
                            }`}
                            style={{ width: `${r.score_percentage}%` }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* QUIZ MODE: Input fields */}
      {mode === 'quiz' && !isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 md:p-8 rounded-3xl shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setMode('study')}
              className="flex items-center gap-1 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity"
            >
              <Eye className="w-4 h-4" /> Ver tabla
            </button>
            <span className="text-sm font-bold opacity-60">
              {correctCount}/10 correctas
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 mb-6">
            <motion.div
              animate={{ width: `${(correctCount / 10) * 100}%` }}
              className="bg-green-500 h-2 rounded-full transition-all"
            />
          </div>

          <div className="flex flex-col gap-3">
            {quizOrder.map((m, i) => {
              const r = results[i];
              const isCorrectRow = r === 'correct';
              return (
                <motion.div
                  key={m}
                  animate={r === 'wrong' ? { x: [0, -8, 8, -4, 4, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                    isCorrectRow
                      ? 'bg-green-500/10 border-green-500/40'
                      : r === 'wrong'
                      ? 'bg-red-500/10 border-red-500/40'
                      : 'bg-white/30 dark:bg-black/20 border-transparent'
                  }`}
                >
                  <span className="font-display font-bold text-xl min-w-[90px]">
                    {selectedTable} × {m} =
                  </span>
                  <input
                    type="number"
                    value={answers[i]}
                    onChange={e => handleAnswerChange(i, e.target.value)}
                    disabled={isCorrectRow}
                    onKeyDown={e => { if (e.key === 'Enter') verify(); }}
                    className={`w-20 text-center font-display font-bold text-2xl py-1 rounded-xl border-2 outline-none transition-all ${
                      isCorrectRow
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-400 text-green-700 dark:text-green-300'
                        : 'bg-white dark:bg-black/30 border-primary/30 focus:border-primary text-foreground'
                    }`}
                    placeholder="?"
                  />
                  <AnimatePresence>
                    {r !== 'pending' && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="text-3xl flex-shrink-0"
                      >
                        {r === 'correct' ? '😊' : '😢'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={verify}
            disabled={answers.some((a, i) => results[i] !== 'correct' && !a)}
            className={`w-full mt-6 py-4 rounded-2xl font-display font-bold text-xl bg-gradient-to-r ${color} text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            <CheckCircle2 className="w-6 h-6" /> Verificar Respuestas
          </motion.button>

          <button
            onClick={() => setMode('study')}
            className="w-full mt-3 py-3 rounded-2xl font-bold bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Eye className="w-4 h-4" /> Ver la tabla completa
          </button>
        </motion.div>
      )}

      {/* COMPLETE! */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-10 rounded-3xl shadow-2xl text-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8 }}
            className="text-8xl mb-4"
          >
            🏆
          </motion.div>
          <h3 className="text-3xl font-display font-bold mb-2">
            ¡Tabla del {selectedTable} dominada!
          </h3>
          <p className="text-foreground/70 font-medium mb-2">
            ¡Todas las respuestas correctas! 🎉
          </p>
          {isSaving && (
            <p className="text-sm text-foreground/50 mb-2">Guardando registro…</p>
          )}
          <div className="flex gap-2 justify-center mb-6 text-2xl">
            {Array(10).fill('😊').join(' ')}
          </div>

          {/* Show last few records */}
          {tableRecords.length > 0 && (
            <div className="mb-6">
              <HistoryTable records={tableRecords.slice(0, 5)} tableNumber={selectedTable} />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={goNextTable}
              className={`w-full py-4 rounded-2xl font-display font-bold text-lg bg-gradient-to-r ${color} text-white shadow-lg flex items-center justify-center gap-2`}
            >
              Siguiente Tabla <ChevronRight className="w-5 h-5" />
            </motion.button>
            <button
              onClick={() => { setMode('select'); setIsComplete(false); }}
              className="w-full py-3 rounded-2xl font-bold bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Elegir otra tabla
            </button>
            <button
              onClick={() => setStep('MODE_SELECT')}
              className="w-full py-3 rounded-2xl font-bold bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Volver al Menú
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ── History Table subcomponent ─────────────────────────────────────────── */
function HistoryTable({ records, tableNumber }: { records: PracticeRecord[]; tableNumber: number }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 bg-black/5 dark:bg-black/20">
      <div className="flex items-center gap-2 px-4 py-2 bg-white/30 dark:bg-white/5 border-b border-white/20">
        <ClipboardList className="w-4 h-4 opacity-60" />
        <span className="text-sm font-bold opacity-70">Historial — Tabla del {tableNumber}</span>
      </div>
      <div className="divide-y divide-white/10">
        {records.map((r, idx) => {
          const isFirst = idx === 0;
          const pctColor =
            r.score_percentage === 100 ? 'text-green-500' :
            r.score_percentage >= 70   ? 'text-yellow-500' :
                                         'text-red-400';
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`flex items-center justify-between px-4 py-2.5 text-sm ${isFirst ? 'bg-white/10' : ''}`}
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
                <span className="opacity-70">{formatDate(r.practiced_at)}</span>
                {isFirst && (
                  <span className="text-[10px] bg-secondary/30 text-secondary-dark px-1.5 py-0.5 rounded-full font-bold">
                    Última
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="opacity-60">
                  <Star className="w-3 h-3 inline mr-0.5" />
                  {r.correct_answers}/{r.total_questions}
                </span>
                <span className={`font-display font-bold text-base ${pctColor}`}>
                  {r.score_percentage}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
