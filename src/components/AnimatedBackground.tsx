'use client';

import { useEffect, useRef } from 'react';

interface MathSymbolParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  symbol: string;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  pulse: number;
  pulseSpeed: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: MathSymbolParticle[] = [];

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 200,
    };

    const SYMBOLS = ['×', '+', '÷', '-', '='];
    // Super vibrant, bright Antigravity colors that POP on dark royal blue background
    const COLORS = [
      '#ffffff', // Pure White
      '#fbbf24', // Bright Amber / Gold
      '#38bdf8', // Vibrant Sky Blue
      '#f472b6', // Bright Pink
      '#4ade80', // Neon Emerald
      '#a78bfa', // Light Violet
      '#f87171', // Coral Red
      '#22d3ee', // Cyan
    ];

    const createParticle = (overrideX?: number, overrideY?: number): MathSymbolParticle => {
      return {
        x: overrideX ?? Math.random() * canvas.width,
        y: overrideY ?? Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 36 + 28, // 28px to 64px for maximum visibility!
        symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.35 + 0.60, // 0.60 to 0.95 high opacity
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.035,
        pulse: Math.random() * Math.PI,
        pulseSpeed: Math.random() * 0.035 + 0.015,
      };
    };

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];

      // High density of particles so they are easily noticed
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 6000), 160);
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    };

    const animate = () => {
      // Smooth mouse spring
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Motion physics
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.pulse += p.pulseSpeed;

        // Antigravity Mouse Force Interaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);

          // Push particles away with vortex rotation
          const pushX = Math.cos(angle + Math.PI / 3) * force * 8;
          const pushY = Math.sin(angle + Math.PI / 3) * force * 8;

          p.x -= pushX;
          p.y -= pushY;
          p.rotation += force * 0.15;
        }

        // Screen wrap
        if (p.x < -40) p.x = canvas.width + 40;
        if (p.x > canvas.width + 40) p.x = -40;
        if (p.y < -40) p.y = canvas.height + 40;
        if (p.y > canvas.height + 40) p.y = -40;

        // Render Symbol
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const currentScale = 1 + Math.sin(p.pulse) * 0.15;
        const currentSize = p.size * currentScale;

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.font = `900 ${currentSize}px var(--font-fredoka), system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Vibrant neon glow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;

        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}
