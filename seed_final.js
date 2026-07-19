import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const holidays26 = [
  { date: '2026-07-07', name: 'Tahun Baru Islam' },
  { date: '2026-08-17', name: 'Hari Ulang Tahun Kemerdekaan Republik Indonesia' },
  { date: '2026-08-25', name: 'Maulid Nabi Muhammad' },
  { date: '2026-12-25', name: 'Hari Raya Natal' },
];

const holidays27 = [
  { date: '2027-01-01', name: 'Hari Tahun Baru' },
  { date: '2027-01-05', name: 'Maulid Nabi Muhammad' },
  { date: '2027-02-06', name: 'Tahun Baru Imlek' },
  { date: '2027-03-08', name: 'Hari Raya Nyepi' },
  { date: '2027-03-09', name: 'Hari Raya Idul Fitri' },
  { date: '2027-03-10', name: 'Hari Raya Idul Fitri' },
  { date: '2027-03-26', name: 'Wafat Yesus Kristus' },
  { date: '2027-05-01', name: 'Hari Buruh Internasional' },
  { date: '2027-05-06', name: 'Kenaikan Yesus Kristus' },
  { date: '2027-05-16', name: 'Hari Raya Idul Adha' },
  { date: '2027-05-20', name: 'Hari Raya Waisak' },
  { date: '2027-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2027-06-06', name: 'Tahun Baru Islam' },
];

const mplsEvents = [
  { date: '2026-07-13', title: 'MPLS Hari 1', description: 'Masa Pengenalan Lingkungan Sekolah', type: 'event', class_name: 'I. IR Soekarno' },
  { date: '2026-07-14', title: 'MPLS Hari 2', description: 'Masa Pengenalan Lingkungan Sekolah', type: 'event', class_name: 'I. IR Soekarno' },
  { date: '2026-07-15', title: 'MPLS Hari 3', description: 'Masa Pengenalan Lingkungan Sekolah', type: 'event', class_name: 'I. IR Soekarno' },
  { date: '2026-07-16', title: 'MPLS Hari 4', description: 'Masa Pengenalan Lingkungan Sekolah', type: 'event', class_name: 'I. IR Soekarno' },
  { date: '2026-07-17', title: 'MPLS Hari 5', description: 'Masa Pengenalan Lingkungan Sekolah', type: 'event', class_name: 'I. IR Soekarno' },
];

const whiteboardEvents = [
  { start: '2026-08-14', end: '2026-08-14', title: 'Lomba Kemerdekaan', type: 'event' },
  { start: '2026-08-17', end: '2026-08-17', title: 'Upacara Kemerdekaan', type: 'event' },
  { start: '2026-09-21', end: '2026-09-28', title: 'ASTS Ganjil', type: 'exam' },
  { start: '2026-10-09', end: '2026-10-09', title: 'Pembagian Hasil ASTS Ganjil', type: 'academic' },
  { start: '2026-10-03', end: '2026-10-03', title: 'OC Besar', type: 'event' },
  { start: '2026-10-29', end: '2026-10-29', title: 'OC Kecil', type: 'event' },
  { start: '2026-11-20', end: '2026-11-21', title: 'Perjusa', type: 'event' },
  { start: '2026-11-30', end: '2026-12-07', title: 'ASAS Ganjil', type: 'exam' },
  { start: '2026-12-10', end: '2026-12-11', title: 'Classmeeting Ganjil', type: 'event' },
  { start: '2026-12-14', end: '2026-12-14', title: 'Pembagian Hadiah', type: 'academic' },
  { start: '2026-12-18', end: '2026-12-18', title: 'Pembagian Raport ASAS', type: 'academic' },
  { start: '2026-12-21', end: '2026-12-31', title: 'Libur Semester Ganjil', type: 'holiday' },
  { start: '2027-02-02', end: '2027-02-02', title: 'Pengajian Akbar', type: 'event' },
  { start: '2027-02-22', end: '2027-02-26', title: 'Pesantren Kilat', type: 'event' },
  { start: '2027-03-25', end: '2027-04-02', title: 'ASTS Genap', type: 'exam' },
  { start: '2027-04-16', end: '2027-04-16', title: 'Hasil ASTS Genap', type: 'academic' },
  { start: '2027-06-07', end: '2027-06-14', title: 'ASAT Genap', type: 'exam' },
  { start: '2027-06-17', end: '2027-06-18', title: 'Class Meeting Genap', type: 'event' },
  { start: '2027-06-21', end: '2027-06-21', title: 'Pembagian Hadiah', type: 'academic' },
  { start: '2027-06-25', end: '2027-06-25', title: 'Pembagian Raport Kenaikan Kelas', type: 'academic' },
  { start: '2027-06-26', end: '2027-07-10', title: 'Libur Semester Genap', type: 'holiday' }
];

async function seedFinal() {
  console.log('Clearing ALL events to prevent duplicates...');
  
  // We use .not('id', 'is', null) to match all rows since id is never null
  const { error: delError } = await supabase.from('events').delete().not('id', 'is', null);
  if (delError) {
      console.log('Error clearing old events:', delError);
  }

  const toInsert = [];

  for (const h of [...holidays26, ...holidays27]) {
    toInsert.push({
      start_date: h.date,
      end_date: h.date,
      title: h.name,
      type: 'holiday',
      description: 'Libur Nasional',
      class_name: 'Semua Kelas'
    });
  }

  for (const h of whiteboardEvents) {
    toInsert.push({
      start_date: h.start,
      end_date: h.end,
      title: h.title,
      type: h.type,
      description: '',
      class_name: 'Semua Kelas'
    });
  }

  for (const ev of mplsEvents) {
    toInsert.push({
      start_date: ev.date,
      end_date: ev.date,
      title: ev.title,
      type: ev.type,
      description: ev.description,
      class_name: ev.class_name
    });
  }

  console.log('Inserting', toInsert.length, 'events...');
  const { error } = await supabase.from('events').insert(toInsert);
  
  if (error) {
    console.error('Error inserting events:', error);
  } else {
    console.log('Successfully seeded events!');
  }
}

seedFinal().catch(console.error);
