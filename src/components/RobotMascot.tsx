'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

export type RobotMood = 'wave' | 'happy' | 'think' | 'excited' | 'idle';

interface Props {
  mood?: RobotMood;
  message?: string;
  size?: number;
}

/* ── Speech Bubble ─────────────────────────────────────────────────────────── */
function SpeechBubble({ text }: { text: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.9 }}
        transition={{ duration: 0.25 }}
        className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-xl border border-white/20 relative">
          {text}
          {/* Tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white dark:border-t-gray-900" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Robot SVG ─────────────────────────────────────────────────────────────── */
export default function RobotMascot({ mood = 'idle', message, size = 140 }: Props) {
  const [blink, setBlink] = useState(false);
  const bodyControls = useAnimation();

  // Random blink every 2-4s
  useEffect(() => {
    const cycle = () => {
      const delay = 2000 + Math.random() * 2000;
      setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); cycle(); }, 150);
      }, delay);
    };
    cycle();
  }, []);

  // Body shake on excited
  useEffect(() => {
    if (mood === 'excited') {
      bodyControls.start({
        rotate: [0, -5, 5, -5, 5, -3, 3, 0],
        transition: { duration: 0.6 }
      });
    } else if (mood === 'happy') {
      bodyControls.start({
        scale: [1, 1.06, 1],
        transition: { duration: 0.4 }
      });
    } else {
      bodyControls.start({ rotate: 0, scale: 1 });
    }
  }, [mood, bodyControls]);

  const eyeScaleY = blink ? 0.08 : 1;

  // Arm angle by mood
  const armAngle =
    mood === 'wave' || mood === 'excited' ? -40 :
    mood === 'happy' ? -20 :
    mood === 'think' ? 30 :
    -10;

  return (
    <div className="relative flex flex-col items-center select-none" style={{ width: size }}>
      {/* Speech bubble */}
      {message && <SpeechBubble text={message} />}

      {/* Floating container */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div animate={bodyControls}>
          <svg
            width={size}
            height={size * 1.15}
            viewBox="0 0 100 115"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* ── Base / Platform ── */}
            <ellipse cx="50" cy="108" rx="28" ry="6" fill="#c8eae8" opacity="0.6" />

            {/* ── Body ── */}
            <ellipse cx="50" cy="80" rx="28" ry="26" fill="white" />
            <ellipse cx="50" cy="80" rx="28" ry="26" fill="url(#bodyGrad)" />

            {/* Teal belly accent */}
            <path d="M35 84 Q50 97 65 84 Q65 100 50 102 Q35 100 35 84Z" fill="#5ecfca" opacity="0.35" />

            {/* Name plate */}
            <rect x="37" y="85" width="26" height="10" rx="4" fill="#e8f8f7" opacity="0.8" />
            <text x="50" y="93" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#2ba8a0" fontFamily="system-ui">Profe</text>

            {/* ── Left arm (static) ── */}
            <g transform="translate(22,72) rotate(20)">
              <ellipse cx="0" cy="10" rx="7" ry="11" fill="white" />
              <ellipse cx="0" cy="10" rx="7" ry="11" fill="#5ecfca" opacity="0.3" />
              <ellipse cx="0" cy="20" rx="5" ry="5" fill="#5ecfca" opacity="0.5" />
            </g>

            {/* ── Right arm (animated wave) ── */}
            <motion.g
              style={{ originX: '72px', originY: '72px' }}
              animate={{ rotate: mood === 'wave' || mood === 'excited' ? [armAngle, armAngle + 15, armAngle] : armAngle }}
              transition={
                mood === 'wave' || mood === 'excited'
                  ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.4 }
              }
            >
              <g transform={`translate(72,72) rotate(${armAngle})`}>
                <ellipse cx="0" cy="10" rx="7" ry="11" fill="white" />
                <ellipse cx="0" cy="10" rx="7" ry="11" fill="#5ecfca" opacity="0.3" />
                <ellipse cx="0" cy="20" rx="5" ry="5" fill="#5ecfca" opacity="0.5" />
              </g>
            </motion.g>

            {/* ── Head ── */}
            <ellipse cx="50" cy="42" rx="26" ry="24" fill="white" />
            <ellipse cx="50" cy="42" rx="26" ry="24" fill="url(#headGrad)" />

            {/* Teal head accent top */}
            <ellipse cx="50" cy="19" rx="10" ry="5" fill="#5ecfca" />
            <ellipse cx="50" cy="17" rx="7" ry="3.5" fill="#40b8b2" />

            {/* Face plate (black oval) */}
            <ellipse cx="50" cy="44" rx="19" ry="17" fill="#1a1a2e" />
            <ellipse cx="50" cy="44" rx="19" ry="17" fill="url(#faceGloss)" />

            {/* ── Eyes ── */}
            {/* Left eye glow */}
            <ellipse cx="42" cy="44" rx="8" ry="8" fill="#00aaff" opacity="0.18" />
            {/* Right eye glow */}
            <ellipse cx="58" cy="44" rx="8" ry="8" fill="#00aaff" opacity="0.18" />

            {/* Left eye */}
            <motion.ellipse
              cx="42" cy="44" rx="5.5"
              animate={{ ry: blink ? 0.5 : (mood === 'think' ? 3.5 : 5.5) }}
              transition={{ duration: 0.1 }}
              fill="#00ccff"
            />
            {/* Left eye shine */}
            {!blink && <ellipse cx="44" cy="41.5" rx="1.5" ry="1.5" fill="white" opacity="0.6" />}

            {/* Right eye */}
            <motion.ellipse
              cx="58" cy="44" rx="5.5"
              animate={{ ry: blink ? 0.5 : (mood === 'think' ? 3.5 : 5.5) }}
              transition={{ duration: 0.1 }}
              fill="#00ccff"
            />
            {/* Right eye shine */}
            {!blink && <ellipse cx="60" cy="41.5" rx="1.5" ry="1.5" fill="white" opacity="0.6" />}

            {/* ── Mouth expression ── */}
            {mood === 'happy' || mood === 'excited' || mood === 'wave' ? (
              /* Smile */
              <path d="M43 55 Q50 61 57 55" stroke="#00ccff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            ) : mood === 'think' ? (
              /* Thinking line */
              <path d="M44 56 Q50 54 56 56" stroke="#00ccff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            ) : (
              /* Neutral small smile */
              <path d="M45 56 Q50 59 55 56" stroke="#00ccff" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            )}

            {/* Teal cheek dots */}
            <circle cx="35" cy="50" r="3" fill="#5ecfca" opacity="0.5" />
            <circle cx="65" cy="50" r="3" fill="#5ecfca" opacity="0.5" />

            {/* ── Defs ── */}
            <defs>
              <radialGradient id="bodyGrad" cx="40%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#d0f0ee" />
              </radialGradient>
              <radialGradient id="headGrad" cx="40%" cy="25%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#d0f0ee" />
              </radialGradient>
              <radialGradient id="faceGloss" cx="35%" cy="20%" r="60%">
                <stop offset="0%" stopColor="#2a2a4a" />
                <stop offset="100%" stopColor="#0d0d1a" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
