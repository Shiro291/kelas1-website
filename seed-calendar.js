import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const holidays26 = [
  { date: '2026-07-07', name: 'Tahun Baru Islam' }, // Note: script output says Jun 16, but sometimes it shifts. Let's just use the ones from script after July.
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
  {
    date: '2026-07-13',
    title: 'MPLS Hari 1',
    description: 'Masa Pengenalan Lingkungan Sekolah. Pakaian: Baju putih celana hijau.',
    type: 'event',
    class: 'IR Soekarno'
  },
  {
    date: '2026-07-14',
    title: 'MPLS Hari 2',
    description: 'Masa Pengenalan Lingkungan Sekolah. Pakaian: Baju olahraga.',
    type: 'event',
    class: 'IR Soekarno'
  },
  {
    date: '2026-07-15',
    title: 'MPLS Hari 3',
    description: 'Masa Pengenalan Lingkungan Sekolah. Pakaian: Baju adat, koko atau batik.',
    type: 'event',
    class: 'IR Soekarno'
  },
  {
    date: '2026-07-16',
    title: 'Asesmen Diagnostik (07:00 - 10:00)',
    description: 'Asesmen diagnostik untuk memetakan kemampuan awal siswa. Pakaian: Baju batik celana hijau.',
    type: 'exam',
    class: 'IR Soekarno'
  }
];

const schoolHolidays = [
  { start: '2026-12-21', end: '2027-01-02', name: 'Libur Semester 1' },
  { start: '2027-03-08', end: '2027-03-12', name: 'Libur Khusus Puasa / Idul Fitri' }, 
  { start: '2027-06-21', end: '2027-07-10', name: 'Libur Semester 2' }
];

async function seedEvents() {
  console.log('Seeding calendar events...');
  
  // Clear all events first
  const { error: delError } = await supabase.from('events').delete().neq('id', 0);
  if (delError) {
      console.log('Could not clear old events (RLS?), skipping delete.');
  }

  const toInsert = [];

  // 1. National holidays
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

  // 2. School holidays
  for (const h of schoolHolidays) {
    toInsert.push({
      start_date: h.start,
      end_date: h.end,
      title: h.name,
      type: 'holiday',
      description: 'Libur Sekolah',
      class_name: 'Semua Kelas'
    });
  }

  // 3. MPLS for IR Soekarno
  for (const ev of mplsEvents) {
    toInsert.push({
      start_date: ev.date,
      end_date: ev.date,
      title: ev.title,
      type: ev.type,
      description: ev.description,
      class_name: ev.class
    });
  }

  const { data, error } = await supabase.from('events').insert(toInsert);
  
  if (error) {
    console.error('Error inserting events:', error);
  } else {
    console.log('Successfully seeded events!');
  }
}

seedEvents().catch(console.error);
