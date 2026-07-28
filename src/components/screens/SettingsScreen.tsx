'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Settings, User, School, Volume2, VolumeX, Shield, Check, Save, Lock, Sparkles, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsScreen() {
  const { studentName, schoolName, grade, role, setUser } = useStore();
  const [nameInput, setNameInput] = useState(studentName || '');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(nameInput.trim() || 'Grace Stanley', 'custom-id', role || 'student', schoolName || undefined, grade || undefined);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto flex flex-col gap-6 text-slate-800"
    >
      {/* Header Panel */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-inner">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ajustes de Perfil</h2>
          <p className="text-xs text-slate-500 font-medium">Personaliza tu experiencia de aprendizaje y preferencias</p>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Profile Details */}
          <div className="flex flex-col gap-4 pb-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Datos del Estudiante
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Nombre del Estudiante</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white text-sm font-bold text-slate-900 outline-none transition-all"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Rol de Cuenta</label>
                <input
                  type="text"
                  value={role ? role.toUpperCase() : 'ESTUDIANTE'}
                  disabled
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100 border-2 border-slate-200 text-sm font-bold text-slate-500 capitalize outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Escuela Registrada</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <School className="w-4 h-4 text-indigo-500" />
                  <span>{schoolName || 'Escuela Multiplica Play'}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Grado Escolar</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>{grade ? `${grade}° Grado` : '3° Grado'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex flex-col gap-4 pb-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Preferencias de la App
            </h3>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Efectos de Sonido</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Sonidos interactivos en juegos y respuestas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Notificaciones de Desafíos</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Alertas de nuevos duelos y lecciones del día</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${notificationsEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            {savedMsg ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                <Check className="w-4 h-4" /> ¡Cambios guardados con éxito!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-100"
            >
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
