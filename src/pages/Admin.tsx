import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabase-admin';
import { UserPlus, AlertCircle, LogOut, Trash2 } from 'lucide-react';


import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface Profile {
  id: string;
  role: string;
  class_name: string | null;
  email: string;
}

export const Admin: React.FC = () => {
  const { t, isLoading } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // New Teacher form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newClass, setNewClass] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const alertRef = React.useRef<HTMLDialogElement>(null);
  const confirmRef = React.useRef<HTMLDialogElement>(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const classes = ['IR Soekarno', 'Muh. Hatta', 'Ki Hajar Dewantara'];

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass) {
      showAlert('Pilih kelas untuk guru ini!');
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
          class_name: newClass,
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
    
    const { error } = await supabase.from('profiles').delete().eq('id', profileToDelete);
    if (error) {
      showAlert('Gagal menghapus profil: ' + error.message);
    } else {
      fetchProfiles();
    }
    confirmRef.current?.close();
    setProfileToDelete(null);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8" aria-live="polite" aria-busy="true">Memuat...</div>;
  }

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto mt-10">
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
        
        <dialog ref={alertRef} className="p-6 rounded-lg shadow-xl backdrop:bg-black/50 border border-border bg-background text-foreground open:animate-in open:fade-in-90 open:zoom-in-95">
          <h3 className="text-lg font-bold mb-4">Informasi</h3>
          <p className="mb-6">{alertMessage}</p>
          <div className="flex justify-end">
            <Button onClick={() => alertRef.current?.close()}>Tutup</Button>
          </div>
        </dialog>
      </div>
    );
  }

  if (role && role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p>Anda bukan Super Admin. Jika Anda Guru, silakan login di halaman /teacher.</p>
        <Button onClick={handleLogout}>Keluar</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard Super Admin</h1>
          <p className="text-muted-foreground">Kelola Akun Guru & Akses Sistem</p>
        </div>
        <Button variant="outline" onClick={handleLogout} title="Logout" className="gap-2">
          <LogOut className="w-4 h-4" /> Keluar
        </Button>
      </div>
      
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
                <Select value={newClass} onValueChange={setNewClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      <dialog ref={alertRef} className="p-6 rounded-lg shadow-xl backdrop:bg-black/50 border border-border bg-background text-foreground open:animate-in open:fade-in-90 open:zoom-in-95">
        <h3 className="text-lg font-bold mb-4">Informasi</h3>
        <p className="mb-6">{alertMessage}</p>
        <div className="flex justify-end">
          <Button onClick={() => alertRef.current?.close()}>Tutup</Button>
        </div>
      </dialog>

      <dialog ref={confirmRef} className="p-6 rounded-lg shadow-xl backdrop:bg-black/50 border border-border bg-background text-foreground open:animate-in open:fade-in-90 open:zoom-in-95 max-w-md">
        <h3 className="text-lg font-bold mb-4 text-destructive">Konfirmasi Hapus</h3>
        <p className="mb-6 text-sm text-muted-foreground">Hapus profil guru ini? (User auth di Supabase harus dihapus manual atau dengan Edge Function, profil ini hanya dihapus dari database)</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => confirmRef.current?.close()}>Batal</Button>
          <Button variant="destructive" onClick={executeDelete}>Hapus</Button>
        </div>
      </dialog>
    </div>
  );
};
