import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Users } from 'lucide-react';
import { useAppContext } from '../../context';
import { toast } from 'sonner';

interface ClassData {
  id: string;
  name: string;
  created_at: string;
}

interface ProfileData {
  id: string;
  email: string;
  class_name: string | null;
  role: string;
}

export const AdminKelas: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<ProfileData[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classToDelete, setClassToDelete] = useState<{id: string, name: string} | null>(null);
  
  // Need to force context update after creating a class so the Navbar dropdown updates

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [classesResponse, teachersResponse] = await Promise.all([
        supabase.from('classes').select('*').order('name'),
        supabase.from('profiles').select('*').eq('role', 'teacher')
      ]);

      if (classesResponse.data) {
        setClasses(classesResponse.data);
      }
      if (teachersResponse.data) {
        setTeachers(teachersResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('classes').insert([
        { name: newClassName.trim() }
      ]);
      
      if (error) {
        toast.error('Gagal menambah kelas: ' + error.message);
      } else {
        toast.success('Kelas berhasil ditambahkan!');
        setNewClassName('');
        fetchData();
        // The context needs a reload to reflect new class, simple reload is easiest 
        // if context doesn't expose a refetch method.
        window.location.reload();
      }
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteClass = (id: string, name: string) => {
    setClassToDelete({ id, name });
  };

  const executeDelete = async () => {
    if (!classToDelete) return;

    try {
      const { error } = await supabase.from('classes').delete().eq('id', classToDelete.id);
      if (error) {
        toast.error('Gagal menghapus kelas: ' + error.message);
      } else {
        toast.success('Kelas berhasil dihapus!');
        fetchData();
        window.location.reload();
      }
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setClassToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Tambah Kelas Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddClass} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="className">Nama Kelas</Label>
              <Input 
                id="className"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="Contoh: VII. Buya Hamka"
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kelas'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Daftar Kelas & Wali Kelas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data kelas...</div>
          ) : classes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada kelas</div>
          ) : (
            <div className="border rounded-md divide-y">
              <div className="grid grid-cols-12 bg-muted/50 p-3 font-medium text-sm">
                <div className="col-span-5">Nama Kelas</div>
                <div className="col-span-5">Guru / Wali Kelas</div>
                <div className="col-span-2 text-right">Aksi</div>
              </div>
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {classes.map(cls => {
                  // Find all teachers assigned to this class
                  const assignedTeachers = teachers.filter(t => t.class_name === cls.name);
                  
                  return (
                    <div key={cls.id} className="grid grid-cols-12 p-3 items-center text-sm hover:bg-slate-50">
                      <div className="col-span-5 font-medium">{cls.name}</div>
                      <div className="col-span-5 flex flex-wrap gap-1">
                        {assignedTeachers.length > 0 ? (
                          assignedTeachers.map(t => (
                            <Badge key={t.id} variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">
                              {t.email}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Belum ada guru</span>
                        )}
                      </div>
                      <div className="col-span-2 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => confirmDeleteClass(cls.id, cls.name)}
                          title="Hapus Kelas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!classToDelete} onOpenChange={(open) => !open && setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kelas</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus kelas <strong>{classToDelete?.name}</strong>? Data jadwal dan presensi terkait mungkin akan terpengaruh. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus Permanen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
