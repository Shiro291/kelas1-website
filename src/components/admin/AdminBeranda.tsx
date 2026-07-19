import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

export const AdminBeranda: React.FC = () => {
  const { t, data, setData, selectedDate, setSelectedDate, selectedClass, teacherClass } = useAppContext();
  const [formData, setFormData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);

  const isOwnClass = !teacherClass || selectedClass === teacherClass;

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnClass) return;
    setIsSaving(true);
    await setData(formData);
    setIsSaving(false);
    toast.success('Data beranda berhasil disimpan!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Card className="shadow-sm border-t-4 border-t-primary">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="text-xl text-primary">Informasi Harian</CardTitle>
      </CardHeader>
      <CardContent>
        {!isOwnClass && (
          <div className="mb-4 p-3 bg-amber-100 text-amber-900 rounded-md border border-amber-200">
            Anda sedang melihat data kelas lain. Mode edit dinonaktifkan.
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-6 mt-4">
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
            <Label htmlFor="target_date" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" /> Tanggal Kegiatan
            </Label>
            <Input 
              id="target_date" 
              type="date"
              name="target_date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)} 
              className="w-full sm:w-auto"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Data di bawah ini adalah untuk tanggal yang dipilih di atas.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule">{t.schedule}</Label>
            <Input id="schedule" name="schedule" value={formData.schedule} onChange={handleChange} disabled={!isOwnClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homework">{t.homework}</Label>
            <Input id="homework" name="homework" value={formData.homework} onChange={handleChange} disabled={!isOwnClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uniform">{t.uniform}</Label>
            <Input id="uniform" name="uniform" value={formData.uniform} onChange={handleChange} disabled={!isOwnClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="highlights">{t.highlights}</Label>
            <Textarea 
              id="highlights" 
              name="highlights" 
              value={formData.highlights} 
              onChange={handleChange} 
              rows={4} 
              disabled={!isOwnClass}
            />
          </div>
          {isOwnClass && (
            <Button type="submit" disabled={isSaving} className="w-full" aria-live="polite" aria-busy={isSaving}>
              {isSaving ? 'Menyimpan...' : t.save}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
