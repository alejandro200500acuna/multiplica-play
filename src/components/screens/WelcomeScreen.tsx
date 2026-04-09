'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, LogIn, User, Lock, AlertCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';

function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 150
    };

    const symbols = ['×', '÷', '+', '-', '='];
    const colors = ['#8b5cf6', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b'];

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      symbol: string;
      color: string;
      density: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = Math.random() * 15 + 10;
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.density = (Math.random() * 30) + 1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5;
        ctx.font = `bold ${this.size}px "Outfit", sans-serif`;
        ctx.fillText(this.symbol, this.x, this.y);
      }

      update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 20;
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 20;
          }
        }
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = Math.min((canvas.width * canvas.height) / 8000, 200);
      for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    handleResize();
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
      className="fixed inset-0 pointer-events-none z-0 mix-blend-screen"
    />
  );
}

export default function WelcomeScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { setUser, setStep } = useStore();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password)
        .single();
        
      if (error || !data) {
        setErrorMsg('Usuario o contraseña incorrectos');
        setIsLoading(false);
        return;
      }
      
      setUser(data.full_name, data.id, data.role);
      
      if (data.role === 'admin') {
        setStep('ADMIN_DASHBOARD');
      } else {
        setStep('TABLES');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <CanvasBackground />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 rounded-3xl text-center shadow-xl max-w-lg mx-auto w-full border-t-4 border-t-primary relative z-10"
      >
        <div className="mb-4">
          <span className="text-5xl">✖️➗</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2 title-shadow" style={{WebkitTextStroke: '1.5px white', WebkitTextFillColor: 'transparent'}}>
          Multiplica Play
        </h1>
        <p className="text-lg text-foreground/80 font-medium mb-8">
          ¡Aprende y practica las tablas de multiplicar jugando!
        </p>

        <form onSubmit={handleStart} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 text-left">
            <label htmlFor="username" className="font-bold text-foreground ml-2">
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                <User className="w-6 h-6" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. juanito123"
                className="w-full pl-12 pr-6 py-3 rounded-2xl border-4 border-primary/20 focus:border-primary focus:outline-none bg-white/80 dark:bg-black/20 text-xl font-bold transition-all shadow-inner focus:shadow-[0_0_0_4px_var(--color-primary-100)]"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-left mb-2">
            <label htmlFor="password" className="font-bold text-foreground ml-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-6 py-3 rounded-2xl border-4 border-primary/20 focus:border-primary focus:outline-none bg-white/80 dark:bg-black/20 text-xl font-bold transition-all shadow-inner focus:shadow-[0_0_0_4px_var(--color-primary-100)]"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-error bg-error/10 p-3 rounded-xl mb-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!username.trim() || !password.trim() || isLoading}
            className="group relative flex items-center justify-center gap-3 w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-display font-bold text-2xl py-4 px-8 rounded-2xl shadow-[0_8px_0_var(--color-primary-dark)] hover:shadow-[0_4px_0_var(--color-primary-dark)] hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[0_8px_0_var(--color-primary-dark)] disabled:hover:translate-y-0 mt-2"
          >
            {isLoading ? (
              <span className="animate-pulse">Iniciando...</span>
            ) : (
              <>
                Entrar
                <LogIn className="w-6 h-6 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </>
  );
}
