'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, PenLine, CheckCircle2, RotateCcw, ChevronRight, Home } from 'lucide-react';
import { useStore } from '@/store/useStore';

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

export default function LearnTablesScreen() {
  const { setStep } = useStore();
  const [mode, setMode] = useState<Mode>('select');
  const [selectedTable, setSelectedTable] = useState(2);
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''));
  const [results, setResults] = useState<Result[]>(Array(10).fill('pending'));
  const [isComplete, setIsComplete] = useState(false);
  const [verified, setVerified] = useState(false);
  const [quizOrder, setQuizOrder] = useState<number[]>(MULTIPLIERS);

  const openTable = (t: number) => {
    setSelectedTable(t);
    setAnswers(Array(10).fill(''));
    setResults(Array(10).fill('pending'));
    setVerified(false);
    setIsComplete(false);
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

  // Map quiz row index → correct answer using shuffled order
  const getCorrectAnswer = (rowIndex: number) => selectedTable * quizOrder[rowIndex];

  const handleAnswerChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // numbers only
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  };

  const verify = () => {
    const newResults: Result[] = answers.map((ans, i) => {
      const correct = getCorrectAnswer(i);
      return parseInt(ans) === correct ? 'correct' : 'wrong';
    });
    setResults(newResults);
    setVerified(true);

    if (newResults.every(r => r === 'correct')) {
      setIsComplete(true);
    } else {
      // Clear wrong answers for retry
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
      className="w-full max-w-2xl mx-auto flex flex-col gap-6"
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

      {/* SELECT MODE: Table picker */}
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
                className={`bg-gradient-to-br ${TABLE_COLORS[t]} text-white font-display font-bold text-4xl py-6 rounded-2xl shadow-lg flex flex-col items-center gap-1`}
              >
                {t}
                <span className="text-xs font-sans font-medium opacity-80">Ver tabla</span>
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

      {/* STUDY MODE: Full table display */}
      {mode === 'study' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 md:p-8 rounded-3xl shadow-xl"
        >
          <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 mb-6 text-white`}>
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
                  className="flex items-center justify-between bg-white/20 rounded-xl px-5 py-3 font-display font-bold text-xl"
                >
                  <span>{selectedTable} × {m}</span>
                  <span className="opacity-50">=</span>
                  <span className="text-2xl">{selectedTable * m}</span>
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
          <div className="flex gap-2 justify-center mb-6 text-2xl">
            {Array(10).fill('😊').join(' ')}
          </div>

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
