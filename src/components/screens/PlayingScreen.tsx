'use client';

import { useStore } from '@/store/useStore';
import RapidFire from '@/components/games/RapidFire';
import TrueFalse from '@/components/games/TrueFalse';
import CompleteInput from '@/components/games/CompleteInput';
import MathMemory from '@/components/games/MathMemory';

export default function PlayingScreen() {
  const { currentGame } = useStore();

  switch (currentGame) {
    case 'RAPID':
      return <RapidFire />;
    case 'TRUE_FALSE':
      return <TrueFalse />;
    case 'INPUT':
      return <CompleteInput />;
    case 'MEMORY':
      return <MathMemory />;
    default:
      return null;
  }
}
