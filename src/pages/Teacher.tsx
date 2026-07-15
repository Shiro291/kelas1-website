import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '../lib/supabase';
import { LogOut, AlertCircle, HelpCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Joyride, type Step } from 'react-joyride';

import { AdminBeranda } from '../components/admin/AdminBeranda';
import { AdminSiswa } from '../components/admin/AdminSiswa';
import { AdminKalender } from '../components/admin/AdminKalender';

export const Teacher: React.FC = () => {
  const { t, isLoading, setSelectedClass, teacherClass, setTeacherClass } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [runTutorial, setRunTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState('beranda');

  const alertRef = React.useRef<HTMLDialogElement>(null);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    alertRef.current?.showModal();
  };

  const handleTabChange = (value: string) => {
    if (!document.startViewTransition) {
      setActiveTab(value);
      return;
    }
    document.startViewTransition(() => {
      setActiveTab(value);
    });
  };

  const tutorialSteps: Step[] = [
    {
      target: '.tour-tabs',
      content: 'Ini adalah menu navigasi Anda. Anda bisa berpindah antara Beranda Harian, Data Siswa, dan Kalender Akademik.',
    },
    {
      target: '.tour-beranda',
      content: 'Di Beranda Harian, Anda bisa memperbarui jadwal, PR, seragam, dan highlight harian untuk murid-murid di kelas Anda. Data ini akan langsung terlihat oleh orang tua.',
    },
    {
      target: '.tour-siswa',
      content: 'Di Data & Raport Siswa, Anda bisa menambah siswa baru, menghapus siswa, serta mengedit raport atau catatan guru untuk tiap siswa.',
    },
    {
      target: '.tour-kalender',
      content: 'Di Kalender Akademik, Anda dapat menambahkan agenda penting, jadwal ujian, atau hari libur. Agenda ini akan muncul di kalender orang tua.',
    }
  ];

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setRole(data.role);
        if (data.class_name) {
          setTeacherClass(data.class_name);
          setSelectedClass(data.class_name); // Auto set global class context so components fetch right data
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLoggedIn(true);
        fetchProfile(session.user.id);
        // Show tutorial if it's their first time (we can just use localStorage for a simple check)
        if (!localStorage.getItem('teacher_tutorial_seen')) {
          setRunTutorial(true);
          localStorage.setItem('teacher_tutorial_seen', 'true');
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setLoggedIn(true);
        fetchProfile(session.user.id);
      } else {
        setLoggedIn(false);
        setRole(null);
        setTeacherClass(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSelectedClass, setTeacherClass]);

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

  if (isLoading) {
    return <div aria-live="polite" aria-busy="true" className="flex justify-center p-8 text-muted-foreground">Memuat...</div>;
  }

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">Login Guru</CardTitle>
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
                  placeholder="guru@mudipas49.com"
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

  if (role && role !== 'teacher' && role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p>Anda tidak memiliki akses sebagai Guru.</p>
        <Button onClick={handleLogout}>Keluar</Button>
      </div>
    );
  }

  const JoyrideComponent = Joyride as any;

  return (
    <div className="max-w-4xl mx-auto mt-6 px-4">
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

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard Guru</h1>
          <p className="text-muted-foreground">Mengelola Kelas: <strong className="text-primary">{teacherClass || 'Semua Kelas (Superadmin)'}</strong></p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setRunTutorial(true)} title="Mulai Tutorial">
            <HelpCircle className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleLogout} title="Logout" className="gap-2">
            <LogOut className="w-4 h-4" /> Keluar
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full tour-tabs">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="beranda" className="tour-beranda">Beranda Harian</TabsTrigger>
          <TabsTrigger value="siswa" className="tour-siswa">Data & Raport Siswa</TabsTrigger>
          <TabsTrigger value="kalender" className="tour-kalender">Kalender Akademik</TabsTrigger>
        </TabsList>
        
        <TabsContent value="beranda">
          <AdminBeranda />
        </TabsContent>
        
        <TabsContent value="siswa">
          <AdminSiswa />
        </TabsContent>
        
        <TabsContent value="kalender">
          <AdminKalender />
        </TabsContent>
      </Tabs>

      <dialog ref={alertRef} className="p-6 rounded-lg shadow-xl backdrop:bg-black/50 border border-border bg-background text-foreground open:animate-in open:fade-in-90 open:zoom-in-95">
        <h3 className="text-lg font-bold mb-4">Informasi</h3>
        <p className="mb-6">{alertMessage}</p>
        <div className="flex justify-end">
          <Button onClick={() => alertRef.current?.close()}>Tutup</Button>
        </div>
      </dialog>
    </div>
  );
};
