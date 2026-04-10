'use client';

import { motion } from 'framer-motion';
import { BookOpen, Swords, LogOut, GraduationCap } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ModeSelectScreen() {
  const { studentName, setStep, resetAll } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8"
    >
      {/* Header */}
      <div className="glass-panel p-6 md:p-10 rounded-3xl w-full text-center shadow-2xl border-t-4 border-t-primary relative">
        <button
          onClick={() => resetAll()}
          className="absolute top-5 left-5 p-2 rounded-full hover:bg-error/10 text-error transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="w-7 h-7" />
        </button>

        <span className="text-5xl mb-4 block">🎮</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white title-shadow uppercase tracking-wide mb-2">
          ¡Hola, {studentName}!
        </h2>
        <p className="text-foreground/70 font-medium text-lg">¿Cómo quieres jugar hoy?</p>
      </div>

      {/* Mode buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        {/* Práctica Individual */}
        <motion.button
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep('TABLES')}
          className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-5 shadow-xl border-t-4 border-t-primary hover:border-t-secondary transition-all duration-300 group cursor-pointer text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">Práctica Individual</h3>
            <p className="text-foreground/70 font-medium leading-snug">
              Practica las tablas a tu ritmo, elige el juego y mejora tu puntuación.
            </p>
          </div>
          <span className="mt-2 px-6 py-2 bg-primary text-white font-bold rounded-full text-sm shadow-[0_4px_0_var(--color-primary-dark)] group-hover:shadow-[0_2px_0_var(--color-primary-dark)] group-hover:translate-y-[2px] transition-all">
            ¡Jugar ahora! →
          </span>
        </motion.button>

        {/* Competencia - Live! */}
        <motion.button
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep('COMPETITION_LOBBY')}
          className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-5 shadow-xl border-t-4 border-t-accent hover:border-t-pink-400 transition-all duration-300 group cursor-pointer text-center relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 bg-gradient-to-r from-accent to-pink-500 text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
            ⚡ ¡En Vivo!
          </div>

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Swords className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">Competencia</h3>
            <p className="text-foreground/70 font-medium leading-snug">
              Desafía a otros estudiantes en tiempo real y demuestra quién es el más rápido.
            </p>
          </div>
          <span className="mt-2 px-6 py-2 bg-accent text-white font-bold rounded-full text-sm shadow-[0_4px_0_#be185d] group-hover:shadow-[0_2px_0_#be185d] group-hover:translate-y-[2px] transition-all">
            ¡Competir ahora! ⚔️
          </span>
        </motion.button>

        {/* Aprender las Tablas */}
        <motion.button
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep('LEARN_TABLES')}
          className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-5 shadow-xl border-t-4 border-t-emerald-400 hover:border-t-green-400 transition-all duration-300 group cursor-pointer text-center relative overflow-hidden"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">Aprender las Tablas</h3>
            <p className="text-foreground/70 font-medium leading-snug">
              Estudia la tabla completa y luego ponla a prueba con ejercicios interactivos.
            </p>
          </div>
          <span className="mt-2 px-6 py-2 bg-emerald-500 text-white font-bold rounded-full text-sm shadow-[0_4px_0_#065f46] group-hover:shadow-[0_2px_0_#065f46] group-hover:translate-y-[2px] transition-all">
            ¡Estudiar ahora! 📚
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
