'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
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

    const mouse = { x: -1000, y: -1000, radius: 150 };
    const symbols = ['×', '÷', '+', '-', '='];
    const colors = ['#8b5cf6', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b'];

    class Particle {
      x: number; y: number; baseX: number; baseY: number;
      size: number; symbol: string; color: string; density: number;

      constructor(x: number, y: number) {
        this.x = x; this.y = y; this.baseX = x; this.baseY = y;
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
          if (this.x !== this.baseX) { let dx = this.x - this.baseX; this.x -= dx / 20; }
          if (this.y !== this.baseY) { let dy = this.y - this.baseY; this.y -= dy / 20; }
        }
        this.draw();
      }
    }

    const init = () => {
      particles = [];
      const numberOfParticles = Math.min((canvas.width * canvas.height) / 8000, 200);
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) particles[i].update();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); };
    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };

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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 mix-blend-screen" />;
}

export default function WelcomeScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Register state
  const [regFullname, setRegFullname] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const { setUser, setStep } = useStore();

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('users').select('*')
        .eq('username', username.trim())
        .eq('password', password)
        .single();
      if (error || !data) {
        setErrorMsg('Usuario o contraseña incorrectos');
        setIsLoading(false);
        return;
      }
      await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', data.id);
      setUser(data.full_name, data.id, data.role);
      if (data.role === 'admin' || data.role === 'profesor') {
        setStep('ADMIN_DASHBOARD');
      } else {
        setStep('MODE_SELECT');
      }
    } catch (err) {
      console.error('Error starting session:', err);
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regFullname.trim() || !regPassword.trim() || !regUsername.trim()) return;
    if (regUsername.trim().length < 3) {
      setRegError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setRegError('Las contraseñas no coinciden.');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    setIsRegistering(true);
    try {

      const { data, error } = await supabase.from('users').insert([{
        full_name: regFullname.trim(),
        username: regUsername.trim().toLowerCase(),
        password: regPassword.trim(),
        role: 'student',
        last_login: new Date().toISOString()
      }]).select().single();

      if (error) {
        if (error.code === '23505') {
          setRegError('Ese nombre de usuario ya está en uso. Elige otro.');
        } else {
          setRegError('Error al crear la cuenta. Intenta de nuevo.');
        }
        setIsRegistering(false);
        return;
      }
      setUser(data.full_name, data.id, data.role);
      setStep('MODE_SELECT');
    } catch (err) {
      setRegError('Error inesperado. Intenta de nuevo.');
      setIsRegistering(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMsg('');
    setRegError('');
  };

  return (
    <>
      <CanvasBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 rounded-3xl text-center shadow-xl max-w-lg mx-auto w-full border-t-4 border-t-primary relative z-10"
      >
        <div className="mb-4"><span className="text-5xl">✖️➗</span></div>
        <h1
          className="text-4xl md:text-5xl font-display font-bold mb-2 title-shadow"
          style={{ WebkitTextStroke: '1.5px white', WebkitTextFillColor: 'transparent',
            backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
            WebkitBackgroundClip: 'text', backgroundClip: 'text' }}
        >
          Multiplica Play
        </h1>
        <p className="text-lg text-foreground/80 font-medium mb-6">
          ¡Aprende y practica las tablas de multiplicar jugando!
        </p>

        {/* Tab switcher */}
        <div className="flex bg-black/10 dark:bg-white/10 p-1 rounded-2xl mb-6">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all text-sm ${mode === 'login' ? 'bg-white dark:bg-black/50 text-primary shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all text-sm ${mode === 'register' ? 'bg-white dark:bg-black/50 text-accent shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Registrarse
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              <div className="min-h-[3rem] mb-4 flex items-center justify-center">
                <AnimatePresence>
                  {username.trim() && (
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }} transition={{ duration: 0.2 }}>
                      <span className="inline-block px-5 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary-100 border border-primary/20 rounded-full text-xl font-display font-bold shadow-sm">
                        ¡Hola, {username.trim()}! 👋
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form onSubmit={handleStart} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="username" className="font-bold text-foreground ml-2">Usuario</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary"><User className="w-6 h-6" /></div>
                    <input
                      id="username" type="text" value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej. juanito123"
                      className="w-full pl-12 pr-6 py-3 rounded-2xl border-4 border-primary/20 focus:border-primary focus:outline-none bg-white/80 dark:bg-black/20 text-xl font-bold transition-all shadow-inner"
                      required disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-left mb-2">
                  <label htmlFor="password" className="font-bold text-foreground ml-2">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary"><Lock className="w-6 h-6" /></div>
                    <input
                      id="password" type="password" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-6 py-3 rounded-2xl border-4 border-primary/20 focus:border-primary focus:outline-none bg-white/80 dark:bg-black/20 text-xl font-bold transition-all shadow-inner"
                      required disabled={isLoading}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 text-error bg-error/10 p-3 rounded-xl mb-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm">{errorMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!username.trim() || !password.trim() || isLoading}
                  className="group relative flex items-center justify-center gap-3 w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-display font-bold text-2xl py-4 px-8 rounded-2xl shadow-[0_8px_0_var(--color-primary-dark)] hover:shadow-[0_4px_0_var(--color-primary-dark)] hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? <span className="animate-pulse">Iniciando...</span> : (<>Entrar <LogIn className="w-6 h-6 flex-shrink-0 group-hover:translate-x-1 transition-transform" /></>)}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className="text-foreground/70 text-sm mb-5">Crea tu cuenta gratis en segundos.<br />No necesitas activarla, ¡accede de inmediato!</p>

              <form onSubmit={handleRegister} className="flex flex-col gap-4" autoComplete="off">
                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="reg-fullname" className="font-bold text-foreground ml-2">Nombre Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent"><User className="w-6 h-6" /></div>
                    <input
                      id="reg-fullname" type="text" value={regFullname}
                      onChange={(e) => setRegFullname(e.target.value)}
                      placeholder="Ej. Juan Pérez García"
                      autoComplete="off"
                      className="w-full pl-12 pr-6 py-3 rounded-2xl border-4 border-accent/20 focus:border-accent focus:outline-none bg-white/80 dark:bg-black/20 text-lg font-bold transition-all shadow-inner"
                      required disabled={isRegistering}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="reg-username" className="font-bold text-foreground ml-2">Nombre de Usuario</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent"><User className="w-5 h-5" /></div>
                    <input
                      id="reg-username" type="text" value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.replace(/\s/g, ''))}
                      placeholder={regFullname.trim() ? regFullname.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'.') : 'Ej. juan.perez'}
                      autoComplete="off"
                      name="reg-username-field"
                      className="w-full pl-12 pr-6 py-3 rounded-2xl border-4 border-accent/20 focus:border-accent focus:outline-none bg-white/80 dark:bg-black/20 text-lg font-bold transition-all shadow-inner"
                      required disabled={isRegistering}
                    />
                  </div>
                  <p className="text-xs opacity-60 ml-2">Este será tu nombre de acceso. Sin espacios.</p>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="reg-password" className="font-bold text-foreground ml-2">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent"><Lock className="w-6 h-6" /></div>
                    <input
                      id="reg-password" type="password" value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full pl-12 pr-6 py-3 rounded-2xl border-4 border-accent/20 focus:border-accent focus:outline-none bg-white/80 dark:bg-black/20 text-lg font-bold transition-all shadow-inner"
                      required disabled={isRegistering}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="reg-password-confirm" className="font-bold text-foreground ml-2">Confirmar Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent"><Lock className="w-6 h-6" /></div>
                    <input
                      id="reg-password-confirm" type="password" value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      placeholder="Repite tu contraseña"
                      className="w-full pl-12 pr-6 py-3 rounded-2xl border-4 border-accent/20 focus:border-accent focus:outline-none bg-white/80 dark:bg-black/20 text-lg font-bold transition-all shadow-inner"
                      required disabled={isRegistering}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {regError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 text-error bg-error/10 p-3 rounded-xl">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm">{regError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!regFullname.trim() || !regUsername.trim() || !regPassword.trim() || !regPasswordConfirm.trim() || isRegistering}
                  className="group relative flex items-center justify-center gap-3 w-full bg-gradient-to-r from-accent to-pink-600 hover:from-pink-600 hover:to-accent text-white font-display font-bold text-2xl py-4 px-8 rounded-2xl shadow-[0_8px_0_#be185d] hover:shadow-[0_4px_0_#be185d] hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isRegistering ? <span className="animate-pulse">Creando cuenta...</span> : <>¡Registrarme! 🎮</>}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
