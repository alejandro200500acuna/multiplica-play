'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameLayout from './GameLayout';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

interface Card {
  id: string;
  type: 'operation' | 'result';
  value: string;
  matchId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MathMemory() {
  const { selectedTables, setResults, setStep, studentId } = useStore();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const TOTAL_PAIRS = 6; // 12 cards total

  useEffect(() => {
    const newCards: Card[] = [];
    
    for (let i = 0; i < TOTAL_PAIRS; i++) {
      const num1 = selectedTables[Math.floor(Math.random() * selectedTables.length)];
      const num2 = Math.floor(Math.random() * 11) + 2;
      const result = num1 * num2;
      
      const matchId = `pair-${i}`;
      
      newCards.push({
        id: `op-${i}`,
        type: 'operation',
        value: `${num1} × ${num2}`,
        matchId,
        isFlipped: false,
        isMatched: false
      });
      
      newCards.push({
        id: `res-${i}`,
        type: 'result',
        value: result.toString(),
        matchId,
        isFlipped: false,
        isMatched: false
      });
    }
    
    // Shuffle
    setCards(newCards.sort(() => Math.random() - 0.5));
  }, []);

  const handleCardClick = (id: string) => {
    if (flippedIds.length === 2) return; // Prevent flipping more than 2
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;
    
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
    
    if (newFlipped.length === 2) {
      setAttempts(a => a + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = cards.find(c => c.id === secondId)!;
      
      if (firstCard.matchId === secondCard.matchId) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true, isFlipped: false } 
              : c
          ));
          setFlippedIds([]);
          const newMatches = matches + 1;
          setMatches(newMatches);
          
          if (newMatches === TOTAL_PAIRS) {
            finishGame(TOTAL_PAIRS, attempts + 1 - TOTAL_PAIRS); // Approximate score math
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false } 
              : c
          ));
          setFlippedIds([]);
        }, 1200);
      }
    }
  };

  const finishGame = async (correct: number, wrong: number) => {
    const percentage = Math.round((correct / (correct + wrong)) * 100);
    const passed = percentage >= 50;
    
    setResults(correct, wrong, percentage, passed);
    
    try {
      if (studentId && studentId !== 'fallback-id') {
        await supabase
          .from('practice_sessions')
          .insert({
            student_id: studentId,
            tables_selected: selectedTables,
            game_type: 'MEMORY',
            score_percentage: percentage,
            correct_answers: correct,
            wrong_answers: wrong,
            passed: passed
          });
      }
    } catch (error) {
      console.error(error);
    }
    
    setTimeout(() => {
      setStep('RESULTS');
    }, 1000);
  };

  return (
    <GameLayout title="🧩 Memoria Matemática" current={matches} total={TOTAL_PAIRS} colorClass="text-accent">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full h-full my-auto">
        {cards.map(card => (
          <motion.div
            key={card.id}
            className="w-full aspect-[4/3] rounded-2xl cursor-pointer"
            onClick={() => handleCardClick(card.id)}
            whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
            style={{ perspective: 1000 }}
          >
            <motion.div
              className="w-full h-full relative"
              initial={false}
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Back of card (hidden when flipped) */}
              <div 
                className={`absolute inset-0 backface-hidden bg-accent rounded-2xl flex items-center justify-center shadow-[0_6px_0_#be185d] border-4 border-white/20`}
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-4xl text-white/50 opacity-40 font-display">?</span>
              </div>
              
              {/* Front of card (visible when flipped) */}
              <div 
                className={`absolute inset-0 backface-hidden rounded-2xl flex items-center justify-center border-4 shadow-md bg-white text-3xl md:text-4xl font-display font-bold ${
                  card.isMatched 
                    ? 'border-green-400 text-green-500 opacity-50 shadow-[0_6px_0_#4ade80]' 
                    : card.type === 'operation'
                      ? 'border-primary text-primary-dark shadow-[0_6px_0_var(--color-primary)]'
                      : 'border-secondary text-secondary-dark shadow-[0_6px_0_var(--color-secondary)]'
                }`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {card.value}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </GameLayout>
  );
}
