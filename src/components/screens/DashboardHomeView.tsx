'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { ChevronDown, Mail, Phone, ArrowUpRight, Trophy, Sparkles, Play, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardHomeView() {
  const studentName = useStore((state) => state.studentName);
  const setStep = useStore((state) => state.setStep);

  const displayName = studentName || 'Grace';

  // Circular gauge data
  const progressGauges = [
    { label: 'Estructuras', percent: 92, color: '#4f46e5' },
    { label: 'Multiplicación', percent: 83, color: '#3b82f6' },
    { label: 'Tablas 1-5', percent: 78, color: '#8b5cf6' },
    { label: 'Desafíos 1v1', percent: 97, color: '#10b981' },
  ];

  // Bar chart data
  const barData = [
    { subject: 'Tabla 2-4', value: 85.3 },
    { subject: 'Tabla 5-7', value: 64.7 },
    { subject: 'Tabla 8-9', value: 84.2 },
    { subject: 'Tabla 10-12', value: 45.6 },
    { subject: 'Juegos', value: 43.5 },
    { subject: 'Duelos', value: 74.4 },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      {/* ── 1. Hero / Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 relative overflow-hidden border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between min-h-[170px]"
      >
        <div className="z-10 max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            ¡Hola {displayName}!
          </h2>
          <p className="text-slate-500 font-medium mt-2 text-sm leading-relaxed">
            Tienes <span className="text-indigo-600 font-bold">3 nuevos desafíos</span>. ¡Es un excelente día para practicar y acumular puntos hoy!
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setStep('GAMES')}
              className="bg-[#4f6bf0] hover:bg-[#3b57d8] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Empezar a jugar
            </button>
            <button
              onClick={() => setStep('LEARN_TABLES')}
              className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" /> Ver lecciones
            </button>
          </div>
        </div>

        {/* 3D Illustration */}
        <div className="w-44 h-40 relative flex-shrink-0 mt-4 sm:mt-0 sm:mr-4">
          <Image
            src="/student_3d_banner.png"
            alt="Student 3D Character"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>

      {/* ── 2. Performance (Rendimiento) & My Progress ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rendimiento (Performance Card) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-lg">Rendimiento</h3>
            <button className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors">
              Diciembre <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1">
                95.4
              </div>
              <p className="text-xs text-slate-400 font-medium">Introducción a las tablas</p>
            </div>
            <button
              onClick={() => setStep('TABLES')}
              className="border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 text-xs font-bold px-4 py-2 rounded-full transition-all"
            >
              Todas las tablas
            </button>
          </div>

          {/* Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {barData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.value}
                </span>
                <div className="w-full max-w-[28px] bg-slate-100 rounded-xl h-28 relative overflow-hidden flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${bar.value}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="w-full bg-[#4f6bf0] rounded-xl group-hover:bg-indigo-600 transition-colors"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[50px] text-center">
                  {bar.subject}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mi avance (Circular Progress Rings) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-800 text-lg">Mi avance</h3>
            <button className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors">
              Diciembre <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Gauge Rings Grid */}
          <div className="grid grid-cols-2 gap-4 my-auto py-2">
            {progressGauges.map((gauge, index) => {
              const radius = 28;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (gauge.percent / 100) * circumference;

              return (
                <div key={index} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100/80">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke="#e2e8f0"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, delay: index * 0.15 }}
                        cx="32"
                        cy="32"
                        r={radius}
                        stroke={gauge.color}
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute font-extrabold text-xs text-slate-800">
                      {gauge.percent}%
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 mt-2 text-center truncate max-w-[90px]">
                    {gauge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 3. Mentores / Profesores Vinculados ── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">Profesores vinculados</h3>
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Ver todo</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Teacher 1 */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm border-2 border-white shadow-sm">
                MJ
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Mary Johnson <span className="text-[11px] text-slate-400 font-normal">(mentora)</span></h4>
                <p className="text-xs text-slate-400">Ciencias y Matemáticas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 flex items-center justify-center transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Teacher 2 */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-sm border-2 border-white shadow-sm">
                JB
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">James Brown</h4>
                <p className="text-xs text-slate-400">Lógica y Algoritmos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 flex items-center justify-center transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
