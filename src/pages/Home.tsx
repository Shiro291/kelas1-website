import React from 'react';
import { useAppContext } from '../context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Calendar, Shirt, Star } from 'lucide-react';

export const Home: React.FC = () => {
  const { t, data, isLoading } = useAppContext();

  if (isLoading) {
    return <div className="flex justify-center p-8">Memuat data...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto p-4">
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
  );
};
