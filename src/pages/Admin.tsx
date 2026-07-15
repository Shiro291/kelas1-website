import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabase-admin';
import { UserPlus, AlertCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AdminBeranda } from '../components/admin/AdminBeranda';
import { AdminSiswa } from '../components/admin/AdminSiswa';
import { AdminKalender } from '../components/admin/AdminKalender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Joyride, type Step } from 'react-joyride';
import { HelpCircle } from 'lucide-react';

interface Profile {
  id: string;
  role: string;
  class_name: string | null;
  email: string;
}

export const Admin: React.FC = () => {
  const { t, isLoading, availableClasses } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [runTutorial, setRunTutorial] = useState(false);

  // New Teacher form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newClass, setNewClass] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const alertRef = React.useRef<HTMLDialogElement>(null);
  const confirmRef = React.useRef<HTMLDialogElement>(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    alertRef.current?.showModal();
  };

  useEffect(() => {
    const fetchProfileAndData = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setRole(data.role);
        if (data.role === 'superadmin') {
          fetchProfiles();
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLoggedIn(true);
        fetchProfileAndData(session.user.id);
        if (!localStorage.getItem('admin_tutorial_seen')) {
          setRunTutorial(true);
          localStorage.setItem('admin_tutorial_seen', 'true');
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setLoggedIn(true);
        fetchProfileAndData(session.user.id);
      } else {
        setLoggedIn(false);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    const { data, error } = await supabase.from('profiles').select('*').order('email');
    if (!error && data) {
      setProfiles(data as Profile[]);
    }
    setLoadingProfiles(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      showAlert('Login failed: ' + error.message);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.trim()) {
      showAlert('Masukkan atau pilih kelas untuk guru ini!');
      return;
    }
    
    setIsCreating(true);
    try {
      // Create user using the secondary client to prevent logging out Super Admin
      const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
        email: newEmail,
        password: newPassword,
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Gagal mendapatkan User ID');

      // Insert into profiles using the MAIN client (which has superadmin privileges)
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          role: 'teacher',
          class_name: newClass.trim(),
          email: newEmail
        }
      ]);

      if (profileError) throw profileError;

      showAlert('Akun guru berhasil dibuat!');
      setNewEmail('');
      setNewPassword('');
      setNewClass('');
      fetchProfiles();
    } catch (err: any) {
      showAlert('Error: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteAction = (id: string) => {
    setProfileToDelete(id);
    confirmRef.current?.showModal();
  };

  const executeDelete = async () => {
    if (!profileToDelete) return;
    
    // Hapus dari auth (Supabase Auth API)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(profileToDelete);
    
    if (authError) {
      showAlert('Gagal menghapus profil dari Auth: ' + authError.message);
    } else {
      // Supabase profiles table usually deletes via cascade, but we can do it explicitly just in case or fetch directly
      fetchProfiles();
      showAlert('Akun pengguna berhasil dihapus sepenuhnya!');
    }
    
    confirmRef.current?.close();
    setProfileToDelete(null);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8" aria-live="polite" aria-busy="true">Memuat...</div>;
  }

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">Login Super Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="admin@mudipas49.com"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Enter password"
                  className="w-full"
                  required
                />
              </div>
              <Button type="submit" className="w-full">{t.login}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role && role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p>Anda bukan Super Admin. Jika Anda Guru, silakan login di halaman /teacher.</p>
      </div>
    );
  }

  const JoyrideComponent = Joyride as any;
  const tutorialSteps: Step[] = [
    {
      target: '.tour-admin-tabs',
      content: 'Ini adalah menu utama Super Admin. Anda bisa beralih antara mengelola konten kelas dan mengelola akun guru.',
    },
    {
      target: '.tour-admin-content',
      content: 'Di sini, Anda dapat mengatur jadwal, PR, kalender, dan data siswa. Anda bisa beralih kelas di sudut atas untuk mengubah data kelas mana pun.',
    },
    {
      target: '.tour-admin-users',
      content: 'Di tab ini, Anda dapat membuat akun baru untuk guru dan menugaskannya ke kelas tertentu, atau menghapus pengguna.',
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <JoyrideComponent
        steps={tutorialSteps}
        run={runTutorial}
        continuous
        showProgress={true}
        showSkipButton={true}
        callback={(data: any) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            setRunTutorial(false);
          }
        }}
      />
      
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-lg font-bold text-primary">Super Admin Dashboard</h2>
          <p className="text-sm text-green-600 font-medium">Anda memiliki akses penuh ke seluruh kelas dan akun.</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => setRunTutorial(true)} title="Mulai Tutorial">
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full tour-admin-tabs">
        <TabsList className="mb-4">
          <TabsTrigger value="content" className="tour-admin-content">Manajemen Konten & Kelas</TabsTrigger>
          <TabsTrigger value="users" className="tour-admin-users">Manajemen Akun Guru</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content">
          {/* Use Teacher Dashboard components but since Super Admin can change selectedClass, they can edit any class */}
          <Tabs defaultValue="beranda" className="w-full">
            <TabsList className="mb-4 bg-muted/50 p-1">
              <TabsTrigger value="beranda">Highlight Kegiatan</TabsTrigger>
              <TabsTrigger value="jadwal">Jadwal & Info</TabsTrigger>
              <TabsTrigger value="siswa">Data Siswa</TabsTrigger>
            </TabsList>
            <TabsContent value="beranda" className="space-y-4">
              <AdminBeranda />
            </TabsContent>
            <TabsContent value="jadwal" className="space-y-4">
              <AdminKalender />
            </TabsContent>
            <TabsContent value="siswa" className="space-y-4">
              <AdminSiswa />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            {/* Form Tambah Guru */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" /> Tambah Guru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeacher} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      value={newEmail} 
                      onChange={e => setNewEmail(e.target.value)} 
                      placeholder="guru_hatta@mudipas49.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password Sementara</Label>
                    <Input 
                      type="text" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      placeholder="Minimal 6 karakter"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tugaskan ke Kelas</Label>
                    <Input 
                      list="class-list"
                      value={newClass} 
                      onChange={e => setNewClass(e.target.value)} 
                      placeholder="Ketik atau pilih kelas..."
                      required
                    />
                    <datalist id="class-list">
                      {availableClasses.map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? 'Membuat...' : 'Buat Akun'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Daftar Akun */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daftar Pengguna Sistem</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingProfiles ? (
                  <div className="text-center py-8" aria-live="polite" aria-busy="true">Memuat data...</div>
                ) : profiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Belum ada profil</div>
                ) : (
                  <div className="border rounded-md divide-y overflow-hidden">
                    <div className="grid grid-cols-4 bg-muted/50 p-3 font-medium text-sm">
                      <div className="col-span-2">Email</div>
                      <div>Role / Kelas</div>
                      <div className="text-right">Aksi</div>
                    </div>
                    <div className="divide-y max-h-[400px] overflow-y-auto">
                      {profiles.map(p => (
                        <div key={p.id} className="grid grid-cols-4 p-3 items-center text-sm hover:bg-slate-50">
                          <div className="col-span-2 font-medium break-all">{p.email || p.id}</div>
                          <div>
                            {p.role === 'superadmin' ? (
                              <Badge variant="destructive">Super Admin</Badge>
                            ) : (
                              <div className="flex flex-col items-start gap-1">
                                <Badge variant="outline" className="text-blue-600 border-blue-600">Guru</Badge>
                                <span className="text-xs text-muted-foreground">{p.class_name}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {p.role !== 'superadmin' && (
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => confirmDeleteAction(p.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <dialog ref={alertRef} className="p-6 rounded-lg shadow-xl backdrop:bg-black/50 border border-border bg-background text-foreground open:animate-in open:fade-in-90 open:zoom-in-95">
        <h3 className="text-lg font-bold mb-4">Informasi</h3>
        <p className="mb-6">{alertMessage}</p>
        <div className="flex justify-end">
          <Button onClick={() => alertRef.current?.close()}>Tutup</Button>
        </div>
      </dialog>

      <dialog ref={confirmRef} className="p-6 rounded-lg shadow-xl backdrop:bg-black/50 border border-border bg-background text-foreground open:animate-in open:fade-in-90 open:zoom-in-95 max-w-md">
        <h3 className="text-lg font-bold mb-4 text-destructive">Konfirmasi Hapus</h3>
        <p className="mb-6 text-sm text-muted-foreground">Hapus profil guru ini? Akun guru ini akan dihapus secara permanen dari sistem dan mereka tidak akan bisa login lagi.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => confirmRef.current?.close()}>Batal</Button>
          <Button variant="destructive" onClick={executeDelete}>Hapus Permanen</Button>
        </div>
      </dialog>
    </div>
  );
};
