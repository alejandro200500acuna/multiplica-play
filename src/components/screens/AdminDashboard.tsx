'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase';
import { UserPlus, Users, LogOut, Loader2, Play, RefreshCw, Trophy, Clock, Trash2, BookOpen, AlertTriangle, X, Check, KeyRound, UserX, School, GraduationCap, PlusCircle, Pencil, Filter, FilterX } from 'lucide-react';
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
  const [newSchoolId, setNewSchoolId] = useState('');
  const [newGradeForStudent, setNewGradeForStudent] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [availableRoomsForNew, setAvailableRoomsForNew] = useState<any[]>([]);
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

  // School edit state
  const [schoolToEdit, setSchoolToEdit] = useState<{id: string, name: string} | null>(null);
  const [editingSchoolName, setEditingSchoolName] = useState('');
  const [isUpdatingSchool, setIsUpdatingSchool] = useState(false);
  const [schoolEditMsg, setSchoolEditMsg] = useState('');

  // Filtering state
  const [filterSchoolId, setFilterSchoolId] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterRoomId, setFilterRoomId] = useState('');
  const [availableRoomsForFilter, setAvailableRoomsForFilter] = useState<any[]>([]);

  // Change password modal
  const [pwTarget, setPwTarget] = useState<{ id: string; name: string } | null>(null);
  const [newPw, setNewPw] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  // Delete user modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit user modal
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editSchoolId, setEditSchoolId] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editRoomId, setEditRoomId] = useState('');
  const [availableRoomsForEdit, setAvailableRoomsForEdit] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMsg, setEditMsg] = useState('');

  // School/Classroom management state
  const [schools, setSchools] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isSchoolLoading, setIsSchoolLoading] = useState(false);
  
  // New school form
  const [newSchoolName, setNewSchoolName] = useState('');
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  
  // New classroom form
  const [selectedSchoolForRoom, setSelectedSchoolForRoom] = useState('');
  const [newGrade, setNewGrade] = useState('1');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const [activeTab, setActiveTab] = useState<'users' | 'schools' | 'stats'>('users');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkSchoolId, setBulkSchoolId] = useState('');
  const [bulkGrade, setBulkGrade] = useState('');
  const [bulkRoomId, setBulkRoomId] = useState('');
  const [availableRoomsForBulk, setAvailableRoomsForBulk] = useState<any[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');

  const fetchStudents = async () => {
    setIsLoading(true);
    let query = supabase
      .from('users')
      .select('*, practice_sessions(count), schools(name), classrooms(grade, room_number)')
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
    }
    setIsLoadingLeaderboard(false);
  };

  const fetchSchools = async () => {
    const { data } = await supabase.from('schools').select('*').order('name');
    if (data) setSchools(data);
  };

  const fetchClassrooms = async () => {
    const { data } = await supabase.from('classrooms').select('*, schools(name)').order('grade');
    if (data) setClassrooms(data);
  };

  useEffect(() => {
    fetchStudents();
    fetchSchools();
    if (role === 'admin') fetchClassrooms();
  }, [role]);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedGame]);

  useEffect(() => {
    if (newSchoolId && newGradeForStudent) {
      const filtered = classrooms.filter(c => c.school_id === newSchoolId && c.grade.toString() === newGradeForStudent);
      setAvailableRoomsForNew(filtered);
    } else {
      setAvailableRoomsForNew([]);
    }
  }, [newSchoolId, newGradeForStudent, classrooms]);

  useEffect(() => {
    if (editSchoolId && editGrade) {
      const filtered = classrooms.filter(c => c.school_id === editSchoolId && c.grade.toString() === editGrade);
      setAvailableRoomsForEdit(filtered);
    } else {
      setAvailableRoomsForEdit([]);
    }
  }, [editSchoolId, editGrade, classrooms]);

  useEffect(() => {
    if (bulkSchoolId && bulkGrade) {
      const filtered = classrooms.filter(c => c.school_id === bulkSchoolId && c.grade.toString() === bulkGrade);
      setAvailableRoomsForBulk(filtered);
    } else {
      setAvailableRoomsForBulk([]);
    }
  }, [bulkSchoolId, bulkGrade, classrooms]);

  useEffect(() => {
    if (filterSchoolId && filterGrade) {
      const filtered = classrooms.filter(c => c.school_id === filterSchoolId && c.grade.toString() === filterGrade);
      setAvailableRoomsForFilter(filtered);
    } else {
      setAvailableRoomsForFilter([]);
    }
  }, [filterSchoolId, filterGrade, classrooms]);

  const filteredStudents = students.filter(st => {
    if (filterSchoolId && st.school_id !== filterSchoolId) return false;
    if (filterGrade && st.classrooms?.grade?.toString() !== filterGrade) return false;
    if (filterRoomId && st.classroom_id !== filterRoomId) return false;
    return true;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateMsg('');

    try {
      const { data: existing } = await supabase.from('users').select('id').eq('username', newUsername.trim()).single();
      if (existing) {
        setCreateMsg('❌ El usuario ya existe.');
        return;
      }

      const { error } = await supabase.from('users').insert([{
        full_name: newFullname.trim(),
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: newUserRole,
        school_id: newSchoolId || null,
        classroom_id: newRoomId || null
      }]);

      if (error) {
        setCreateMsg('❌ Error al crear: ' + error.message);
      } else {
        setCreateMsg('✅ ¡Estudiante creado con éxito!');
        setNewFullname('');
        setNewUsername('');
        setNewPassword('');
        setNewSchoolId('');
        setNewGradeForStudent('');
        setNewRoomId('');
        fetchStudents();
      }
    } catch (err) {
      setCreateMsg('❌ Error inesperado.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setIsUpdating(true);
    setEditMsg('');

    const { error } = await supabase
      .from('users')
      .update({
        school_id: editSchoolId || null,
        classroom_id: editRoomId || null
      })
      .eq('id', editTarget.id);

    if (error) {
      setEditMsg('❌ Error: ' + error.message);
    } else {
      setEditMsg('✅ Usuario actualizado!');
      fetchStudents();
      setTimeout(() => setEditTarget(null), 1500);
    }
    setIsUpdating(false);
  };

  const handleBulkAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || !bulkSchoolId) return;
    setIsBulkUpdating(true);
    setBulkMsg('');

    const { error } = await supabase
      .from('users')
      .update({
        school_id: bulkSchoolId,
        classroom_id: bulkRoomId || null
      })
      .in('id', selectedIds);

    if (error) {
      setBulkMsg('❌ Error: ' + error.message);
    } else {
      setBulkMsg(`✅ ${selectedIds.length} estudiantes actualizados!`);
      fetchStudents();
      setTimeout(() => {
        setSelectedIds([]);
        setBulkSchoolId('');
        setBulkGrade('');
        setBulkRoomId('');
        setBulkMsg('');
      }, 2000);
    }
    setIsBulkUpdating(false);
  };

  const handleChangePassword = async () => {
    if (!pwTarget || !newPw.trim()) return;
    setIsChangingPw(true);
    const { error } = await supabase.from('users').update({ password: newPw.trim() }).eq('id', pwTarget.id);
    if (!error) {
      setPwMsg('✅ Contraseña actualizada.');
      fetchStudents();
      setTimeout(() => setPwTarget(null), 1500);
    } else {
      setPwMsg('❌ Error: ' + error.message);
    }
    setIsChangingPw(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await supabase.from('practice_sessions').delete().eq('student_id', deleteTarget.id);
    const { error } = await supabase.from('users').delete().eq('id', deleteTarget.id);
    if (!error) {
      fetchStudents();
      setDeleteTarget(null);
    } else {
      alert('Error eliminando usuario');
    }
    setIsDeleting(false);
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    setIsCreatingSchool(true);
    const { error } = await supabase.from('schools').insert([{ name: newSchoolName.trim() }]);
    if (!error) {
      setNewSchoolName('');
      fetchSchools();
    }
    setIsCreatingSchool(false);
  };

  const handleDeleteSchool = async (id: string) => {
    if (!confirm('¿Eliminar escuela? (Solo si no tiene estudiantes ni aulas asignadas)')) return;
    const { error } = await supabase.from('schools').delete().eq('id', id);
    if (error) {
      alert('No se puede eliminar la escuela porque tiene aulas o estudiantes asociados.');
    } else {
      fetchSchools();
    }
  };

  const handleUpdateSchool = async () => {
    if (!schoolToEdit || !editingSchoolName.trim()) return;
    setIsUpdatingSchool(true);
    setSchoolEditMsg('');
    const { error } = await supabase
      .from('schools')
      .update({ name: editingSchoolName.trim() })
      .eq('id', schoolToEdit.id);

    if (error) {
      setSchoolEditMsg('❌ Error: ' + error.message);
    } else {
      setSchoolEditMsg('✅ Nombre actualizado');
      fetchSchools();
      setTimeout(() => setSchoolToEdit(null), 1500);
    }
    setIsUpdatingSchool(false);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolForRoom || !newRoomNumber.trim()) return;
    setIsCreatingRoom(true);
    const { error } = await supabase.from('classrooms').insert([{
      school_id: selectedSchoolForRoom,
      grade: parseInt(newGrade),
      room_number: newRoomNumber.trim()
    }]);
    if (!error) {
      setNewRoomNumber('');
      fetchClassrooms();
    }
    setIsCreatingRoom(false);
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('¿Eliminar aula?')) return;
    await supabase.from('classrooms').delete().eq('id', id);
    fetchClassrooms();
  };

  const fetchRecordCounts = async (studentId: string) => {
    setIsLoadingCounts(true);
    const { data } = await supabase.from('practice_sessions').select('table_num').eq('student_id', studentId).eq('game_type', 'LEARN');
    if (data) {
      const counts: Record<number, number> = {};
      data.forEach(r => {
        counts[r.table_num] = (counts[r.table_num] || 0) + 1;
      });
      setStudentRecordCounts(counts);
    }
    setIsLoadingCounts(false);
  };

  const handleCleanStudentChange = (id: string) => {
    setCleanStudentId(id);
    setCleanMsg('');
    setShowCleanConfirm(false);
    if (id) fetchRecordCounts(id);
    else setStudentRecordCounts({});
  };

  const handleCleanConfirm = async () => {
    if (!cleanStudentId) return;
    setIsCleaning(true);
    let query = supabase.from('practice_sessions').delete().eq('student_id', cleanStudentId).eq('game_type', 'LEARN');
    if (cleanTableNum !== 'all') {
      query = query.eq('table_num', cleanTableNum);
    }
    const { error } = await query;
    if (!error) {
      setCleanMsg('✅ Registros eliminados correctamente.');
      fetchRecordCounts(cleanStudentId);
      setShowCleanConfirm(false);
    } else {
      setCleanMsg('❌ Error al eliminar.');
    }
    setIsCleaning(false);
  };

  return (
    <>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full flex justify-center py-10"
    >
      <div className="w-full max-w-[1600px] flex flex-col gap-6">
        {/* Main Header Card */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-2xl border-t-4 border-t-primary/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  {role === 'profesor' ? 'Panel del Profesor' : 'Panel de Administración'}
                </h2>
                <p className="text-foreground/70 text-sm font-medium">Gestión de la plataforma y progreso</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-lg' : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 opacity-70'}`}
              >
                <Users className="w-4 h-4" /> Usuarios
              </button>
              {role === 'admin' && (
                <button
                  onClick={() => setActiveTab('schools')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'schools' ? 'bg-secondary text-white shadow-lg' : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 opacity-70'}`}
                >
                  <School className="w-4 h-4" /> Escuelas y Aulas
                </button>
              )}
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'stats' ? 'bg-accent text-white shadow-lg' : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 opacity-70'}`}
              >
                <Trophy className="w-4 h-4" /> Estadísticas
              </button>
              <div className="w-px h-8 bg-black/10 dark:border-white/10 mx-2 hidden md:block"></div>
              <button
                onClick={() => resetAll()}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-2.5 rounded-xl font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div
              key="users-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Left Col: Create user */}
              <div className="lg:col-span-1">
                <div className="glass-panel p-6 rounded-3xl border border-white/10">
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
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-white/5 focus:border-primary/50 outline-none font-bold text-white transition-all shadow-inner"
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
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-white/5 focus:border-primary/50 outline-none font-bold text-white transition-all shadow-inner"
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
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-white/5 focus:border-primary/50 outline-none font-bold text-white transition-all shadow-inner"
                        placeholder="Ej. 1234"
                        required
                      />
                    </div>
                    {role === 'admin' && (
                      <div className="flex flex-col gap-4">
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

                        {newUserRole === 'student' && (
                          <>
                            <div>
                              <label className="text-sm font-bold opacity-80 mb-1 block">Escuela</label>
                              <select
                                value={newSchoolId}
                                onChange={(e) => { setNewSchoolId(e.target.value); setNewGradeForStudent(''); setNewRoomId(''); }}
                                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 focus:ring-2 focus:ring-primary outline-none"
                              >
                                <option value="">-- Selecciona Escuela --</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-sm font-bold opacity-80 mb-1 block">Grado</label>
                                <select
                                  value={newGradeForStudent}
                                  onChange={(e) => { setNewGradeForStudent(e.target.value); setNewRoomId(''); }}
                                  className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                                  disabled={!newSchoolId}
                                >
                                  <option value="">-- Grado --</option>
                                  {['1', '2', '3', '4', '5', '6'].map(g => <option key={g} value={g}>{g}° Grado</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="text-sm font-bold opacity-80 mb-1 block">Aula</label>
                                <select
                                  value={newRoomId}
                                  onChange={(e) => setNewRoomId(e.target.value)}
                                  className="w-full px-4 py-2 rounded-xl bg-white dark:bg-black/50 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                                  disabled={!newGradeForStudent || availableRoomsForNew.length === 0}
                                >
                                  <option value="">-- Aula --</option>
                                  {availableRoomsForNew.map(r => <option key={r.id} value={r.id}> {r.room_number}</option>)}
                                </select>
                              </div>
                            </div>
                          </>
                        )}
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
              <div className="lg:col-span-3">
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Play className="w-6 h-6 text-secondary" />
                      {role === 'profesor' ? 'Estudiantes Registrados' : 'Usuarios Registrados'} ({filteredStudents.length})
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

                  {/* Filter Toolbar */}
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-black/10 dark:bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 min-w-[180px]">
                      <School className="w-4 h-4 text-primary opacity-60 flex-shrink-0" />
                      <select 
                        value={filterSchoolId}
                        onChange={(e) => { setFilterSchoolId(e.target.value); setFilterGrade(''); setFilterRoomId(''); }}
                        className="bg-transparent border-none outline-none text-xs font-bold text-white/80 w-full"
                      >
                        <option value="" className="bg-slate-900 font-sans">Escuela: Todas</option>
                        {schools.map(s => <option key={s.id} value={s.id} className="bg-slate-900 font-sans">{s.name}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 min-w-[140px]">
                      <GraduationCap className="w-4 h-4 text-primary opacity-60 flex-shrink-0" />
                      <select 
                        value={filterGrade}
                        onChange={(e) => { setFilterGrade(e.target.value); setFilterRoomId(''); }}
                        className="bg-transparent border-none outline-none text-xs font-bold text-white/80 w-full"
                        disabled={!filterSchoolId}
                      >
                        <option value="" className="bg-slate-900 font-sans">Grado: Todos</option>
                        {['1','2','3','4','5','6'].map(g => <option key={g} value={g} className="bg-slate-900 font-sans">{g}° Grado</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 min-w-[140px]">
                      <Filter className="w-4 h-4 text-primary opacity-60 flex-shrink-0" />
                      <select 
                        value={filterRoomId}
                        onChange={(e) => setFilterRoomId(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-bold text-white/80 w-full"
                        disabled={!filterGrade}
                      >
                        <option value="" className="bg-slate-900 font-sans">Aula: Todas</option>
                        {availableRoomsForFilter.map(r => <option key={r.id} value={r.id} className="bg-slate-900 font-sans">Aula {r.room_number}</option>)}
                      </select>
                    </div>

                    {(filterSchoolId || filterGrade || filterRoomId) && (
                      <button 
                        onClick={() => { setFilterSchoolId(''); setFilterGrade(''); setFilterRoomId(''); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors text-xs font-bold"
                        title="Limpiar filtros"
                      >
                        <FilterX className="w-4 h-4" />
                        Limpiar
                      </button>
                    )}
                  </div>
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
                            <th className="px-3 py-4 text-center w-10">
                              <input
                                type="checkbox"
                                checked={selectedIds.length === filteredStudents.filter(s => s.role === 'student').length && filteredStudents.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIds(filteredStudents.filter(s => s.role === 'student').map(s => s.id));
                                  } else {
                                    setSelectedIds([]);
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </th>
                            <th className="px-2 py-4 text-left font-bold text-primary text-[10px]">Nombre</th>
                            <th className="px-2 py-4 text-left font-bold text-primary text-[10px]">Escuela / Aula</th>
                            <th className="px-2 py-4 text-left font-bold text-primary text-[10px]">Usuario</th>
                            <th className="px-2 py-4 text-left font-bold text-primary text-[10px]">Contraseña</th>
                            {role === 'admin' && <th className="px-2 py-4 text-left font-bold text-primary text-[10px]">Rol</th>}
                            <th className="px-2 py-4 text-center font-bold text-primary text-[10px]">Sesiones</th>
                            <th className="px-2 py-4 text-center font-bold text-primary text-[10px]">Estado</th>
                            <th className="px-2 py-4 text-center font-bold text-primary text-[10px]">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                          {filteredStudents.map((st) => (
                            <tr key={st.id} className={`hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${selectedIds.includes(st.id) ? 'bg-primary/5' : ''}`}>
                              <td className="px-2 py-4 text-center">
                                {st.role === 'student' && (
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.includes(st.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedIds([...selectedIds, st.id]);
                                      } else {
                                        setSelectedIds(selectedIds.filter(id => id !== st.id));
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                )}
                              </td>
                              <td className="px-2 py-4 font-bold text-[11px] leading-tight max-w-[120px] break-words">{st.full_name}</td>
                              <td className="px-2 py-4">
                                <div className="flex flex-col max-w-[150px]">
                                  <span className="text-[10px] font-bold opacity-90 leading-tight">{(st.schools as any)?.name || 'N/A'}</span>
                                  <span className="text-[9px] opacity-60 leading-tight">
                                    {st.classrooms ? `${st.classrooms.grade}° Grado - Aula ${st.classrooms.room_number}` : 'Sin asignar'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 py-4 opacity-80 text-[10px] truncate max-w-[80px]" title={st.username}>{st.username}</td>
                              <td className="px-2 py-4 opacity-80 font-mono text-[10px]">{st.password}</td>
                              {role === 'admin' && (
                                <td className="px-2 py-4 capitalize font-bold text-[9px]">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    st.role === 'admin' ? 'bg-primary/20 text-primary-dark' : 
                                    st.role === 'profesor' ? 'bg-secondary/20 text-secondary-dark' : 
                                    'bg-black/10 text-foreground/80'
                                  }`}>
                                    {st.role}
                                  </span>
                                </td>
                              )}
                              <td className="px-2 py-4 text-center">
                                <span className="bg-secondary/20 text-secondary-dark px-2 py-0.5 rounded-full font-bold text-[10px]">
                                  {st.practice_sessions?.[0]?.count || 0}
                                </span>
                              </td>
                              <td className="px-2 py-4 text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  {(() => {
                                    let online = false;
                                    if (st.last_login) {
                                      const diff = (new Date().getTime() - new Date(st.last_login).getTime()) / 1000 / 60;
                                      online = diff < 30;
                                    }
                                    return online ? (
                                      <span className="flex items-center gap-1 text-green-500 font-bold text-[9px]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        En línea
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-red-500 font-bold text-[9px]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        Desconectado
                                      </span>
                                    );
                                  })()}
                                  <span className="text-[8px] opacity-60">
                                    {st.last_login ? new Date(st.last_login).toLocaleString('es-ES', { 
                                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                                    }) : 'Nunca'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditTarget(st);
                                      setEditSchoolId(st.school_id || '');
                                      setEditGrade(st.classrooms?.grade?.toString() || '');
                                      setEditRoomId(st.classroom_id || '');
                                      setEditMsg('');
                                    }}
                                    title="Editar escuela/aula"
                                    className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/30 text-orange-400 transition-colors"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => { setPwTarget({ id: st.id, name: st.full_name }); setNewPw(st.password); setPwMsg(''); }}
                                    title="Cambiar contraseña"
                                    className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 transition-colors"
                                  >
                                    <KeyRound className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTarget({ id: st.id, name: st.full_name })}
                                    title="Eliminar usuario"
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 transition-colors"
                                  >
                                    <UserX className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {students.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-6 py-8 text-center opacity-60 italic">
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

              {/* Bulk Actions Floating Bar */}
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4"
                  >
                    <div className="glass-panel p-4 md:p-6 rounded-2xl shadow-2xl border-t-4 border-t-secondary bg-black/80 backdrop-blur-xl flex flex-col md:flex-row items-center gap-6">
                      <div className="flex items-center gap-3 min-w-fit">
                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                          {selectedIds.length}
                        </div>
                        <div>
                          <p className="font-bold text-white">Seleccionados</p>
                          <button onClick={() => setSelectedIds([])} className="text-xs text-secondary hover:underline">Limpiar selección</button>
                        </div>
                      </div>

                      <div className="w-px h-10 bg-white/10 hidden md:block"></div>

                      <form onSubmit={handleBulkAssign} className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full">
                        <select
                          value={bulkSchoolId}
                          onChange={(e) => { setBulkSchoolId(e.target.value); setBulkGrade(''); setBulkRoomId(''); }}
                          className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 focus:border-secondary outline-none text-white text-sm w-full"
                          required
                        >
                          <option value="" className="bg-gray-900">-- Escuela --</option>
                          {schools.map(s => <option key={s.id} value={s.id} className="bg-gray-900">{s.name}</option>)}
                        </select>

                        <select
                          value={bulkGrade}
                          onChange={(e) => { setBulkGrade(e.target.value); setBulkRoomId(''); }}
                          className="w-full sm:w-28 px-3 py-2 rounded-xl bg-white/10 border border-white/10 focus:border-secondary outline-none text-white text-sm"
                          disabled={!bulkSchoolId}
                        >
                          <option value="" className="bg-gray-900">Grado</option>
                          {['1', '2', '3', '4', '5', '6'].map(g => <option key={g} value={g} className="bg-gray-900">{g}°</option>)}
                        </select>

                        <select
                          value={bulkRoomId}
                          onChange={(e) => setBulkRoomId(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 focus:border-secondary outline-none text-white text-sm w-full"
                          disabled={!bulkGrade || availableRoomsForBulk.length === 0}
                        >
                          <option value="" className="bg-gray-900">-- Aula --</option>
                          {availableRoomsForBulk.map(r => <option key={r.id} value={r.id} className="bg-gray-900">{r.room_number}</option>)}
                        </select>

                        <button
                          type="submit"
                          disabled={isBulkUpdating || !bulkSchoolId}
                          className="w-full sm:w-auto px-6 py-2 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Asignar
                        </button>
                      </form>
                      
                      {bulkMsg && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                          <p className={`text-sm font-bold ${bulkMsg.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>{bulkMsg}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-8"
            >
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                    Salón de la Fama (Top 5)
                  </h3>
                  <div className="flex bg-black/10 dark:bg-black/40 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
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
                          <th className="px-6 py-4 font-bold text-secondary w-24 text-center">Rango</th>
                          <th className="px-6 py-4 font-bold text-secondary">Estudiante</th>
                          <th className="px-6 py-4 font-bold text-secondary text-center">Éxito</th>
                          <th className="px-6 py-4 font-bold text-secondary text-center">Récord</th>
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

              {/* Clean Records */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Limpiar Registro de Práctica</h3>
                    <p className="text-sm opacity-60">Elimina el historial de práctica del Modo Aprender</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          Tabla del {t}{studentRecordCounts[t] !== undefined ? ` (${studentRecordCounts[t]} reg.)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  {!showCleanConfirm ? (
                    <button
                      onClick={() => setShowCleanConfirm(true)}
                      disabled={!cleanStudentId || isCleaning}
                      className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-4" /> Limpiar Registros
                    </button>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-4">
                      <p className="text-sm mb-4">¿Confirmas eliminar estos registros? Esta acción no se puede deshacer.</p>
                      <div className="flex gap-2">
                        <button onClick={() => setShowCleanConfirm(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm">Cancelar</button>
                        <button onClick={handleCleanConfirm} disabled={isCleaning} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold">Sí, eliminar</button>
                      </div>
                    </div>
                  )}
                  {cleanMsg && <p className="text-xs text-center font-bold">{cleanMsg}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'schools' && role === 'admin' && (
            <motion.div
              key="schools-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Schools Management */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                    <School className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Gestión de Escuelas</h3>
                    <p className="text-sm opacity-60">Registra los centros educativos</p>
                  </div>
                </div>

                <form onSubmit={handleCreateSchool} className="flex gap-2">
                  <input
                    type="text"
                    value={newSchoolName}
                    onChange={e => setNewSchoolName(e.target.value)}
                    placeholder="Nombre de la escuela"
                    className="flex-1 px-4 py-2 rounded-xl bg-black/30 border-2 border-white/5 focus:border-secondary/50 outline-none text-white transition-all shadow-inner"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isCreatingSchool}
                    className="bg-secondary text-white p-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isCreatingSchool ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-6 h-6" />}
                  </button>
                </form>

                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col gap-2">
                    {schools.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5 group">
                        <span className="font-bold">{s.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setSchoolToEdit(s);
                              setEditingSchoolName(s.name);
                              setSchoolEditMsg('');
                            }}
                            className="p-1.5 text-orange-400 hover:bg-orange-400/20 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchool(s.id)}
                            className="p-1.5 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {schools.length === 0 && <p className="text-center py-8 opacity-40 italic text-sm">No hay escuelas registradas.</p>}
                  </div>
                </div>
              </div>

              {/* Classrooms Management */}
              <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Aulas y Grados</h3>
                    <p className="text-sm opacity-60">Asigna grados y aulas a escuelas</p>
                  </div>
                </div>

                <form onSubmit={handleCreateRoom} className="flex flex-col gap-3">
                  <select
                    value={selectedSchoolForRoom}
                    onChange={e => setSelectedSchoolForRoom(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-black/30 border-2 border-white/5 focus:border-accent/50 outline-none text-white transition-all shadow-inner"
                    required
                  >
                    <option value="">-- Selecciona Escuela --</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <select
                      value={newGrade}
                      onChange={e => setNewGrade(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl bg-black/30 border-2 border-white/5 focus:border-accent/50 outline-none text-white transition-all shadow-inner"
                      required
                    >
                      <option value="1">1° Grado</option>
                      <option value="2">2° Grado</option>
                      <option value="3">3° Grado</option>
                      <option value="4">4° Grado</option>
                      <option value="5">5° Grado</option>
                      <option value="6">6° Grado</option>
                    </select>
                    <input
                      type="text"
                      value={newRoomNumber}
                      onChange={e => setNewRoomNumber(e.target.value)}
                      placeholder="Aula (Ej. A-1)"
                      className="flex-1 px-4 py-2 rounded-xl bg-black/30 border-2 border-white/5 focus:border-accent/50 outline-none text-white transition-all shadow-inner"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isCreatingRoom || !selectedSchoolForRoom}
                      className="bg-accent text-white p-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isCreatingRoom ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-6 h-6" />}
                    </button>
                  </div>
                </form>

                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col gap-2">
                    {classrooms.map(c => (
                      <div key={c.id} className="flex flex-col bg-black/20 p-3 rounded-xl border border-white/5 group">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{c.grade}° Grado - Aula {c.room_number}</span>
                          <button
                            onClick={() => handleDeleteRoom(c.id)}
                            className="p-1.5 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-xs opacity-60 flex items-center gap-1">
                          <School className="w-3 h-3" /> {(c.schools as any)?.name}
                        </span>
                      </div>
                    ))}
                    {classrooms.length === 0 && <p className="text-center py-8 opacity-40 italic text-sm">No hay aulas registradas.</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>

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
              <p className="text-foreground/60 text-sm mb-6">Usuario: <strong>{pwTarget.name}</strong></p>
              <input
                type="text" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Nueva contraseña"
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 focus:border-blue-500 outline-none bg-white dark:bg-black/50 text-foreground font-mono text-lg text-center mb-4" autoFocus
              />
              {pwMsg && <p className={`text-sm font-bold mb-4 ${pwMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>{pwMsg}</p>}
              <div className="flex gap-3 w-full">
                <button onClick={() => { setPwTarget(null); setNewPw(''); setPwMsg(''); }} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 transition-colors">Cancelar</button>
                <button onClick={handleChangePassword} disabled={isChangingPw || !newPw.trim()} className="flex-1 py-3 rounded-xl font-bold bg-blue-500 text-white shadow-[0_4px_0_#1d4ed8] transition-all disabled:opacity-50">Guardar</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

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
              <p className="text-foreground/70 mb-1 font-medium">Estás a punto de eliminar a:</p>
              <p className="text-lg font-display font-bold text-red-500 mb-2">{deleteTarget.name}</p>
              <p className="text-sm text-foreground/50 mb-8">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 transition-colors">Cancelar</button>
                <button onClick={handleDeleteUser} disabled={isDeleting} className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white shadow-[0_4px_0_#991b1b] transition-all disabled:opacity-50">Sí, eliminar</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* ── Edit User Modal ─────────────────────────────────────────────────── */}
    <AnimatePresence>
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border-t-4 border-t-orange-500"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center text-center mb-2">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                  <Pencil className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-foreground">Asignar Escuela y Aula</h3>
                <p className="text-foreground/60 text-sm">
                  Estudiante: <strong>{editTarget.full_name}</strong>
                </p>
              </div>

              <form onSubmit={handleEditUser} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-bold opacity-80 mb-1 block">Escuela</label>
                  <select
                    value={editSchoolId}
                    onChange={(e) => { setEditSchoolId(e.target.value); setEditGrade(''); setEditRoomId(''); }}
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-black/50 border-2 border-transparent focus:border-orange-500 outline-none transition-all"
                  >
                    <option value="">-- Selecciona Escuela --</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-bold opacity-80 mb-1 block">Grado</label>
                    <select
                      value={editGrade}
                      onChange={(e) => { setEditGrade(e.target.value); setEditRoomId(''); }}
                      className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-black/50 border-2 border-transparent focus:border-orange-500 outline-none transition-all disabled:opacity-50"
                      disabled={!editSchoolId}
                    >
                      <option value="">-- Grado --</option>
                      {['1', '2', '3', '4', '5', '6'].map(g => <option key={g} value={g}>{g}° Grado</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold opacity-80 mb-1 block">Aula</label>
                    <select
                      value={editRoomId}
                      onChange={(e) => setEditRoomId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-black/50 border-2 border-transparent focus:border-orange-500 outline-none transition-all disabled:opacity-50"
                      disabled={!editGrade || availableRoomsForEdit.length === 0}
                    >
                      <option value="">-- Aula --</option>
                      {availableRoomsForEdit.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
                    </select>
                  </div>
                </div>

                {editMsg && (
                  <p className={`text-sm font-bold text-center ${editMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
                    {editMsg}
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditTarget(null)}
                    className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-[0_4px_0_#9a3412] hover:translate-y-[2px] hover:shadow-[0_2px_0_#9a3412] transition-all disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {/* Modal: Edit School Name */}
      <AnimatePresence>
        {schoolToEdit && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                  <School className="w-6 h-6 text-primary" />
                  Editar Escuela
                </h3>
                <button onClick={() => setSchoolToEdit(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold opacity-60 mb-2">Nombre de la escuela</label>
                  <input
                    type="text"
                    value={editingSchoolName}
                    onChange={(e) => setEditingSchoolName(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl bg-black/40 border-2 border-white/10 focus:border-primary outline-none text-white text-lg transition-all"
                    placeholder="Nuevo nombre..."
                  />
                </div>

                {schoolEditMsg && (
                  <p className={`text-center font-bold py-2 rounded-xl ${schoolEditMsg.includes('✅') ? 'bg-success/20 text-green-400' : 'bg-error/20 text-red-400'}`}>
                    {schoolEditMsg}
                  </p>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setSchoolToEdit(null)}
                    className="flex-1 py-4 rounded-2xl font-bold bg-white/10 hover:bg-white/20 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdateSchool}
                    disabled={isUpdatingSchool || !editingSchoolName.trim()}
                    className="flex-1 py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdatingSchool ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    Guardar
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
