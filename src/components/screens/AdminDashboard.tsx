'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { UserPlus, Users, LogOut, Loader2, Play, RefreshCw, Trophy, Clock, Trash2, BookOpen, AlertTriangle, X, Check, KeyRound, UserX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const { resetAll, role } = useStore();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New student form
  const [newFullname, setNewFullname] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [selectedGame, setSelectedGame] = useState<'RAPID' | 'TRUE_FALSE' | 'INPUT' | 'MEMORY'>('RAPID');

  // Clean practice records state
  const [cleanStudentId, setCleanStudentId] = useState('');
  const [cleanTableNum, setCleanTableNum] = useState<number | 'all'>(2);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanMsg, setCleanMsg] = useState('');
  const [showCleanConfirm, setShowCleanConfirm] = useState(false);
  const [studentRecordCounts, setStudentRecordCounts] = useState<Record<number, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  // Change password modal
  const [pwTarget, setPwTarget] = useState<{ id: string; name: string } | null>(null);
  const [newPw, setNewPw] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  // Delete user modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    let query = supabase
      .from('users')
      .select('*, practice_sessions(count)')
      .order('created_at', { ascending: false });
      
    if (role === 'profesor') {
      query = query.eq('role', 'student');
    }
    
    const { data } = await query;
    if (data) {
      setStudents(data);
    }
    setIsLoading(false);
  };

  const fetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    const { data } = await supabase
      .from('practice_sessions')
      .select('score_percentage, duration_seconds, game_type, student_id, users!inner(full_name, role)')
      .eq('game_type', selectedGame)
      .eq('passed', true) 
      .eq('users.role', 'student') 
      .order('score_percentage', { ascending: false })
      .order('duration_seconds', { ascending: true })
      .limit(100);

    if (data) {
      const uniqueStudents = new Map();
      data.forEach(session => {
        if (!uniqueStudents.has(session.student_id)) {
          uniqueStudents.set(session.student_id, {
            ...session,
            full_name: (session.users as any).full_name
          });
        }
      });
      setLeaderboard(Array.from(uniqueStudents.values()).slice(0, 5));
    } else {
      setLeaderboard([]);
    }
    setIsLoadingLeaderboard(false);
  };

  // Load record counts per table for selected clean-student
  const loadStudentRecordCounts = async (sid: string) => {
    if (!sid) { setStudentRecordCounts({}); return; }
    setIsLoadingCounts(true);
    const { data } = await supabase
      .from('table_practice_records')
      .select('table_number')
      .eq('student_id', sid);
    if (data) {
      const counts: Record<number, number> = {};
      for (let t = 2; t <= 10; t++) counts[t] = 0;
      data.forEach(r => { counts[r.table_number] = (counts[r.table_number] || 0) + 1; });
      setStudentRecordCounts(counts);
    }
    setIsLoadingCounts(false);
  };

  const handleCleanStudentChange = (sid: string) => {
    setCleanStudentId(sid);
    setCleanMsg('');
    setShowCleanConfirm(false);
    loadStudentRecordCounts(sid);
  };

  const handleCleanConfirm = async () => {
    if (!cleanStudentId) return;
    setIsCleaning(true);
    setCleanMsg('');
    let query = supabase
      .from('table_practice_records')
      .delete()
      .eq('student_id', cleanStudentId);
    if (cleanTableNum !== 'all') {
      query = query.eq('table_number', cleanTableNum);
    }
    const { error } = await query;
    if (error) {
      setCleanMsg('❌ Error al limpiar registros.');
    } else {
      const label = cleanTableNum === 'all' ? 'todas las tablas' : `tabla del ${cleanTableNum}`;
      setCleanMsg(`✅ Registros de ${label} eliminados correctamente.`);
      loadStudentRecordCounts(cleanStudentId);
    }
    setIsCleaning(false);
    setShowCleanConfirm(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedGame]);

  const handleChangePassword = async () => {
    if (!pwTarget || !newPw.trim()) return;
    setIsChangingPw(true);
    setPwMsg('');
    const { error } = await supabase
      .from('users')
      .update({ password: newPw.trim() })
      .eq('id', pwTarget.id);
    if (error) {
      setPwMsg('❌ Error al cambiar la contraseña.');
    } else {
      setPwMsg('✅ Contraseña actualizada correctamente.');
      fetchStudents();
      setTimeout(() => { setPwTarget(null); setPwMsg(''); setNewPw(''); }, 1500);
    }
    setIsChangingPw(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', deleteTarget.id);
    if (!error) {
      fetchStudents();
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullname || !newUsername || !newPassword) return;
    
    setIsCreating(true);
    setCreateMsg('');
    
    try {
      const { error } = await supabase.from('users').insert([{
        full_name: newFullname.trim(),
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: newUserRole
      }]);
      
      if (error) {
        if (error.code === '23505') {
          setCreateMsg('❌ Ese usuario ya existe.');
        } else {
          setCreateMsg('❌ Error al crear estudiante.');
        }
      } else {
        setCreateMsg('✅ ¡Estudiante creado con éxito!');
        setNewFullname('');
        setNewUsername('');
        setNewPassword('');
        fetchStudents(); // refresh list
      }
    } catch (err) {
      setCreateMsg('❌ Error inesperado.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full flex justify-center py-10"
    >
      <div className="w-full max-w-6xl glass-panel p-6 md:p-10 rounded-3xl shadow-2xl border-t-4 border-t-primary">
        <div className="flex justify-between items-center mb-10 border-b border-black/10 dark:border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {role === 'profesor' ? 'Panel del Profesor' : 'Panel de Administración'}
              </h2>
              <p className="text-foreground/70 font-medium">Gestión de estudiantes y progreso</p>
            </div>
          </div>
          <button
            onClick={() => resetAll()}
            className="flex items-center gap-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 px-6 py-3 rounded-full font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Salir
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Create user */}
          <div className="lg:col-span-1">
            <div className="bg-white/50 dark:bg-black/30 p-6 rounded-3xl shadow-inner border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold">Nuevo Estudiante</h3>
              </div>
              
              <form onSubmit={handleCreateStudent} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-bold opacity-80 mb-1 block">Nombre Completo</label>
                  <input
                    type="text"
                    value={newFullname}
                    onChange={(e) => setNewFullname(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ej. Juan Pérez"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-bold opacity-80 mb-1 block">Usuario</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ej. juanito"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-bold opacity-80 mb-1 block">Contraseña</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ej. 1234"
                    required
                  />
                </div>
                {role === 'admin' && (
                  <div>
                    <label className="text-sm font-bold opacity-80 mb-1 block">Tipo de Usuario</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="student">Estudiante</option>
                      <option value="profesor">Profesor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isCreating}
                  className="mt-4 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Estudiante'}
                </button>
                {createMsg && (
                  <p className={`text-center font-bold text-sm mt-2 ${createMsg.includes('✅') ? 'text-success' : 'text-error'}`}>
                    {createMsg}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right Col: List of students */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Play className="w-6 h-6 text-secondary" />
                {role === 'profesor' ? 'Estudiantes Registrados' : 'Usuarios Registrados'} ({students.length})
              </h3>
              <button
                onClick={fetchStudents}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full font-bold transition-all text-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar Lista
              </button>
            </div>
            
            {isLoading && students.length === 0 ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-white/50 dark:bg-black/30 rounded-3xl shadow-inner border border-white/20 overflow-hidden relative">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/5 dark:bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold opacity-70">Nombre</th>
                        <th className="px-6 py-4 text-left font-bold opacity-70">Usuario</th>
                        <th className="px-6 py-4 text-left font-bold opacity-70">Contraseña</th>
                        {role === 'admin' && <th className="px-6 py-4 text-left font-bold opacity-70">Rol</th>}
                        <th className="px-6 py-4 text-center font-bold opacity-70">Sesiones Jugadas</th>
                        <th className="px-6 py-4 text-center font-bold opacity-70">Estado</th>
                        <th className="px-6 py-4 text-center font-bold opacity-70">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {students.map((st) => (
                        <tr key={st.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-bold">{st.full_name}</td>
                          <td className="px-6 py-4 opacity-80">{st.username}</td>
                          <td className="px-6 py-4 opacity-80 font-mono">{st.password}</td>
                          {role === 'admin' && (
                            <td className="px-6 py-4 capitalize font-bold text-sm">
                              <span className={`px-3 py-1 rounded-full ${
                                st.role === 'admin' ? 'bg-primary/20 text-primary-dark' : 
                                st.role === 'profesor' ? 'bg-secondary/20 text-secondary-dark' : 
                                'bg-black/10 text-foreground/80'
                              }`}>
                                {st.role}
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-4 text-center">
                            <span className="bg-secondary/20 text-secondary-dark px-3 py-1 rounded-full font-bold text-sm">
                              {st.practice_sessions?.[0]?.count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {(() => {
                                let online = false;
                                if (st.last_login) {
                                  const diff = (new Date().getTime() - new Date(st.last_login).getTime()) / 1000 / 60;
                                  online = diff < 30; // online if within 30 mins
                                }
                                return online ? (
                                  <span className="flex items-center gap-2 text-green-500 font-bold text-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    En línea
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2 text-red-500 font-bold text-sm">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    Desconectado
                                  </span>
                                );
                              })()}
                              <span className="text-xs opacity-60">
                                {st.last_login ? new Date(st.last_login).toLocaleString('es-ES', { 
                                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                                }) : 'Nunca'}
                              </span>
                            </div>
                          </td>
                          {/* Acciones */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => { setPwTarget({ id: st.id, name: st.full_name }); setNewPw(st.password); setPwMsg(''); }}
                                title="Cambiar contraseña"
                                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 transition-colors"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ id: st.id, name: st.full_name })}
                                title="Eliminar usuario"
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/30 text-red-400 transition-colors"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center opacity-60 italic">
                            No hay estudiantes registrados. Crea el primero a la izquierda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mt-8 bg-white/50 dark:bg-black/30 p-6 md:p-8 rounded-3xl shadow-inner border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Salón de la Fama (Top 5)
            </h3>
            <div className="flex bg-black/10 dark:bg-white/10 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
              {[
                { id: 'RAPID', label: 'Rápido' },
                { id: 'TRUE_FALSE', label: 'Verdadero o Falso' },
                { id: 'INPUT', label: 'Teclado' },
                { id: 'MEMORY', label: 'Memoria' }
              ].map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id as any)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                    selectedGame === game.id 
                      ? 'bg-white dark:bg-black/50 text-primary shadow-sm' 
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  {game.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-black/30 rounded-3xl shadow-inner border border-white/20 overflow-hidden relative min-h-[150px]">
            {isLoadingLeaderboard && (
              <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/5 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 font-bold opacity-70 w-24 text-center">Rango</th>
                    <th className="px-6 py-4 font-bold opacity-70">Estudiante</th>
                    <th className="px-6 py-4 font-bold opacity-70 text-center">Porcentaje de Éxito</th>
                    <th className="px-6 py-4 font-bold opacity-70 text-center">Tiempo Récord</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {leaderboard.map((student, index) => (
                    <tr key={index} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-center">
                        {index === 0 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 font-bold border-2 border-yellow-200 shadow-md animate-pulse">1</span> :
                         index === 1 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-700 font-bold border-2 border-white shadow-md">2</span> :
                         index === 2 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-white font-bold border-2 border-amber-300 shadow-md">3</span> :
                         <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 font-bold">{index + 1}</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-lg">{student.full_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-bold">
                          {student.score_percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono">
                        <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full font-bold">
                          <Clock className="w-4 h-4" />
                          {Math.floor(student.duration_seconds / 60)}:{(student.duration_seconds % 60).toString().padStart(2, '0')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && !isLoadingLeaderboard && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center opacity-60 font-medium">
                        Aún no hay puntuaciones perfectas para esta categoría.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Clean Practice Records Section ──────────────────────────────── */}
        <div className="mt-8 bg-white/50 dark:bg-black/30 p-6 md:p-8 rounded-3xl shadow-inner border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Limpiar Registro de Práctica de Tablas</h3>
              <p className="text-sm opacity-60">Elimina el historial de práctica del Modo Aprender por tabla o por alumno</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student selector */}
            <div>
              <label className="text-sm font-bold opacity-80 mb-2 block">Selecciona el Estudiante</label>
              <select
                value={cleanStudentId}
                onChange={e => handleCleanStudentChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 focus:ring-2 focus:ring-red-400 outline-none font-medium"
              >
                <option value="">-- Elige un estudiante --</option>
                {students.filter(s => s.role === 'student').map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.username})</option>
                ))}
              </select>
            </div>

            {/* Table selector */}
            <div>
              <label className="text-sm font-bold opacity-80 mb-2 block">Tabla a limpiar</label>
              <select
                value={cleanTableNum}
                onChange={e => setCleanTableNum(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                disabled={!cleanStudentId}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/50 focus:ring-2 focus:ring-red-400 outline-none font-medium disabled:opacity-40"
              >
                <option value="all">Todas las tablas</option>
                {Array.from({ length: 9 }, (_, i) => i + 2).map(t => (
                  <option key={t} value={t}>
                    Tabla del {t}{studentRecordCounts[t] !== undefined ? ` (${studentRecordCounts[t]} ${studentRecordCounts[t] === 1 ? 'registro' : 'registros'})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Record count summary */}
          {cleanStudentId && (
            <div className="mt-4">
              {isLoadingCounts ? (
                <div className="flex items-center gap-2 text-sm opacity-60">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando registros…
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                  {Array.from({ length: 9 }, (_, i) => i + 2).map(t => (
                    <div
                      key={t}
                      className={`rounded-xl p-2 text-center text-xs font-bold transition-colors ${
                        (studentRecordCounts[t] ?? 0) > 0
                          ? 'bg-primary/20 text-primary-dark'
                          : 'bg-black/5 dark:bg-white/5 opacity-40'
                      }`}
                    >
                      <BookOpen className="w-3 h-3 mx-auto mb-0.5 opacity-70" />
                      ×{t}
                      <div className="text-[10px] opacity-70 font-normal">{studentRecordCounts[t] ?? 0} reg.</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          <div className="mt-5 flex flex-col gap-3">
            {!showCleanConfirm ? (
              <button
                onClick={() => setShowCleanConfirm(true)}
                disabled={!cleanStudentId || isCleaning}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Limpiar Registros
              </button>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    ¿Confirmas eliminar los registros de{' '}
                    <strong>{cleanTableNum === 'all' ? 'TODAS las tablas' : `la Tabla del ${cleanTableNum}`}</strong>{' '}
                    de este estudiante? Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCleanConfirm(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                  <button
                    onClick={handleCleanConfirm}
                    disabled={isCleaning}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow transition-colors text-sm disabled:opacity-50"
                  >
                    {isCleaning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {isCleaning ? 'Limpiando…' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            )}
            {cleanMsg && (
              <p className={`text-center font-bold text-sm ${cleanMsg.includes('✅') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {cleanMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>

    {/* ── Change Password Modal ───────────────────────────────────────────── */}
    <AnimatePresence>
      {pwTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border-t-4 border-t-blue-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-1 text-foreground">Cambiar Contraseña</h3>
              <p className="text-foreground/60 text-sm mb-6">
                Usuario: <strong>{pwTarget.name}</strong>
              </p>

              <input
                type="text"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Nueva contraseña"
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 focus:border-blue-500 outline-none bg-white dark:bg-black/50 text-foreground font-mono text-lg text-center mb-4"
                autoFocus
              />

              {pwMsg && (
                <p className={`text-sm font-bold mb-4 ${pwMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
                  {pwMsg}
                </p>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { setPwTarget(null); setNewPw(''); setPwMsg(''); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPw || !newPw.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-[0_4px_0_#1d4ed8] hover:translate-y-[2px] hover:shadow-[0_2px_0_#1d4ed8] transition-all disabled:opacity-50"
                >
                  {isChangingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isChangingPw ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* ── Delete User Modal ───────────────────────────────────────────────── */}
    <AnimatePresence>
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border-t-4 border-t-red-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">¿Eliminar usuario?</h3>
              <p className="text-foreground/70 mb-1 font-medium">
                Estás a punto de eliminar a:
              </p>
              <p className="text-lg font-display font-bold text-red-500 mb-2">{deleteTarget.name}</p>
              <p className="text-sm text-foreground/50 mb-8">
                Se eliminarán también todas sus sesiones de práctica y registros. <strong>Esta acción no se puede deshacer.</strong>
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_0_#991b1b] hover:translate-y-[2px] hover:shadow-[0_2px_0_#991b1b] transition-all disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
                  {isDeleting ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
