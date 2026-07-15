import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function seed() {
  const selectedClass = 'IR Soekarno';
  
  // Insert a dummy student
  await supabase.from('students').insert([{
    id: '2026001',
    name: 'Budi Santoso',
    class_name: selectedClass,
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2026001',
    daily_report: ['Membaca Al-Quran', 'Sholat Dhuha', 'Matematika Dasar'],
    weekly_scores: [{week: 'Minggu 1', score: 85}],
    achievements: ['Juara 1 Lomba Menggambar'],
    teacher_notes: 'Budi sangat aktif di kelas hari ini.'
  }]);

  // Insert a dummy event for today
  const today = new Date().toISOString().split('T')[0];
  await supabase.from('events').insert([{
    start_date: today,
    end_date: today,
    title: 'Pembelajaran Interaktif (Demo)',
    type: 'academic',
    description: 'Belajar berhitung dan mewarnai.',
    class_name: selectedClass
  }]);

  console.log('Dummy data seeded!');
}

seed().catch(console.error);
