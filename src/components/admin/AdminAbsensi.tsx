import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Save } from 'lucide-react';
import type { Student } from '../../data';
import { toast } from 'sonner';

interface AttendanceRecord {
  id?: string;
  student_id: number;
  date: string;
  status: 'masuk' | 'izin' | 'sakit' | 'alfa';
  notes: string;
}

export const AdminAbsensi: React.FC = () => {
  const { selectedDate, selectedClass, teacherClass } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<number, AttendanceRecord>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [exportRange, setExportRange] = useState('day');

  const isOwnClass = !teacherClass || selectedClass === teacherClass;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Fetch students for the class
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('class_name', selectedClass)
        .order('name');

      if (studentData) {
        setStudents(studentData as Student[]);
      } else {
        setStudents([]);
      }

      // Fetch attendance for the selected date
      const { data: attData } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', selectedDate);
        
      const attMap: Record<number, AttendanceRecord> = {};
      if (attData) {
        attData.forEach((record: any) => {
          attMap[record.student_id] = {
            id: record.id,
            student_id: record.student_id,
            date: record.date,
            status: record.status,
            notes: record.notes || ''
          };
        });
      }
      setAttendance(attMap);
      setIsLoading(false);
    };
    
    fetchData();
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId: number, status: AttendanceRecord['status']) => {
    if (!isOwnClass) return;
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        date: selectedDate,
        status,
        notes: prev[studentId]?.notes || ''
      }
    }));
  };

  const handleNotesChange = (studentId: number, notes: string) => {
    if (!isOwnClass) return;
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        date: selectedDate,
        status: prev[studentId]?.status || 'masuk',
        notes
      }
    }));
  };

  const handleSave = async () => {
    if (!isOwnClass) return;
    setIsSaving(true);
    
    const recordsToSave = Object.values(attendance).map(record => ({
      ...record,
      date: selectedDate,
    }));

    if (recordsToSave.length > 0) {
      const { error } = await supabase
        .from('attendance')
        .upsert(recordsToSave, { onConflict: 'student_id,date' });
        
      if (error) {
        console.error('Error saving attendance:', error);
        toast.error('Gagal menyimpan absensi.');
      } else {
        toast.success('Absensi berhasil disimpan!');
      }
    }
    
    setIsSaving(false);
  };

  const exportCSV = async () => {
    setIsLoading(true);
    // calculate date range based on exportRange ('day', 'week', 'month', 'year')
    const endDate = new Date(selectedDate);
    const startDate = new Date(selectedDate);
    
    if (exportRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (exportRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (exportRange === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const { data: attData } = await supabase
      .from('attendance')
      .select('*, students(name, class_name)')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });
      
    setIsLoading(false);

    if (!attData || attData.length === 0) {
      toast.error('Tidak ada data absensi untuk rentang waktu ini.');
      return;
    }

    // Filter by selectedClass if needed
    const filteredData = attData.filter(d => d.students?.class_name === selectedClass);

    if (filteredData.length === 0) {
      toast.error('Tidak ada data absensi untuk rentang waktu ini di kelas ini.');
      return;
    }

    const headers = ['Tanggal', 'Nama Siswa', 'Kelas', 'Status', 'Keterangan', 'Waktu Tercatat'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(record => [
        record.date,
        `"${record.students?.name || 'Unknown'}"`,
        `"${record.students?.class_name || 'Unknown'}"`,
        record.status,
        `"${record.notes || ''}"`,
        new Date(record.created_at).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `absensi_${selectedClass}_${exportRange}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-sm border-t-4 border-t-green-500">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="text-xl text-green-600">Absensi Siswa</CardTitle>
        <div className="flex gap-2 items-center">
          <Select value={exportRange} onValueChange={setExportRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Rentang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Harian</SelectItem>
              <SelectItem value="week">Mingguan</SelectItem>
              <SelectItem value="month">Bulanan</SelectItem>
              <SelectItem value="year">Tahunan</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV} className="flex gap-1" disabled={isLoading}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isOwnClass && (
          <div className="mb-4 p-3 bg-amber-100 text-amber-900 rounded-md border border-amber-200">
            Anda sedang melihat data kelas lain. Mode edit dinonaktifkan.
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center p-4">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3">Nama Siswa</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const record = attendance[student.id] || { status: 'masuk', notes: '' };
                  return (
                    <tr key={student.id} className="border-b">
                      <td className="px-4 py-3 font-medium">{student.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={record.status === 'masuk' ? 'default' : 'outline'}
                            className={record.status === 'masuk' ? 'bg-green-500 hover:bg-green-600' : ''}
                            onClick={() => handleStatusChange(student.id, 'masuk')}
                            disabled={!isOwnClass}
                          >Masuk</Button>
                          <Button 
                            size="sm" 
                            variant={record.status === 'izin' ? 'default' : 'outline'}
                            className={record.status === 'izin' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                            onClick={() => handleStatusChange(student.id, 'izin')}
                            disabled={!isOwnClass}
                          >Izin</Button>
                          <Button 
                            size="sm" 
                            variant={record.status === 'sakit' ? 'default' : 'outline'}
                            className={record.status === 'sakit' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                            onClick={() => handleStatusChange(student.id, 'sakit')}
                            disabled={!isOwnClass}
                          >Sakit</Button>
                          <Button 
                            size="sm" 
                            variant={record.status === 'alfa' ? 'default' : 'outline'}
                            className={record.status === 'alfa' ? 'bg-red-500 hover:bg-red-600' : ''}
                            onClick={() => handleStatusChange(student.id, 'alfa')}
                            disabled={!isOwnClass}
                          >Alfa</Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          placeholder="Sakit demam..." 
                          value={record.notes}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          disabled={!isOwnClass}
                          className="min-w-[150px]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || !isOwnClass} className="flex gap-2 bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Absensi'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
