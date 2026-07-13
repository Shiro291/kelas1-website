import React from 'react';
import { useAppContext } from '../context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Calendar, Shirt, Star, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Home: React.FC = () => {
  const { t, data, isLoading, selectedDate, setSelectedDate } = useAppContext();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Date Navigator */}
      <div className="step-home-date flex flex-col sm:flex-row items-center justify-between mb-8 bg-card p-4 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4 sm:mb-0">
          <CalendarDays className="text-primary w-6 h-6" />
          Beranda
        </h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevDay}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-primary min-w-[150px] text-center">
            {formattedDate}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8 animate-pulse text-muted-foreground">Memuat data...</div>
      ) : (
        <div className="step-home-cards grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl">{t.schedule}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{data.schedule}</p>
        </CardContent>
      </Card>
      
      <Card className="border-t-4 border-t-secondary shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <BookOpen className="w-5 h-5 text-secondary" />
          <CardTitle className="text-xl">{t.homework}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{data.homework}</p>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Shirt className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-xl">{t.uniform}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{data.uniform}</p>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Star className="w-5 h-5 text-purple-500" />
          <CardTitle className="text-xl">{t.highlights}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{data.highlights}</p>
        </CardContent>
      </Card>
        </div>
      )}
    </div>
  );
};
