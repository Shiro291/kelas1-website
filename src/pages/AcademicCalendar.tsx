import React, { useState } from 'react';
import { useAppContext } from '../context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, PartyPopper, Users, GraduationCap, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';

interface CalendarEvent {
  start: string; // YYYY-MM-DD
  end: string;
  title: string;
  type: 'holiday' | 'exam' | 'event' | 'meeting';
}

const allEvents: CalendarEvent[] = [
  // Semester 1
  { start: '2026-07-13', end: '2026-07-17', title: 'MPLS', type: 'event' },
  { start: '2026-08-14', end: '2026-08-14', title: 'Lomba Kemerdekaan', type: 'event' },
  { start: '2026-08-17', end: '2026-08-17', title: 'Upacara Kemerdekaan (Libur Umum)', type: 'holiday' },
  { start: '2026-09-21', end: '2026-09-28', title: 'ASTS Ganjil', type: 'exam' },
  { start: '2026-10-03', end: '2026-10-03', title: 'Outing Class (Besar)', type: 'event' },
  { start: '2026-10-09', end: '2026-10-09', title: 'Pembagian Hasil ASTS Ganjil', type: 'meeting' },
  { start: '2026-10-29', end: '2026-10-29', title: 'Outing Class (Kecil)', type: 'event' },
  { start: '2026-11-20', end: '2026-11-21', title: 'Perjusa', type: 'event' },
  { start: '2026-11-30', end: '2026-12-07', title: 'ASAS Ganjil', type: 'exam' },
  { start: '2026-12-10', end: '2026-12-11', title: 'Classmeeting Ganjil', type: 'event' },
  { start: '2026-12-14', end: '2026-12-14', title: 'Pembagian Hadiah', type: 'event' },
  { start: '2026-12-18', end: '2026-12-18', title: 'Pembagian Raport ASAS', type: 'meeting' },
  { start: '2026-12-21', end: '2026-12-31', title: 'Libur Semester Ganjil', type: 'holiday' },
  
  // Semester 2
  { start: '2027-02-02', end: '2027-02-02', title: 'Pengajian Akbar', type: 'event' },
  { start: '2027-02-22', end: '2027-02-26', title: 'Pesantren Kilat', type: 'event' },
  { start: '2027-03-25', end: '2027-04-02', title: 'ASTS Genap', type: 'exam' },
  { start: '2027-04-16', end: '2027-04-16', title: 'Pembagian Hasil ASTS Genap', type: 'meeting' },
  { start: '2027-06-07', end: '2027-06-14', title: 'ASAT Genap (Kenaikan Kelas)', type: 'exam' },
  { start: '2027-06-17', end: '2027-06-18', title: 'Class Meeting Genap', type: 'event' },
  { start: '2027-06-21', end: '2027-06-21', title: 'Pembagian Hadiah', type: 'event' },
  { start: '2027-06-25', end: '2027-06-25', title: 'Pembagian Raport Kenaikan Kelas', type: 'meeting' },
  { start: '2027-06-26', end: '2027-07-10', title: 'Libur Semester Genap', type: 'holiday' },
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'holiday': return <PartyPopper className="w-5 h-5 text-red-500" />;
    case 'exam': return <BookOpen className="w-5 h-5 text-blue-500" />;
    case 'meeting': return <GraduationCap className="w-5 h-5 text-purple-500" />;
    default: return <Users className="w-5 h-5 text-green-500" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'holiday': return 'bg-red-500';
    case 'exam': return 'bg-blue-500';
    case 'meeting': return 'bg-purple-500';
    default: return 'bg-green-500';
  }
};

const getEventBadge = (type: string) => {
  switch (type) {
    case 'holiday': return <Badge variant="destructive">Libur</Badge>;
    case 'exam': return <Badge variant="default" className="bg-blue-500">Ujian</Badge>;
    case 'meeting': return <Badge variant="secondary" className="bg-purple-100 text-purple-700">Raport</Badge>;
    default: return <Badge variant="outline" className="text-green-600 border-green-600">Kegiatan</Badge>;
  }
};

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const AcademicCalendar: React.FC = () => {
  const { t } = useAppContext();
  
  // Start in July 2026
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Generate blank cells for the start of the month
  const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="p-2 border border-transparent"></div>);
  
  // Generate actual day cells
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Find if there are events on this date
    const dayEvents = allEvents.filter(ev => {
      return dateStr >= ev.start && dateStr <= ev.end;
    });

    return (
      <div key={day} className="border border-border min-h-[80px] p-1 flex flex-col items-start bg-card transition-colors hover:bg-slate-50">
        <span className={`text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center ${dayEvents.length > 0 ? 'bg-primary/10 text-primary' : 'text-foreground'}`}>
          {day}
        </span>
        <div className="flex flex-col gap-1 w-full mt-1">
          {dayEvents.map((ev, idx) => (
            <div key={idx} className={`${getEventColor(ev.type)} text-[10px] text-white px-1 py-0.5 rounded shadow-sm truncate`} title={ev.title}>
              {ev.title}
            </div>
          ))}
        </div>
      </div>
    );
  });

  const totalCells = [...blanks, ...dayCells];

  // List of events for the current month view
  const currentMonthEvents = allEvents.filter(ev => {
    const evStart = new Date(ev.start);
    const evEnd = new Date(ev.end);
    return (evStart.getFullYear() === year && evStart.getMonth() === month) || 
           (evEnd.getFullYear() === year && evEnd.getMonth() === month);
  });

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 pb-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t.calendar || 'Kalender Akademik'}</h1>
          <p className="text-slate-500">Tahun Ajaran 2026/2027</p>
        </div>
        <div className="flex items-center gap-4 bg-card px-4 py-2 border rounded-full shadow-sm">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-lg w-32 text-center text-primary">
            {monthNames[month]} {year}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Actual Calendar Grid */}
      <Card className="mb-8 shadow-md border-border/60 overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
          {daysOfWeek.map(d => (
            <div key={d} className="p-3 text-center font-semibold text-sm text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-card">
          {totalCells}
        </div>
      </Card>

      {/* Events for the month */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" /> Daftar Kegiatan {monthNames[month]}
        </h2>
        {currentMonthEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentMonthEvents.map((ev, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-full shrink-0">
                      {getEventIcon(ev.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{ev.title}</h3>
                      <p className="text-sm text-slate-500">
                        {ev.start === ev.end 
                          ? new Date(ev.start).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                          : `${new Date(ev.start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(ev.end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {getEventBadge(ev.type)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 border rounded-lg border-dashed">
            <p className="text-muted-foreground">Tidak ada kegiatan terjadwal di bulan {monthNames[month]}.</p>
          </div>
        )}
      </div>
    </div>
  );
};
