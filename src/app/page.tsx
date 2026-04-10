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

export default function Home() {
  const currentStep = useStore((state) => state.currentStep);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <main className="flex-1 min-h-screen" />;

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
      </div>
    </main>
  );
}
