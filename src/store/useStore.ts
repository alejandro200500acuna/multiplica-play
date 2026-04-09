import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Step = 'WELCOME' | 'TABLES' | 'GAMES' | 'PLAYING' | 'RESULTS' | 'ADMIN_DASHBOARD';
export type GameType = 'RAPID' | 'TRUE_FALSE' | 'INPUT' | 'MEMORY' | null;

interface GameState {
  currentStep: Step;
  studentName: string;
  studentId: string | null;
  role: 'student' | 'admin' | 'profesor' | null;
  selectedTables: number[];
  currentGame: GameType;
  scorePercentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  passed: boolean;
  timeTaken: number;
  isNewRecord: boolean;
  
  setStep: (step: Step) => void;
  setUser: (name: string, id: string, role: string) => void;
  setTables: (tables: number[]) => void;
  setGame: (game: GameType) => void;
  setResults: (correct: number, wrong: number, percentage: number, passed: boolean, timeTaken?: number, isNewRecord?: boolean) => void;
  resetGame: () => void;
  resetAll: () => void;
}

export const useStore = create<GameState>()(
  persist(
    (set) => ({
      currentStep: 'WELCOME',
      studentName: '',
      studentId: null,
      role: null,
      selectedTables: [],
      currentGame: null,
      scorePercentage: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      passed: false,
      timeTaken: 0,
      isNewRecord: false,
      
      setStep: (step) => set({ currentStep: step }),
      setUser: (name, id, role) => set({ studentName: name, studentId: id, role: role as any }),
      setTables: (tables) => set({ selectedTables: tables }),
      setGame: (game) => set({ currentGame: game }),
      setResults: (correct, wrong, percentage, passed, timeTaken = 0, isNewRecord = false) => 
        set({ correctAnswers: correct, wrongAnswers: wrong, scorePercentage: percentage, passed, timeTaken, isNewRecord }),
      resetGame: () => set({ currentStep: 'GAMES', currentGame: null, scorePercentage: 0, correctAnswers: 0, wrongAnswers: 0, passed: false, timeTaken: 0, isNewRecord: false }),
      resetAll: () => set({ currentStep: 'WELCOME', studentName: '', studentId: null, role: null, selectedTables: [], currentGame: null, scorePercentage: 0, correctAnswers: 0, wrongAnswers: 0, passed: false, timeTaken: 0, isNewRecord: false }),
    }),
    {
      name: 'multiplica-play-storage'
    }
  )
);
