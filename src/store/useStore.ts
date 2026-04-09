import { create } from 'zustand';

export type Step = 'WELCOME' | 'TABLES' | 'GAMES' | 'PLAYING' | 'RESULTS' | 'ADMIN_DASHBOARD';
export type GameType = 'RAPID' | 'TRUE_FALSE' | 'INPUT' | 'MEMORY' | null;

interface GameState {
  currentStep: Step;
  studentName: string;
  studentId: string | null;
  role: 'student' | 'admin' | null;
  selectedTables: number[];
  currentGame: GameType;
  scorePercentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  passed: boolean;
  
  setStep: (step: Step) => void;
  setUser: (name: string, id: string, role: string) => void;
  setTables: (tables: number[]) => void;
  setGame: (game: GameType) => void;
  setResults: (correct: number, wrong: number, percentage: number, passed: boolean) => void;
  resetGame: () => void;
  resetAll: () => void;
}

export const useStore = create<GameState>((set) => ({
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
  
  setStep: (step) => set({ currentStep: step }),
  setUser: (name, id, role) => set({ studentName: name, studentId: id, role: role as any }),
  setTables: (tables) => set({ selectedTables: tables }),
  setGame: (game) => set({ currentGame: game }),
  setResults: (correct, wrong, percentage, passed) => 
    set({ correctAnswers: correct, wrongAnswers: wrong, scorePercentage: percentage, passed }),
  resetGame: () => set({ currentStep: 'GAMES', currentGame: null, scorePercentage: 0, correctAnswers: 0, wrongAnswers: 0, passed: false }),
  resetAll: () => set({ currentStep: 'WELCOME', studentName: '', studentId: null, role: null, selectedTables: [], currentGame: null, scorePercentage: 0, correctAnswers: 0, wrongAnswers: 0, passed: false }),
}));
