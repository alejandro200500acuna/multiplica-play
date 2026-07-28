'use client';

import React from 'react';
import { Calendar as CalendarIcon, Clock, ChevronDown, MoreVertical } from 'lucide-react';

export default function CalendarWidget() {
  return (
    <aside className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-6">
      {/* Calendar & Timeline Panel */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              Calendario
            </h3>
            <p className="text-xs text-slate-400 font-medium">5 eventos hoy</p>
          </div>
          <button className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors">
            Hoy <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Timeline items */}
        <div className="flex flex-col gap-3 relative pl-12 border-l border-dashed border-slate-200 ml-3 py-1">
          {/* Active Highlight Event */}
          <div className="relative">
            <span className="absolute -left-16 top-2 text-xs font-semibold text-slate-400">10:00</span>
            <div className="bg-[#4f6bf0] text-white p-3.5 rounded-2xl shadow-md shadow-indigo-200">
              <h4 className="font-bold text-sm">Lección de Multiplicación</h4>
              <p className="text-[11px] opacity-90 font-medium flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> 8:45 - 10:30 · Lección 21
              </p>
            </div>
          </div>

          {/* Regular Timeline Events */}
          <div className="relative mt-2">
            <span className="absolute -left-16 top-2 text-xs font-semibold text-slate-400">11:00</span>
            <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-100 transition-colors">
              <h4 className="font-semibold text-slate-700 text-sm">Tabla del 7 y 8</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">11:00 - 11:40 · Lección 23</p>
            </div>
          </div>

          <div className="relative mt-2">
            <span className="absolute -left-16 top-2 text-xs font-semibold text-slate-400">12:00</span>
            <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-100 transition-colors">
              <h4 className="font-semibold text-slate-700 text-sm">Taller de Robótica</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">12:00 - 12:45 · Lección 23</p>
            </div>
          </div>

          <div className="relative mt-2">
            <span className="absolute -left-16 top-2 text-xs font-semibold text-slate-400">13:30</span>
            <div className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-100 transition-colors">
              <h4 className="font-semibold text-slate-700 text-sm">Duelo de Razonamiento</h4>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">13:45 - 14:30 · Lección 21</p>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos Eventos */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">Próximos eventos</h3>
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Ver todo</button>
        </div>

        {/* Event Card 1 */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-sm transition-all">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-inner">
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">Gran Torneo &quot;Robot Fest 2026&quot;</h4>
            <p className="text-[10px] text-slate-400 font-medium mt-1">📅 14 Dic 2026 · 12:00 pm</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Event Card 2 */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-sm transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-900 text-emerald-300 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-inner">
            🎮
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">Webinar Herramientas Minecraft</h4>
            <p className="text-[10px] text-slate-400 font-medium mt-1">📅 21 Dic 2026 · 11:00 pm</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
