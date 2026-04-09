'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { UserPlus, Users, LogOut, Loader2, Play, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    fetchStudents();
  }, []);

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
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center opacity-60 italic">
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
      </div>
    </motion.div>
  );
}
