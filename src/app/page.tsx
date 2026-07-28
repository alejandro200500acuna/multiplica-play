'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardHomeView from '@/components/screens/DashboardHomeView';
import WelcomeScreen from '@/components/screens/WelcomeScreen';
import TablesScreen from '@/components/screens/TablesScreen';
import GamesScreen from '@/components/screens/GamesScreen';
import PlayingScreen from '@/components/screens/PlayingScreen';
import ResultsScreen from '@/components/screens/ResultsScreen';
import AdminDashboard from '@/components/screens/AdminDashboard';
import CompetitionLobby from '@/components/screens/CompetitionLobby';
import CompetitionGame from '@/components/screens/CompetitionGame';
import CompetitionResult from '@/components/screens/CompetitionResult';
import LearnTablesScreen from '@/components/screens/LearnTablesScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';
import RobotMascot, { RobotMood } from '@/components/RobotMascot';
import { motion, AnimatePresence } from 'framer-motion';

interface RobotConfig { mood: RobotMood; message: string; }

const ROBOT_BY_STEP: Record<string, RobotConfig> = {
  WELCOME:           { mood: 'wave',    message: '¡Bienvenido a Smart Play! 👋' },
  MODE_SELECT:       { mood: 'wave',    message: '¡Hola! ¿Qué jugamos hoy? 😊' },
  TABLES:            { mood: 'excited', message: '¡Perfecto, vamos a estudiar! 🎯' },
  GAMES:             { mood: 'happy',   message: '¡Elige tu juego y gana! 🎮' },
  PLAYING:           { mood: 'think',   message: '¡Concéntrate, tú puedes! 🧠' },
  RESULTS:           { mood: 'happy',   message: '¡Ya terminaste, felicidades! 🏆' },
  LEARN_TABLES:      { mood: 'think',   message: 'Estudia con calma, sin prisa 📚' },
  COMPETITION_LOBBY: { mood: 'excited', message: '¡A competir! ¿Estás listo? ⚔️' },
  COMPETITION_GAME:  { mood: 'excited', message: '¡Dale, eres el mejor! 🔥' },
  COMPETITION_RESULT:{ mood: 'happy',   message: '¡Qué duelo más emocionante! 🎉' },
  ADMIN_DASHBOARD:   { mood: 'wave',    message: 'Panel de administración 🛠️' },
  SETTINGS:          { mood: 'think',   message: 'Ajustes y configuración ⚙️' },
};

const HIDDEN_ON = new Set(['PLAYING', 'COMPETITION_GAME', 'ADMIN_DASHBOARD']);

export default function Home() {
  const currentStep = useStore((state) => state.currentStep);
  const studentName = useStore((state) => state.studentName);
  const passed = useStore((state) => state.passed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <main className="flex-1 min-h-screen" />;

  // If user is not logged in or on WELCOME screen, render standalone login screen
  if (!studentName || currentStep === 'WELCOME') {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center p-4 font-sans relative z-10">
        <WelcomeScreen />
      </main>
    );
  }

  const robotConfig: RobotConfig =
    currentStep === 'RESULTS'
      ? passed
        ? { mood: 'excited', message: '¡Increíble, lo lograste! 🏆' }
        : { mood: 'think',   message: 'Sigue intentando, mejorarás 💪' }
      : ROBOT_BY_STEP[currentStep] ?? { mood: 'idle', message: '¡Aquí estoy! 🤖' };

  const showRobot = !HIDDEN_ON.has(currentStep);
  const showCalendarPanel = currentStep === 'MODE_SELECT' || currentStep === 'GAMES';

  return (
    <DashboardLayout showCalendarRightPanel={showCalendarPanel}>
      <div className="w-full h-full flex flex-col justify-center items-center">
        {currentStep === 'MODE_SELECT' && <DashboardHomeView />}
        {currentStep === 'ADMIN_DASHBOARD' && <div className="w-full"><AdminDashboard /></div>}
        {currentStep === 'SETTINGS' && <div className="w-full"><SettingsScreen /></div>}
        {currentStep === 'TABLES' && <TablesScreen />}
        {currentStep === 'GAMES' && <div className="w-full max-w-6xl"><GamesScreen /></div>}
        {currentStep === 'PLAYING' && <PlayingScreen />}
        {currentStep === 'RESULTS' && <ResultsScreen />}
        {currentStep === 'COMPETITION_LOBBY' && <CompetitionLobby />}
        {currentStep === 'COMPETITION_GAME' && <div className="w-full max-w-2xl"><CompetitionGame /></div>}
        {currentStep === 'COMPETITION_RESULT' && <CompetitionResult />}
        {currentStep === 'LEARN_TABLES' && <div className="w-full max-w-4xl"><LearnTablesScreen /></div>}
      </div>

      {/* ── Floating Mascot ── */}
      <AnimatePresence>
        {showRobot && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 80, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed bottom-8 right-8 z-50 pointer-events-none"
          >
            <RobotMascot
              mood={robotConfig.mood}
              message={robotConfig.message}
              size={110}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}


