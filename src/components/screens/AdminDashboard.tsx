'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { UserPlus, Users, LogOut, Loader2, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { resetAll } = useStore();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New student form
  const [newFullname, setNewFullname] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  const fetchStudents = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*, practice_sessions(count)')
      .eq('role', 'student')
      .order('created_at', { ascending: false });
    
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
        role: 'student'
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
                Panel de Administración
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
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <Play className="w-6 h-6 text-secondary" />
              Estudiantes Registrados ({students.length})
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-white/50 dark:bg-black/30 rounded-3xl shadow-inner border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/5 dark:bg-white/5">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold opacity-70">Nombre</th>
                        <th className="px-6 py-4 text-left font-bold opacity-70">Usuario</th>
                        <th className="px-6 py-4 text-left font-bold opacity-70">Contraseña</th>
                        <th className="px-6 py-4 text-center font-bold opacity-70">Sesiones Jugadas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {students.map((st) => (
                        <tr key={st.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-bold">{st.full_name}</td>
                          <td className="px-6 py-4 opacity-80">{st.username}</td>
                          <td className="px-6 py-4 opacity-80 font-mono">{st.password}</td>
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
