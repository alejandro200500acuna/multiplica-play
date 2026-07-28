'use client';

import React, { useState } from 'react';
import { useStore, Step } from '@/store/useStore';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import {
  LayoutDashboard,
  BookOpen,
  Calendar as CalendarIcon,
  Target,
  MessageSquare,
  Award,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Gamepad2,
  Swords,
  ShieldAlert,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  showCalendarRightPanel?: boolean;
}

export default function DashboardLayout({ children, showCalendarRightPanel = true }: DashboardLayoutProps) {
  const currentStep = useStore((state) => state.currentStep);
  const setStep = useStore((state) => state.setStep);
  const studentName = useStore((state) => state.studentName);
  const role = useStore((state) => state.role);
  const resetAll = useStore((state) => state.resetAll);

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'ES' | 'ENG'>('ES');

  const displayName = studentName || 'Grace Stanley';

  // Navigation Items matching reference design
  const navItems = [
    { id: 'MODE_SELECT', label: 'Inicio', icon: LayoutDashboard, targetStep: 'MODE_SELECT' as Step },
    { id: 'LEARN_TABLES', label: 'Lecciones', icon: BookOpen, targetStep: 'LEARN_TABLES' as Step },
    { id: 'TABLES', label: 'Tablas', icon: Target, targetStep: 'TABLES' as Step },
    { id: 'GAMES', label: 'Juegos', icon: Gamepad2, targetStep: 'GAMES' as Step },
    { id: 'COMPETITION_LOBBY', label: 'Competencia', icon: Swords, targetStep: 'COMPETITION_LOBBY' as Step },
    { id: 'ADMIN_DASHBOARD', label: 'Rendimiento', icon: Award, targetStep: 'ADMIN_DASHBOARD' as Step },
    { id: 'SETTINGS', label: 'Ajustes', icon: Settings, targetStep: 'SETTINGS' as Step },
  ];

  // Helper to determine if menu item is active
  const isNavActive = (itemStep: Step) => {
    if (itemStep === 'MODE_SELECT' && (currentStep === 'MODE_SELECT' || currentStep === 'WELCOME')) return true;
    if (itemStep === 'GAMES' && (currentStep === 'GAMES' || currentStep === 'PLAYING' || currentStep === 'RESULTS')) return true;
    if (itemStep === 'COMPETITION_LOBBY' && (currentStep === 'COMPETITION_LOBBY' || currentStep === 'COMPETITION_GAME' || currentStep === 'COMPETITION_RESULT')) return true;
    return currentStep === itemStep;
  };

  return (
    <div className="min-h-screen bg-transparent p-2 sm:p-4 md:p-6 flex items-center justify-center font-sans relative z-10">
      <div className="w-full max-w-[1530px] bg-[#f4f6fb] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[92vh]">
        
        {/* ── MOBILE HEADER BAR ── */}
        <div className="md:hidden bg-[#425cc7] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            Smart Play
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* ── LEFT SIDEBAR (DARK BLUE / SLATE INDIGO) ── */}
        <aside
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-[#425cc7] text-white flex-shrink-0 flex flex-col justify-between py-6 pl-6 pr-0 z-20`}
        >
          <div>
            {/* Logo Brand Header */}
            <div className="flex items-center gap-3 px-2 mb-8 pr-6">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight leading-tight">Smart</h1>
                <p className="text-[10px] text-indigo-200 font-semibold uppercase tracking-wider">Multiplica Play</p>
              </div>
            </div>

            {/* Navigation Options */}
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const active = isNavActive(item.targetStep);
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setStep(item.targetStep);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3.5 px-4 py-3 text-sm transition-all duration-200 ${
                      active
                        ? 'sidebar-pill-active text-[#3b59c8] font-bold shadow-sm'
                        : 'text-indigo-100/80 hover:text-white hover:bg-white/10 rounded-l-full pr-4'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-[#3b59c8]' : 'text-indigo-200'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Log Out Button at Bottom */}
          <div className="pr-6 pt-6">
            <button
              onClick={() => {
                resetAll();
                setStep('WELCOME');
              }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-indigo-200 hover:text-rose-200 hover:bg-white/10 rounded-2xl w-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT CONTAINER & TOPBAR ── */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 min-w-0 overflow-y-auto max-h-[92vh]">
          {/* Top Bar Header */}
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            {/* Search Input Box */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar lecciones, juegos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200/80 rounded-full py-2.5 pl-11 pr-4 text-xs text-slate-700 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
              />
            </div>

            {/* Topbar User & Actions Widget */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'ES' ? 'ENG' : 'ES')}
                className="flex items-center gap-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-600 px-3 py-2 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
              >
                <span>{language}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Message & Notification Icon */}
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm relative">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm relative">
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2 ring-2 ring-white" />
                </button>
              </div>

              {/* User Profile Avatar & Name */}
              <div className="flex items-center gap-3 pl-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs border-2 border-white shadow-md">
                  {displayName.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <h4 className="text-xs font-bold text-slate-800 leading-tight">{displayName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium capitalize">{role || 'Estudiante'}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Dashboard Layout Content (Split View with Calendar Widget if requested) */}
          <div className="flex-1 flex flex-col xl:flex-row gap-6">
            <div className="flex-1 min-w-0">
              {children}
            </div>

            {/* Right Side Calendar & Events Panel */}
            {showCalendarRightPanel && <CalendarWidget />}
          </div>
        </main>

      </div>
    </div>
  );
}
