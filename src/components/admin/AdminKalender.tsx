import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '../../context';

interface EventData {
  id?: string;
  start_date: string;
  end_date: string;
  title: string;
  type: string;
  description: string;
  class_name?: string;
}

export const AdminKalender: React.FC = () => {
  const { selectedClass, teacherClass } = useAppContext();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isGlobal, setIsGlobal] = useState(false);

  const isSuperAdmin = !teacherClass;
  const isOwnClass = isSuperAdmin || selectedClass === teacherClass;

  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const alertRef = React.useRef<HTMLDialogElement>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (msg: string) => {
    setAlertMessage(msg);
    alertRef.current?.showModal();
  };


  useEffect(() => {
    if (selectedClass) {
      fetchEvents();
    }
  }, [selectedClass]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date');
      
    if (!error && data) {
      const filteredData = data.filter(ev => 
        !ev.class_name || ev.class_name === 'Semua Kelas' || ev.class_name === selectedClass
      );
      setEvents(filteredData as EventData[]);
    }
    setLoading(false);
  };

  const handleEdit = (event: EventData) => {
    setEditingEvent(event);
    setIsGlobal(!event.class_name || event.class_name === 'Semua Kelas');
  };

  const handleAddNew = () => {
    setEditingEvent({
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      title: '',
      type: 'academic',
      description: ''
    });
    setIsGlobal(false);
  };

  const confirmDelete = (id: string) => {
    setEventToDelete(id);
    dialogRef.current?.showModal();
  };

  const executeDelete = async () => {
    if (!eventToDelete) return;
    const { error } = await supabase.from('events').delete().eq('id', eventToDelete);
    if (error) {
      showAlert('Gagal menghapus acara: ' + error.message);
    } else {
      fetchEvents();
    }
    dialogRef.current?.close();
    setEventToDelete(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (editingEvent.id) {
      // Update
      const { error } = await supabase
        .from('events')
        .update({
          start_date: editingEvent.start_date,
          end_date: editingEvent.end_date,
          title: editingEvent.title,
          type: editingEvent.type,
          description: editingEvent.description,
          class_name: isGlobal ? 'Semua Kelas' : selectedClass,
        })
        .eq('id', editingEvent.id);

      if (error) showAlert('Gagal memperbarui data: ' + error.message);
      else {
        showAlert('Data berhasil diperbarui!');
        setEditingEvent(null);
        fetchEvents();
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('events')
        .insert([{
          start_date: editingEvent.start_date,
          end_date: editingEvent.end_date,
          title: editingEvent.title,
          type: editingEvent.type,
          description: editingEvent.description,
          class_name: isGlobal ? 'Semua Kelas' : selectedClass,
        }]);

      if (error) showAlert('Gagal menambahkan data: ' + error.message);
      else {
        showAlert('Data berhasil ditambahkan!');
        setEditingEvent(null);
        fetchEvents();
      }
    }
  };

  if (loading) return <div aria-live="polite" aria-busy="true" className="p-4 text-muted-foreground">Memuat acara kalender...</div>;

  if (editingEvent) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{editingEvent.id ? 'Edit Acara' : 'Tambah Acara'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <Input 
                  type="date" 
                  value={editingEvent.start_date} 
                  onChange={(e) => setEditingEvent({...editingEvent, start_date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Selesai</Label>
                <Input 
                  type="date" 
                  value={editingEvent.end_date} 
                  onChange={(e) => setEditingEvent({...editingEvent, end_date: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Judul Acara</Label>
              <Input 
                value={editingEvent.title} 
                onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tipe Acara</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={editingEvent.type}
                onChange={(e) => setEditingEvent({...editingEvent, type: e.target.value})}
              >
                <option value="academic">Akademik</option>
                <option value="holiday">Libur</option>
                <option value="event">Kegiatan Khusus</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea 
                value={editingEvent.description} 
                onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
              />
            </div>
            {isSuperAdmin && (
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="global-event" 
                  checked={isGlobal} 
                  onChange={(e) => setIsGlobal(e.target.checked)} 
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="global-event" className="cursor-pointer">Berlaku untuk Semua Kelas (Global)</Label>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit">Simpan</Button>
              <Button variant="outline" type="button" onClick={() => setEditingEvent(null)}>Batal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Data Kalender Akademik ({selectedClass})</CardTitle>
        {isOwnClass && <Button onClick={handleAddNew}>Tambah Acara</Button>}
      </CardHeader>
      <CardContent>
        {!isOwnClass && (
          <div className="mb-4 p-3 bg-amber-100 text-amber-900 rounded-md border border-amber-200">
            Anda sedang melihat data kelas lain. Mode edit dinonaktifkan.
          </div>
        )}
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-muted-foreground">Belum ada acara di kalender.</p>
          ) : (
            events.map(e => (
              <div key={e.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{e.title}</p>
                    {(!e.class_name || e.class_name === 'Semua Kelas') ? (
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">Global</span>
                    ) : (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Kelas</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {e.start_date} {e.start_date !== e.end_date ? `- ${e.end_date}` : ''}
                  </p>
                </div>
                {(isSuperAdmin || (isOwnClass && e.class_name !== 'Semua Kelas' && e.class_name !== null)) && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(e)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => e.id && confirmDelete(e.id)}>Hapus</Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>

      <dialog ref={dialogRef} className="p-6 rounded-lg shadow-xl backdrop:bg-black/50 border border-border bg-background text-foreground open:animate-in open:fade-in-90 open:zoom-in-95">
        <h3 className="text-lg font-bold mb-4">Konfirmasi Hapus</h3>
        <p className="mb-6">Apakah Anda yakin ingin menghapus acara ini?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => dialogRef.current?.close()}>Batal</Button>
          <Button variant="destructive" onClick={executeDelete}>Hapus</Button>
        </div>
      </dialog>

      <dialog ref={alertRef} className="p-6 rounded-lg shadow-xl backdrop:bg-black/50 border border-border bg-background text-foreground open:animate-in open:fade-in-90 open:zoom-in-95">
        <h3 className="text-lg font-bold mb-4">Informasi</h3>
        <p className="mb-6">{alertMessage}</p>
        <div className="flex justify-end">
          <Button onClick={() => alertRef.current?.close()}>Tutup</Button>
        </div>
      </dialog>
    </Card>
  );
};
