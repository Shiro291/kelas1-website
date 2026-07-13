import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context';
import { supabase } from '../lib/supabase';
import type { Student } from '../data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, Calendar, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

export const Roster: React.FC = () => {
  const { t } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('name');
        
        if (data && !error) {
          setStudents(data as Student[]);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-8">Memuat daftar siswa...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-primary">{t.roster}</h2>
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
                  <h3 className="font-semibold text-lg mb-2">{s.name}</h3>
                  
                  <div className="flex flex-col gap-2 w-full text-sm mt-2 text-left">
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
            
            <DialogContent className="max-w-md text-center p-8">
              <DialogHeader>
                <DialogTitle className="text-center">Raport Online: {s.name}</DialogTitle>
                <DialogDescription className="text-center">
                  Fitur ini masih dalam tahap pengembangan.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col items-center justify-center py-8 opacity-60">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-1">Segera Hadir</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  Laporan perkembangan harian, mingguan, dan bulanan siswa akan segera ditambahkan di sini.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};
