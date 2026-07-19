import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '../lib/supabase';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Joyride, type Step } from 'react-joyride';
import { toast } from 'sonner';

import { AdminBeranda } from '../components/admin/AdminBeranda';
import { AdminSiswa } from '../components/admin/AdminSiswa';
import { AdminKalender } from '../components/admin/AdminKalender';
import { AdminAbsensi } from '../components/admin/AdminAbsensi';

export const Teacher: React.FC = () => {
  const { t, isLoading, setSelectedClass, teacherClass, setTeacherClass, selectedClass } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [runTutorial, setRunTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState('beranda');

  const showAlert = (msg: string) => {
    toast(msg);
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
      content: 'Di Beranda Harian, Anda bisa menambah, mengedit, atau menghapus (delete) jadwal, PR, seragam, dan highlight harian untuk murid-murid di kelas Anda.',
    },
    {
      target: '.tour-siswa',
      content: 'Di Data & Raport Siswa, Anda bisa menambah siswa baru, menghapus siswa (delete), serta mengedit raport atau catatan guru untuk tiap siswa.',
    },
    {
      target: '.tour-kalender',
      content: role === 'superadmin' 
        ? 'Di Kalender Akademik, Anda dapat menambah atau menghapus agenda. Sebagai Super Admin, Anda bisa mencentang "Berlaku untuk Semua Kelas (Global)".'
        : 'Di Kalender Akademik, Anda dapat menambah, mengedit atau menghapus agenda penting. Agenda ini akan muncul di kalender orang tua.',
    },
    {
      target: '.tour-absensi',
      content: 'Di fitur Absensi, Anda dapat memantau kehadiran siswa setiap harinya dan memberi keterangan Hadir, Sakit, Izin, atau Alpa.',
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

  if (isLoading) {
    return <div aria-live="polite" aria-busy="true" className="flex justify-center p-8 text-muted-foreground">Memuat...</div>;
  }

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4">
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
      </div>
    );
  }

  if (role && role !== 'teacher' && role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p>Anda tidak memiliki akses sebagai Guru.</p>
      </div>
    );
  }

  const isReadOnly = role !== 'superadmin' && selectedClass !== teacherClass;
  const JoyrideComponent = Joyride as any;

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
          <h2 className="text-lg font-bold text-primary">Manajemen Kelas</h2>
          {isReadOnly ? (
            <p className="text-sm text-amber-600 font-medium">Mode Baca: Anda hanya dapat mengedit kelas Anda sendiri ({teacherClass}).</p>
          ) : (
            <p className="text-sm text-green-600 font-medium">Mode Edit Aktif.</p>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={() => setRunTutorial(true)} title="Mulai Tutorial">
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full tour-tabs">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="beranda" className="tour-beranda">Beranda Harian</TabsTrigger>
          <TabsTrigger value="siswa" className="tour-siswa">Data & Raport Siswa</TabsTrigger>
          <TabsTrigger value="kalender" className="tour-kalender">Kalender Akademik</TabsTrigger>
          <TabsTrigger value="absensi" className="tour-absensi">Absensi</TabsTrigger>
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

        <TabsContent value="absensi">
          <AdminAbsensi />
        </TabsContent>
      </Tabs>
    </div>
  );
};
