import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Student } from '../../data';
import { useAppContext } from '../../context';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const AdminSiswa: React.FC = () => {
  const { selectedClass, teacherClass } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const isOwnClass = !teacherClass || selectedClass === teacherClass;
  
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  
  // New student state
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', id: '' });

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_name', selectedClass)
      .order('name');
      
    if (!error && data) {
      setStudents(data as Student[]);
    }
    setLoading(false);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
  };

  const confirmDelete = (id: string) => {
    setStudentToDelete(id);
  };

  const executeDelete = async () => {
    if (!studentToDelete) return;
    
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentToDelete)
      .eq('class_name', selectedClass);
      
    if (error) {
      toast.error('Gagal menghapus siswa: ' + error.message);
    } else {
      toast.success('Siswa berhasil dihapus!');
      fetchStudents();
    }
    setStudentToDelete(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const { error } = await supabase
      .from('students')
      .update({
        daily_report: editingStudent.daily_report,
        weekly_scores: editingStudent.weekly_scores,
        teacher_notes: editingStudent.teacher_notes,
      })
      .eq('id', editingStudent.id);

    if (error) {
      toast.error('Gagal menyimpan data: ' + error.message);
    } else {
      toast.success('Data siswa berhasil disimpan!');
      setEditingStudent(null);
      fetchStudents();
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('students')
      .insert([{
        id: newStudent.id,
        name: newStudent.name,
        class_name: selectedClass,
        photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newStudent.id}`,
        daily_report: [],
        weekly_scores: [],
        achievements: []
      }]);

    if (error) {
      toast.error('Gagal menambah siswa: ' + error.message);
    } else {
      toast.success('Siswa berhasil ditambahkan!');
      setIsAdding(false);
      setNewStudent({ name: '', id: '' });
      fetchStudents();
    }
  };

  if (loading) return <div aria-live="polite" aria-busy="true" className="p-4 text-muted-foreground">Memuat data siswa...</div>;

  if (isAdding) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tambah Siswa Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="space-y-2">
              <Label>NIS / ID Siswa</Label>
              <Input 
                value={newStudent.id} 
                onChange={(e) => setNewStudent({...newStudent, id: e.target.value})}
                placeholder="Misal: 2026001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input 
                value={newStudent.name} 
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                placeholder="Nama Siswa"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Tambah</Button>
              <Button variant="outline" type="button" onClick={() => setIsAdding(false)}>Batal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (editingStudent) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Edit Raport Siswa: {editingStudent.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Laporan Harian (pisahkan dengan koma)</Label>
              <Textarea 
                value={editingStudent.daily_report?.join(', ') || ''} 
                onChange={(e) => setEditingStudent({
                  ...editingStudent,
                  daily_report: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Catatan Guru</Label>
              <Textarea 
                value={editingStudent.teacher_notes || ''} 
                onChange={(e) => setEditingStudent({
                  ...editingStudent,
                  teacher_notes: e.target.value
                })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Simpan</Button>
              <Button variant="outline" type="button" onClick={() => setEditingStudent(null)}>Batal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Data Siswa ({selectedClass})</CardTitle>
        {isOwnClass && <Button onClick={() => setIsAdding(true)}>Tambah Siswa</Button>}
      </CardHeader>
      <CardContent>
        {!isOwnClass && (
          <div className="mb-4 p-3 bg-amber-100 text-amber-900 rounded-md border border-amber-200">
            Anda sedang melihat data kelas lain. Mode edit dinonaktifkan.
          </div>
        )}
        <div className="space-y-4">
          {students.length === 0 ? (
            <p className="text-muted-foreground">Belum ada siswa di kelas ini.</p>
          ) : (
            students.map(s => (
              <div key={s.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.id}</p>
                </div>
                {isOwnClass && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(s)}>Edit Raport</Button>
                    <Button variant="destructive" size="sm" onClick={() => confirmDelete(s.id.toString())}>Hapus</Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>

      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus siswa ini dari kelas? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus Siswa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
