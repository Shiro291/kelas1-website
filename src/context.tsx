import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './i18n';
import type { Language } from './i18n';
import { supabase } from './lib/supabase';

interface ScheduleData {
  schedule: string;
  homework: string;
  uniform: string;
  highlights: string;
}

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.id;
  data: ScheduleData;
  setData: (data: ScheduleData) => Promise<void>;
  isLoading: boolean;
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

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const { data: scheduleData, error } = await supabase
          .from('schedule')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (scheduleData && !error) {
          setLocalData({
            schedule: scheduleData.schedule,
            homework: scheduleData.homework,
            uniform: scheduleData.uniform,
            highlights: scheduleData.highlights
          });
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const setData = async (newData: ScheduleData) => {
    setLocalData(newData);
    try {
      await supabase.from('schedule').insert([newData]);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const t = translations[lang];

  return (
    <AppContext.Provider value={{ lang, setLang, t, data, setData, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
