import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context';
import { supabase } from '../lib/supabase';
import type { Student } from '../data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, Calendar, Heart, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export const Roster: React.FC = () => {
  const { t, selectedClass } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Record<number, { status: string; notes: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  const [attendanceDate, setAttendanceDate] = useState(todayStr);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('class_name', selectedClass)
          .order('name');
        
        if (data && !error) {
          setStudents(data as Student[]);
          
          // Fetch attendance for selected date
          const studentIds = data.map(s => s.id);
          if (studentIds.length > 0) {
            const { data: attendanceData, error: attendanceError } = await supabase
              .from('attendance')
              .select('*')
              .in('student_id', studentIds)
              .eq('date', attendanceDate);
              
            if (attendanceData && !attendanceError) {
              const attendanceMap: Record<number, { status: string; notes: string }> = {};
              attendanceData.forEach(record => {
                attendanceMap[record.student_id] = { status: record.status, notes: record.notes };
              });
              setAttendances(attendanceMap);
            } else {
              setAttendances({});
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass, attendanceDate]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Memuat daftar siswa...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-primary">{t.roster}</h2>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-muted-foreground" />
          <Input 
            type="date"
            value={attendanceDate} 
            onChange={e => setAttendanceDate(e.target.value)} 
            className="w-auto shadow-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {students.map(s => (
          <Dialog key={s.id}>
            <DialogTrigger asChild>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Avatar className="w-24 h-32 rounded-lg mb-4 border-2 border-primary/20">
                    <AvatarImage src={s.photo || ''} alt={s.name} className="object-cover" />
                    <AvatarFallback className="rounded-lg text-2xl font-bold bg-muted text-muted-foreground">3x4</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-1">{s.name}</h3>
                  {attendances[s.id] && (
                    <div className="flex flex-col items-center mb-2">
                      <Badge 
                        variant={
                          attendances[s.id].status === 'masuk' ? 'default' : 
                          attendances[s.id].status === 'sakit' ? 'secondary' : 
                          attendances[s.id].status === 'izin' ? 'outline' : 'destructive'
                        }
                        className={
                          attendances[s.id].status === 'masuk' ? 'bg-green-500' :
                          attendances[s.id].status === 'sakit' ? 'bg-blue-500 text-white' :
                          attendances[s.id].status === 'izin' ? 'bg-yellow-500 text-white border-none' : ''
                        }
                      >
                        {attendances[s.id].status.charAt(0).toUpperCase() + attendances[s.id].status.slice(1)}
                      </Badge>
                      {attendances[s.id].notes && attendances[s.id].status !== 'masuk' && (
                        <span className="text-xs text-muted-foreground mt-1 italic">
                          "{attendances[s.id].notes}"
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 w-full text-sm mt-1 text-left">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {s.phone === 'Mutasi' ? (
                        <Badge variant="destructive">{t.transferred}</Badge>
                      ) : !s.phone ? (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">{t.noNumber}</Badge>
                      ) : s.phone === '08' ? (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">{t.invalidNumber}</Badge>
                      ) : (
                        <span className="text-muted-foreground">{s.phone}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{s.birthday || '-'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      <span>{s.hobby || '-'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            
            {s.id === 9999 ? (
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Raport Online: {s.name}</DialogTitle>
                  <DialogDescription>Laporan perkembangan harian, mingguan, dan bulanan (Versi Prototype)</DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                      <AvatarImage src={s.photo || ''} alt={s.name} className="object-cover" />
                      <AvatarFallback className="rounded-lg text-lg font-bold bg-muted text-muted-foreground">3x4</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{s.name}</h4>
                      <p className="text-sm text-muted-foreground">Tanggal Lahir: {s.birthday || '-'}</p>
                      <p className="text-sm text-muted-foreground">Hobi: {s.hobby || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Laporan Harian (Hari Ini)</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Hadir tepat waktu (06:45 WIB)</li>
                      <li>Sangat aktif dalam sesi tanya jawab Matematika</li>
                      <li>Membawa bekal sehat dan menghabiskan makan siangnya</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Nilai Mingguan</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Membaca & Menulis</span>
                        <Badge variant="default" className="bg-green-500">A (Sangat Baik)</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Berhitung</span>
                        <Badge variant="default" className="bg-blue-500">B+ (Baik)</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Seni & Kreativitas</span>
                        <Badge variant="default" className="bg-purple-500">A (Sangat Baik)</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-2 text-primary">Catatan Guru Bulan Ini</h4>
                    <p className="text-sm text-slate-700 italic">"{s.name} menunjukkan perkembangan yang sangat pesat dalam kemampuan berhitung dan selalu ceria saat bermain bersama teman-teman."</p>
                  </div>
                </div>
              </DialogContent>
            ) : (s.daily_report || s.weekly_scores || s.teacher_notes) ? (
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Raport Online: {s.name}</DialogTitle>
                  <DialogDescription>Laporan perkembangan belajar siswa</DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                      <AvatarImage src={s.photo || ''} alt={s.name} className="object-cover" />
                      <AvatarFallback className="rounded-lg text-lg font-bold bg-muted text-muted-foreground">3x4</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{s.name}</h4>
                      <p className="text-sm text-muted-foreground">Tanggal Lahir: {s.birthday || '-'}</p>
                      <p className="text-sm text-muted-foreground">Hobi: {s.hobby || '-'}</p>
                    </div>
                  </div>
                  
                  {s.daily_report && s.daily_report.length > 0 && (
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">Laporan Harian</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {s.daily_report.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {s.weekly_scores && Object.keys(s.weekly_scores).length > 0 && (
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h4 className="font-semibold mb-2">Nilai Mingguan</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(s.weekly_scores).map(([subject, score], idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span>{subject}</span>
                            <Badge variant="default" className="bg-blue-500">{score}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {s.teacher_notes && (
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <h4 className="font-semibold mb-2 text-primary">Catatan Guru</h4>
                      <p className="text-sm text-slate-700 italic">"{s.teacher_notes}"</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            ) : (
              <DialogContent className="max-w-md text-center p-8">
                <DialogHeader>
                  <DialogTitle className="text-center">Raport Online: {s.name}</DialogTitle>
                  <DialogDescription className="text-center">
                    Belum ada data raport untuk siswa ini.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col items-center justify-center py-8 opacity-60">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-1">Segera Hadir</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    Laporan perkembangan akan diperbarui oleh guru.
                  </p>
                </div>
              </DialogContent>
            )}
          </Dialog>
        ))}
      </div>
    </div>
  );
};
