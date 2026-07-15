import React, { useState } from 'react';
import { useAppContext } from '../context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, PartyPopper, Users, GraduationCap, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

interface CalendarEvent {
  start: string; // YYYY-MM-DD
  end: string;
  title: string;
  type: 'holiday' | 'exam' | 'event' | 'meeting';
}

import { supabase } from '../lib/supabase';

// Static base events can still be merged or we can rely fully on Supabase.
// Based on the user request, we want it dynamic. Let's fetch from Supabase.


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
  const { t, selectedClass } = useAppContext();

  
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);

  React.useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from('events').select('*').eq('class_name', selectedClass);
      if (!error && data) {
        // Map database fields to CalendarEvent format
        const fetchedEvents = data.map(ev => ({
          start: ev.start_date,
          end: ev.end_date,
          title: ev.title,
          type: ev.type as 'holiday' | 'exam' | 'event' | 'meeting'
        }));
        setAllEvents(fetchedEvents);
      }
    };
    fetchEvents();
  }, [selectedClass]);

  // Start at current month
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();

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

    const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

    return (
      <Dialog key={day}>
        <DialogTrigger asChild>
          <div className={`border border-border min-h-[80px] p-1 flex flex-col items-start bg-card transition-colors hover:bg-slate-50 cursor-pointer hover:border-primary/50 group relative ${isToday ? 'ring-2 ring-primary ring-inset bg-primary/5' : ''}`}>
            <span className={`text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center ${isToday ? 'bg-primary text-primary-foreground' : dayEvents.length > 0 ? 'bg-primary/10 text-primary' : 'text-foreground'}`}>
              {day}
            </span>
            <div className="flex flex-col gap-1 w-full mt-1">
              {dayEvents.map((ev, idx) => (
                <div key={idx} className={`${getEventColor(ev.type)} text-[10px] text-white px-1 py-0.5 rounded shadow-sm truncate`} title={ev.title}>
                  {ev.title}
                </div>
              ))}
            </div>
            {/* Hover indicator to show it's clickable */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded" />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kegiatan: {day} {monthNames[month]} {year}</DialogTitle>
            <DialogDescription>
              Detail jadwal kegiatan dan pembelajaran hari ini.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {dayEvents.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Agenda Utama</h4>
                {dayEvents.map((ev, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-full shrink-0">
                      {getEventIcon(ev.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{ev.title}</h3>
                      <div className="mt-1">{getEventBadge(ev.type)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Jadwal Pembelajaran</h4>
              {dayEvents.some(e => e.type === 'holiday') ? (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                  <PartyPopper className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="font-medium text-red-700">Libur Nasional / Sekolah</p>
                  <p className="text-sm text-red-600 mt-1">Tidak ada kegiatan belajar mengajar.</p>
                </div>
              ) : dayEvents.some(e => e.title.includes('(Demo)')) ? (
                <>
                  <div className="bg-muted/30 p-3 rounded-lg border flex gap-3 items-center hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Matematika</p>
                      <p className="text-sm text-muted-foreground">Belajar berhitung angka 1-20 dengan media interaktif.</p>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg border flex gap-3 items-center hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                      <PartyPopper className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Seni Budaya</p>
                      <p className="text-sm text-muted-foreground">Mewarnai pemandangan alam dan bernyanyi bersama.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 opacity-60 bg-muted/20 border rounded-lg border-dashed">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground mb-3" />
                  <p className="font-medium">Segera Hadir</p>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    Detail jadwal pembelajaran akan segera ditambahkan di sini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
