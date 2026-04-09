import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

export interface Question {
  id: string;
  num1: number;
  num2: number;
  correctAnswer: number;
  options?: number[];
}

export function useGameLogic(gameType: string, totalQuestions: number = 10) {
  const { selectedTables, setResults, setStep, studentId } = useStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [gameAnswers, setGameAnswers] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    // Generate questions
    const allCombinations: {num1: number, num2: number}[] = [];
    selectedTables.forEach(table => {
      // 1 to 10 as requested
      for (let i = 1; i <= 10; i++) {
        allCombinations.push({ num1: table, num2: i });
      }
    });

    // Shuffle combinations optimally
    for (let i = allCombinations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCombinations[i], allCombinations[j]] = [allCombinations[j], allCombinations[i]];
    }

    const newQuestions: Question[] = [];
    for (let i = 0; i < totalQuestions; i++) {
      const combo = allCombinations[i % allCombinations.length];
      const num1 = combo.num1;
      const num2 = combo.num2;
      const correctAnswer = num1 * num2;
      
      let options: number[] | undefined;
      
      // Generate options for rapid fire
      if (gameType === 'RAPID') {
        const optionSet = new Set<number>();
        optionSet.add(correctAnswer);
        while(optionSet.size < 4) {
          const fakeNum1 = selectedTables[Math.floor(Math.random() * selectedTables.length)];
          const fakeNum2 = Math.floor(Math.random() * 10) + 1; // 1 to 10
          const fakeAnswer = fakeNum1 * fakeNum2;
          // Add some randomness if needed just to fill options
          if (fakeAnswer !== correctAnswer && fakeAnswer > 0) {
            optionSet.add(fakeAnswer);
          } else {
            const randomOffset = Math.floor(Math.random() * 8) + 1;
            const fakeVal = correctAnswer + (Math.random() > 0.5 ? randomOffset : -randomOffset);
            optionSet.add(Math.max(1, fakeVal)); // avoid negative or zero
          }
        }
        options = Array.from(optionSet).sort(() => Math.random() - 0.5);
      }
      
      newQuestions.push({
        id: Math.random().toString(),
        num1,
        num2,
        correctAnswer,
        options,
      });
    }
    
    setQuestions(newQuestions);
    setStartTime(Date.now());
  }, []);

  const handleAnswer = (userAnswer: number, isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectCount(c => c + 1);
    } else {
      setWrongCount(c => c + 1);
    }
    
    // Save answer temporarily
    const q = questions[currentIndex];
    setGameAnswers(prev => [...prev, {
      question: `${q.num1} x ${q.num2}`,
      correct_answer: q.correctAnswer,
      user_answer: userAnswer,
      is_correct: isCorrect
    }]);

    if (currentIndex + 1 >= totalQuestions) {
      finishGame(correctCount + (isCorrect ? 1 : 0), wrongCount + (isCorrect ? 0 : 1));
    } else {
      setCurrentIndex(c => c + 1);
    }
  };

  const finishGame = async (finalCorrect: number, finalWrong: number) => {
    setIsFinished(true);
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const percentage = Math.round((finalCorrect / totalQuestions) * 100);
    const passed = percentage >= 50;
    
    let isNewRecord = false;

    try {
      if (studentId && studentId !== 'fallback-id') {
        // Fetch previous best time for this game where student passed
        const { data: previousBest } = await supabase
          .from('practice_sessions')
          .select('duration_seconds')
          .eq('student_id', studentId)
          .eq('game_type', gameType)
          .eq('passed', true)
          .order('duration_seconds', { ascending: true })
          .limit(1)
          .single();

        if (passed) {
          if (!previousBest || (previousBest.duration_seconds > 0 && durationSeconds < previousBest.duration_seconds)) {
            isNewRecord = true;
          }
        }

        const { data: sessionData, error: sessionError } = await supabase
          .from('practice_sessions')
          .insert({
            student_id: studentId,
            tables_selected: selectedTables,
            game_type: gameType,
            score_percentage: percentage,
            correct_answers: finalCorrect,
            wrong_answers: finalWrong,
            passed: passed,
            duration_seconds: durationSeconds
          })
          .select()
          .single();
          
        if (sessionError) throw sessionError;
      }
    } catch (error) {
      console.error("Error saving session", error);
    }

    setResults(finalCorrect, finalWrong, percentage, passed, durationSeconds, isNewRecord);
    setStep('RESULTS');
  };

  return {
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex],
    handleAnswer,
    isFinished
  };
}
