'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, LogOut, AlertTriangle, Check, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const TABLES = Array.from({ length: 11 }, (_, i) => i + 2);

export default function TablesScreen() {
  const { studentName, selectedTables: initialSelected, setTables, setStep, resetAll } = useStore();
  const [selected, setSelected] = useState<number[]>(initialSelected);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleTable = (num: number) => {
    setSelected(prev => 
      prev.includes(num) ? prev.filter(t => t !== num) : [...prev, num]
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    setTables(selected);
    setStep('GAMES');
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    resetAll();
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6 md:p-10 rounded-3xl w-full max-w-2xl mx-auto shadow-2xl border-t-4 border-t-secondary relative z-10"
      >
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="p-2 rounded-full hover:bg-error/10 text-error transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-8 h-8" />
          </button>
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-center pr-10 title-shadow text-white uppercase tracking-wider">
              ¡HOLA {studentName}! 👋
            </h2>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-xl font-bold bg-secondary/80 text-white dark:bg-secondary/30 inline-block px-6 py-2 rounded-full shadow-md">
            ¿Qué tablas quieres practicar hoy?
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-10">
          {TABLES.map(num => {
            const isSelected = selected.includes(num);
            return (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleTable(num)}
                className={cn(
                  "relative h-20 md:h-24 rounded-2xl font-display font-bold text-3xl flex items-center justify-center transition-all duration-300",
                  isSelected 
                    ? "bg-secondary text-white shadow-[0_6px_0_var(--color-secondary-dark)] translate-y-[-4px]" 
                    : "bg-white/80 dark:bg-black/20 text-foreground border-2 border-dashed border-gray-300 hover:border-secondary hover:bg-secondary/10"
                )}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                {num}
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-success to-emerald-600 text-white font-display font-bold text-2xl py-4 rounded-2xl shadow-[0_8px_0_#047857] hover:shadow-[0_4px_0_#047857] hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[0_8px_0_#047857] disabled:translate-y-0"
        >
          Elegir Juego
          <ArrowRight className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
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
                <h3 className="text-2xl font-bold mb-2 text-foreground">¿Cerrar sesión?</h3>
                <p className="text-foreground/70 mb-8 font-medium">
                  Estás a punto de salir. Tendrás que iniciar sesión de nuevo para volver a jugar.
                </p>
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Cancelar
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-error text-white hover:bg-red-700 shadow-[0_4px_0_#991b1b] hover:translate-y-[2px] hover:shadow-[0_2px_0_#991b1b] transition-all"
                  >
                    <Check className="w-5 h-5" />
                    Salir
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
