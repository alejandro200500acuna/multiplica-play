'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import WelcomeScreen from '@/components/screens/WelcomeScreen';
import ModeSelectScreen from '@/components/screens/ModeSelectScreen';
import TablesScreen from '@/components/screens/TablesScreen';
import GamesScreen from '@/components/screens/GamesScreen';
import PlayingScreen from '@/components/screens/PlayingScreen';
import ResultsScreen from '@/components/screens/ResultsScreen';
import AdminDashboard from '@/components/screens/AdminDashboard';
import CompetitionLobby from '@/components/screens/CompetitionLobby';
import CompetitionGame from '@/components/screens/CompetitionGame';
import CompetitionResult from '@/components/screens/CompetitionResult';
import LearnTablesScreen from '@/components/screens/LearnTablesScreen';
import RobotMascot, { RobotMood } from '@/components/RobotMascot';
import { motion, AnimatePresence } from 'framer-motion';

interface RobotConfig { mood: RobotMood; message: string; }

const ROBOT_BY_STEP: Record<string, RobotConfig> = {
  WELCOME:           { mood: 'wave',    message: '¡Bienvenido a Multiplica Play! 👋' },
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
};

// Screens where the robot is hidden (too complex / full-width)
const HIDDEN_ON = new Set(['PLAYING', 'COMPETITION_GAME', 'ADMIN_DASHBOARD']);

export default function Home() {
  const currentStep = useStore((state) => state.currentStep);
  const passed = useStore((state) => state.passed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <main className="flex-1 min-h-screen" />;

  // Override result mood based on pass/fail
  const robotConfig: RobotConfig =
    currentStep === 'RESULTS'
      ? passed
        ? { mood: 'excited', message: '¡Increíble, lo lograste! 🏆' }
        : { mood: 'think',   message: 'Sigue intentando, mejorarás 💪' }
      : ROBOT_BY_STEP[currentStep] ?? { mood: 'idle', message: '¡Aquí estoy! 🤖' };

  const showRobot = !HIDDEN_ON.has(currentStep);

  return (
    <main className="flex-1 flex flex-col min-h-screen p-4 md:p-8">
      <div className="w-full mx-auto flex-1 flex flex-col justify-center relative items-center">
        {currentStep === 'WELCOME' && <WelcomeScreen />}
        {currentStep === 'MODE_SELECT' && <ModeSelectScreen />}
        {currentStep === 'ADMIN_DASHBOARD' && <div className="w-full"><AdminDashboard /></div>}
        {currentStep === 'TABLES' && <TablesScreen />}
        {currentStep === 'GAMES' && <div className="w-full max-w-6xl"><GamesScreen /></div>}
        {currentStep === 'PLAYING' && <PlayingScreen />}
        {currentStep === 'RESULTS' && <ResultsScreen />}
        {currentStep === 'COMPETITION_LOBBY' && <CompetitionLobby />}
        {currentStep === 'COMPETITION_GAME' && <div className="w-full max-w-2xl"><CompetitionGame /></div>}
        {currentStep === 'COMPETITION_RESULT' && <CompetitionResult />}
        {currentStep === 'LEARN_TABLES' && <div className="w-full max-w-4xl"><LearnTablesScreen /></div>}
      </div>

      {/* ── Floating Robot — fixed bottom-right ── */}
      <AnimatePresence>
        {showRobot && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 80, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-none"
          >
            <RobotMascot
              mood={robotConfig.mood}
              message={robotConfig.message}
              size={120}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
