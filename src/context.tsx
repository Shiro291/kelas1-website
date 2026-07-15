import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations } from './i18n';
import type { Language } from './i18n';
import { supabase } from './lib/supabase';

interface ScheduleData {
  schedule: string;
  homework: string;
  uniform: string;
  highlights: string;
  target_date?: string;
  class_name?: string;
}

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.id;
  data: ScheduleData;
  setData: (data: ScheduleData) => Promise<void>;
  isLoading: boolean;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  teacherClass: string | null;
  setTeacherClass: (cls: string | null) => void;
}

const defaultData: ScheduleData = {
  schedule: 'Matematika, Agama, Penjas',
  homework: 'Buku Paket Hal 12',
  uniform: 'Batik & Sepatu Hitam',
  highlights: 'Minggu ini anak-anak belajar melukis!'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('id');
  const [data, setLocalData] = useState<ScheduleData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('IR Soekarno');
  const [teacherClass, setTeacherClass] = useState<string | null>(null);
  
  // Format today as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const { data: scheduleData, error } = await supabase
          .from('schedule')
          .select('*')
          .eq('target_date', selectedDate)
          .eq('class_name', selectedClass)
          .single();
          
        if (scheduleData && !error) {
          setLocalData({
            schedule: scheduleData.schedule,
            homework: scheduleData.homework,
            uniform: scheduleData.uniform,
            highlights: scheduleData.highlights,
            target_date: scheduleData.target_date,
            class_name: scheduleData.class_name
          });
        } else {
          // If no data found for this date, reset to empty or default message
          setLocalData({
            schedule: 'Belum ada jadwal',
            homework: 'Belum ada PR',
            uniform: 'Belum ditentukan',
            highlights: 'Belum ada sorotan',
            target_date: selectedDate,
            class_name: selectedClass
          });
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, [selectedDate, selectedClass]);

  const setData = async (newData: ScheduleData) => {
    setLocalData(newData);
    try {
      // Upsert based on class_name and target_date using the new unique constraint
      await supabase.from('schedule').upsert([{
        ...newData,
        target_date: newData.target_date || selectedDate,
        class_name: newData.class_name || selectedClass
      }], { onConflict: 'class_name,target_date' });
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const t = translations[lang];

  const value = useMemo(() => ({
    lang, setLang, t, data, setData, isLoading, selectedDate, setSelectedDate, selectedClass, setSelectedClass, teacherClass, setTeacherClass
  }), [lang, t, data, isLoading, selectedDate, selectedClass, teacherClass]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
