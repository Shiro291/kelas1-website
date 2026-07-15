import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const agendaEvents = [
  // Semester 1
  { start: '2026-08-14', end: '2026-08-14', title: 'Lomba Kemerdekaan', type: 'event', class_name: 'Semua Kelas', description: 'Lomba memeriahkan kemerdekaan' },
  { start: '2026-08-17', end: '2026-08-17', title: 'Upacara Kemerdekaan', type: 'event', class_name: 'Semua Kelas', description: 'Upacara bendera HUT RI' },
  { start: '2026-09-21', end: '2026-09-28', title: 'ASTS Ganjil', type: 'exam', class_name: 'Semua Kelas', description: 'Asesmen Sumatif Tengah Semester Ganjil' },
  { start: '2026-10-09', end: '2026-10-09', title: 'Pembagian Hasil ASTS Ganjil', type: 'meeting', class_name: 'Semua Kelas', description: 'Pembagian raport tengah semester' },
  { start: '2026-10-03', end: '2026-10-03', title: 'OC Besar', type: 'event', class_name: 'Semua Kelas', description: 'Outing Class Besar' },
  { start: '2026-10-29', end: '2026-10-29', title: 'OC Kecil', type: 'event', class_name: 'Semua Kelas', description: 'Outing Class Kecil' },
  { start: '2026-11-20', end: '2026-11-21', title: 'Perjusa', type: 'event', class_name: 'Semua Kelas', description: 'Perkemahan Jumat Sabtu' },
  { start: '2026-11-30', end: '2026-12-07', title: 'ASAS Ganjil', type: 'exam', class_name: 'Semua Kelas', description: 'Asesmen Sumatif Akhir Semester Ganjil' },
  { start: '2026-12-10', end: '2026-12-11', title: 'Classmeeting Ganjil', type: 'event', class_name: 'Semua Kelas', description: 'Classmeeting setelah ujian' },
  { start: '2026-12-14', end: '2026-12-14', title: 'Pembagian Hadiah', type: 'event', class_name: 'Semua Kelas', description: 'Pembagian hadiah classmeeting' },
  { start: '2026-12-18', end: '2026-12-18', title: 'Pembagian Raport ASAS', type: 'meeting', class_name: 'Semua Kelas', description: 'Pembagian raport akhir semester ganjil' },
  
  // Semester 2
  { start: '2027-02-02', end: '2027-02-02', title: 'Pengajian Akbar', type: 'event', class_name: 'Semua Kelas', description: 'Pengajian akbar sekolah' },
  { start: '2027-02-22', end: '2027-02-26', title: 'Pesantren Kilat', type: 'event', class_name: 'Semua Kelas', description: 'Kegiatan keagamaan pesantren kilat' },
  { start: '2027-03-25', end: '2027-04-02', title: 'ASTS Genap', type: 'exam', class_name: 'Semua Kelas', description: 'Asesmen Sumatif Tengah Semester Genap' },
  { start: '2027-04-16', end: '2027-04-16', title: 'Hasil ASTS Genap', type: 'meeting', class_name: 'Semua Kelas', description: 'Pembagian raport tengah semester genap' },
  { start: '2027-06-07', end: '2027-06-14', title: 'ASAT Genap', type: 'exam', class_name: 'Semua Kelas', description: 'Asesmen Sumatif Akhir Tahun' },
  { start: '2027-06-17', end: '2027-06-18', title: 'Class Meeting Genap', type: 'event', class_name: 'Semua Kelas', description: 'Class meeting akhir tahun' },
  { start: '2027-06-21', end: '2027-06-21', title: 'Pembagian Hadiah', type: 'event', class_name: 'Semua Kelas', description: 'Pembagian hadiah' },
  { start: '2027-06-25', end: '2027-06-25', title: 'Pembagian Raport Kenaikan Kelas', type: 'meeting', class_name: 'Semua Kelas', description: 'Pembagian raport kenaikan kelas' }
];

async function seedAgenda() {
  console.log('Seeding agenda events...');
  
  const toInsert = agendaEvents.map(ev => ({
    start_date: ev.start,
    end_date: ev.end,
    title: ev.title,
    type: ev.type,
    description: ev.description,
    class_name: ev.class_name
  }));

  // Update Asesmen Diagnostik type from 'exam' to 'event' for existing one
  // Let's just find and update it
  const { data: findAsesmen } = await supabase.from('events').select('*').ilike('title', '%Asesmen Diagnostik%');
  if (findAsesmen && findAsesmen.length > 0) {
      await supabase.from('events').update({ type: 'event' }).eq('id', findAsesmen[0].id);
      console.log('Updated Asesmen Diagnostik type to event');
  }

  const { data, error } = await supabase.from('events').insert(toInsert);
  
  if (error) {
    console.error('Error inserting agenda:', error);
  } else {
    console.log('Successfully seeded agenda events!');
  }
}

seedAgenda().catch(console.error);
