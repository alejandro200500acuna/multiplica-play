'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, User, Lock, AlertCircle, School, GraduationCap, DoorOpen } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

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

  // New fields for schools and classrooms
  const [schools, setSchools] = useState<any[]>([]);
  const [availableClassrooms, setAvailableClassrooms] = useState<any[]>([]);
  const [regSchoolId, setRegSchoolId] = useState('');
  const [regGrade, setRegGrade] = useState('');
  const [regRoomId, setRegRoomId] = useState('');

  const { setUser, setStep } = useStore();

  useEffect(() => {
    const loadSchoolsData = async () => {
      const { data } = await supabase.from('schools').select('*').order('name');
      setSchools(data || []);
    };
    loadSchoolsData();
  }, []);

  useEffect(() => {
    if (regSchoolId && regGrade) {
      const loadRooms = async () => {
        const { data } = await supabase
          .from('classrooms')
          .select('*')
          .eq('school_id', regSchoolId)
          .eq('grade', regGrade)
          .order('room_number');
        setAvailableClassrooms(data || []);
      };
      loadRooms();
    } else {
      setAvailableClassrooms([]);
      setRegRoomId('');
    }
  }, [regSchoolId, regGrade]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          schools(name),
          classrooms(grade)
        `)
        .eq('username', username.trim())
        .eq('password', password)
        .single();

      if (error || !data) {
        setErrorMsg('Usuario o contraseña incorrectos');
        setIsLoading(false);
        return;
      }
      await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', data.id);
      
      const sName = (data.schools as any)?.name || null;
      const grade = (data.classrooms as any)?.grade?.toString() || null;
      
      setUser(data.full_name, data.id, data.role, sName, grade);
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
        last_login: new Date().toISOString(),
        school_id: regSchoolId || null,
        classroom_id: regRoomId || null
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

      // Fetch newly created user with joined data
      const { data: userData } = await supabase
        .from('users')
        .select('*, schools(name), classrooms(grade)')
        .eq('id', data.id)
        .single();

      if (userData) {
        const sName = (userData.schools as any)?.name || null;
        const grade = (userData.classrooms as any)?.grade?.toString() || null;
        setUser(userData.full_name, userData.id, userData.role, sName, grade);
      } else {
        setUser(data.full_name, data.id, data.role);
      }
      
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
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 rounded-3xl text-center shadow-xl max-w-lg mx-auto w-full border-t-4 border-t-primary relative z-10"
      >
        <div className="mb-4"><span className="text-5xl">✖️➗</span></div>
        <h1
          className="text-4xl md:text-5xl font-display font-bold mb-2 title-shadow"
          style={{ 
            WebkitTextStroke: '1.5px white', 
            WebkitTextFillColor: 'transparent',
            backgroundImage: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
            WebkitBackgroundClip: 'text', 
            backgroundClip: 'text' 
          }}
        >
          Multiplica Play
        </h1>
        <p className="text-lg text-foreground/80 font-medium mb-6">
          ¡Aprende y practica las tablas de multiplicar jugando!
        </p>

        {/* Tab switcher */}
        <div className="flex bg-black/20 p-1 rounded-2xl mb-8">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-sm ${mode === 'login' ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-sm ${mode === 'register' ? 'bg-pink-500/20 text-pink-300 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
          >
            Registrarse
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              <div className="min-h-[3rem] mb-6 flex items-center justify-center">
                <AnimatePresence>
                  {username.trim() && (
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }} transition={{ duration: 0.2 }}>
                      <span className="inline-block px-5 py-2 bg-primary/20 text-indigo-100 border border-primary/20 rounded-full text-xl font-display font-bold shadow-sm">
                        ¡Hola, {username.trim()}! 👋
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <form onSubmit={handleStart} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="username" className="font-bold text-foreground/90 ml-2 text-sm uppercase tracking-wider">Usuario</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/60 group-focus-within:text-primary transition-colors"><User className="w-6 h-6" /></div>
                    <input
                      id="username" 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej. juanito123"
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border-4 border-primary/10 focus:border-primary/40 focus:outline-none bg-black/40 text-xl font-bold transition-all shadow-inner placeholder:text-foreground/20"
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-left mb-2">
                  <label htmlFor="password" className="font-bold text-foreground/90 ml-2 text-sm uppercase tracking-wider">Contraseña</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary/60 group-focus-within:text-primary transition-colors"><Lock className="w-6 h-6" /></div>
                    <input
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-6 py-4 rounded-2xl border-4 border-primary/10 focus:border-primary/40 focus:outline-none bg-black/40 text-xl font-bold transition-all shadow-inner placeholder:text-foreground/20"
                      required 
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 text-red-200 bg-red-500/20 p-4 rounded-2xl border border-red-500/20">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                      <span className="font-medium text-sm">{errorMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!username.trim() || !password.trim() || isLoading}
                  className="group relative flex items-center justify-center gap-3 w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-display font-bold text-2xl py-4.5 px-8 rounded-2xl shadow-[0_8px_0_var(--color-primary-dark)] hover:shadow-[0_4px_0_var(--color-primary-dark)] hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? <span className="animate-pulse">Iniciando...</span> : (<>Entrar <LogIn className="w-6 h-6 flex-shrink-0 group-hover:translate-x-1 transition-transform" /></>)}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className="text-foreground/60 text-sm mb-6 font-medium">Crea tu cuenta gratis en segundos.<br />¡Accede de inmediato!</p>

              <form onSubmit={handleRegister} className="flex flex-col gap-5" autoComplete="off">
                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="reg-fullname" className="font-bold text-foreground/90 ml-2 text-xs uppercase tracking-wider">Nombre Completo</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent/60 group-focus-within:text-accent transition-colors"><User className="w-5 h-5" /></div>
                    <input
                      id="reg-fullname" 
                      type="text" 
                      value={regFullname}
                      onChange={(e) => setRegFullname(e.target.value)}
                      placeholder="Ej. Juan Pérez García"
                      autoComplete="off"
                      className="w-full pl-12 pr-6 py-3.5 rounded-2xl border-4 border-accent/10 focus:border-accent/40 focus:outline-none bg-black/40 text-lg font-bold transition-all shadow-inner placeholder:text-foreground/10"
                      required 
                      disabled={isRegistering}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="reg-username" className="font-bold text-foreground/90 ml-2 text-xs uppercase tracking-wider">Usuario</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent/60 group-focus-within:text-accent transition-colors"><User className="w-5 h-5" /></div>
                    <input
                      id="reg-username" 
                      type="text" 
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.replace(/\s/g, ''))}
                      placeholder={regFullname.trim() ? regFullname.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'.') : 'Ej. juan.perez'}
                      autoComplete="off"
                      name="reg-username-field"
                      className="w-full pl-12 pr-6 py-3.5 rounded-2xl border-4 border-accent/10 focus:border-accent/40 focus:outline-none bg-black/40 text-lg font-bold transition-all shadow-inner placeholder:text-foreground/10"
                      required 
                      disabled={isRegistering}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 text-left">
                    <label htmlFor="reg-password" className="font-bold text-foreground/90 ml-2 text-xs uppercase tracking-wider">Contraséña</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent/60 group-focus-within:text-accent transition-colors"><Lock className="w-5 h-5" /></div>
                      <input
                        id="reg-password" 
                        type="password" 
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-4 border-accent/10 focus:border-accent/40 focus:outline-none bg-black/40 text-lg font-bold transition-all shadow-inner placeholder:text-foreground/10"
                        required 
                        disabled={isRegistering}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-left">
                    <label htmlFor="reg-password-confirm" className="font-bold text-foreground/90 ml-2 text-xs uppercase tracking-wider">Repetir</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent/60 group-focus-within:text-accent transition-colors"><Lock className="w-5 h-5" /></div>
                      <input
                        id="reg-password-confirm" 
                        type="password" 
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-4 border-accent/10 focus:border-accent/40 focus:outline-none bg-black/40 text-lg font-bold transition-all shadow-inner placeholder:text-foreground/10"
                        required 
                        disabled={isRegistering}
                      />
                    </div>
                  </div>
                </div>

                {/* School Selection */}
                <div className="flex flex-col gap-2 text-left">
                  <label className="font-bold text-foreground/90 ml-2 text-xs uppercase tracking-wider">Escuela</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent/60 group-focus-within:text-accent transition-colors"><School className="w-5 h-5" /></div>
                    <select
                      value={regSchoolId}
                      onChange={(e) => { setRegSchoolId(e.target.value); setRegGrade(''); setRegRoomId(''); }}
                      className="w-full pl-12 pr-6 py-3.5 rounded-2xl border-4 border-accent/10 focus:border-accent/40 focus:outline-none bg-black/40 text-lg font-bold transition-all shadow-inner appearance-none"
                      required
                      disabled={isRegistering}
                    >
                      <option value="">-- Elige tu Escuela --</option>
                      {schools.map(s => <option key={s.id} value={s.id} className="bg-gray-800">{s.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Grade and Room Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 text-left">
                    <label className="font-bold text-foreground/90 ml-2 text-xs uppercase tracking-wider">Grado</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent/60 group-focus-within:text-accent transition-colors"><GraduationCap className="w-5 h-5" /></div>
                      <select
                        value={regGrade}
                        onChange={(e) => { setRegGrade(e.target.value); setRegRoomId(''); }}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl border-4 border-accent/10 focus:border-accent/40 focus:outline-none bg-black/40 text-lg font-bold transition-all shadow-inner appearance-none disabled:opacity-40"
                        required
                        disabled={isRegistering || !regSchoolId}
                      >
                        <option value="">-- Grado --</option>
                        {['1', '2', '3', '4', '5', '6'].map(g => <option key={g} value={g} className="bg-gray-800">{g}° Grado</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-left">
                    <label className="font-bold text-foreground/90 ml-2 text-xs uppercase tracking-wider">Aula</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-accent/60 group-focus-within:text-accent transition-colors"><DoorOpen className="w-5 h-5" /></div>
                      <select
                        value={regRoomId}
                        onChange={(e) => setRegRoomId(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl border-4 border-accent/10 focus:border-accent/40 focus:outline-none bg-black/40 text-lg font-bold transition-all shadow-inner appearance-none disabled:opacity-40"
                        required
                        disabled={isRegistering || !regGrade || availableClassrooms.length === 0}
                      >
                        <option value="">-- Aula --</option>
                        {availableClassrooms.map(r => (
                          <option key={r.id} value={r.id} className="bg-gray-800">Aula {r.room_number}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {availableClassrooms.length === 0 && regGrade && regSchoolId && (
                  <p className="text-xs text-amber-400 font-bold ml-2 italic">Aún no hay aulas creadas para este grado.</p>
                )}

                <AnimatePresence>
                  {regError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2 text-red-200 bg-red-500/20 p-4 rounded-xl border border-red-500/20">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                      <span className="font-medium text-sm">{regError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!regFullname.trim() || !regUsername.trim() || !regPassword.trim() || !regPasswordConfirm.trim() || isRegistering}
                  className="group relative flex items-center justify-center gap-3 w-full bg-gradient-to-r from-accent to-pink-600 hover:from-pink-600 hover:to-accent text-white font-display font-bold text-2xl py-4 px-8 rounded-2xl shadow-[0_8px_0_#be185d] hover:shadow-[0_4px_0_#be185d] hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistering ? <span className="animate-pulse">Creando...</span> : <>¡Registrarme! 🎮</>}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
