import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import Holidays from 'date-holidays';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  // Clear all events
  const { error: delError } = await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) console.error('Delete error', delError);
  else console.log('Cleared old events');

  const events = [];

  // 1. National Holidays
  const hd = new Holidays('ID');
  const holidays = [...hd.getHolidays(2026), ...hd.getHolidays(2027)];
  
  for (const h of holidays) {
    const dStr = h.date.split(' ')[0]; // YYYY-MM-DD
    // Only from Juli 2026 to Juli 2027
    if (dStr >= '2026-07-01' && dStr <= '2027-07-31') {
      events.push({
        start_date: dStr,
        end_date: dStr,
        title: h.name,
        type: 'holiday',
        description: 'Libur Nasional',
        class_name: null // Global
      });
    }
  }

  // 2. Custom School Events
  const customEvents = [
    { start_date: '2026-07-13', end_date: '2026-07-15', title: 'MPLS', type: 'academic' },
    { start_date: '2026-08-14', end_date: '2026-08-14', title: 'Lomba Kemerdekaan', type: 'academic' },
    { start_date: '2026-08-17', end_date: '2026-08-17', title: 'Upacara Kemerdekaan', type: 'academic' },
    { start_date: '2026-09-21', end_date: '2026-09-28', title: 'ASTS Ganjil', type: 'exam' },
    { start_date: '2026-10-09', end_date: '2026-10-09', title: 'Pembagian Hasil ASTS Ganjil', type: 'academic' },
    { start_date: '2026-10-03', end_date: '2026-10-03', title: 'OC Besar', type: 'academic' },
    { start_date: '2026-10-29', end_date: '2026-10-29', title: 'OC Kecil', type: 'academic' },
    { start_date: '2026-11-20', end_date: '2026-11-21', title: 'Perjusa', type: 'academic' },
    { start_date: '2026-11-30', end_date: '2026-12-07', title: 'ASAS Ganjil', type: 'exam' },
    { start_date: '2026-12-10', end_date: '2026-12-11', title: 'Classmeeting Ganjil', type: 'academic' },
    { start_date: '2026-12-14', end_date: '2026-12-14', title: 'Pembagian Hadiah', type: 'academic' },
    { start_date: '2026-12-18', end_date: '2026-12-18', title: 'Pembagian Raport ASAS', type: 'academic' },
    { start_date: '2026-12-21', end_date: '2026-12-31', title: 'Libur Semester Ganjil', type: 'holiday' },
    { start_date: '2027-02-02', end_date: '2027-02-02', title: 'Pengajian Akbar', type: 'academic' },
    { start_date: '2027-02-22', end_date: '2027-02-26', title: 'Pesantren Kilat', type: 'academic' },
    { start_date: '2027-03-01', end_date: '2027-03-13', title: 'Perkiraan Libur Ramadhan', type: 'holiday' },
    { start_date: '2027-03-25', end_date: '2027-04-02', title: 'ASTS Genap', type: 'exam' },
    { start_date: '2027-04-16', end_date: '2027-04-16', title: 'Hasil ASTS Genap', type: 'academic' },
    { start_date: '2027-06-07', end_date: '2027-06-14', title: 'ASAT Genap', type: 'exam' },
    { start_date: '2027-06-17', end_date: '2027-06-18', title: 'Class Meeting Genap', type: 'academic' },
    { start_date: '2027-06-21', end_date: '2027-06-21', title: 'Pembagian Hadiah', type: 'academic' },
    { start_date: '2027-06-25', end_date: '2027-06-25', title: 'Pembagian Raport Kenaikan Kelas', type: 'academic' },
    { start_date: '2027-06-26', end_date: '2027-07-10', title: 'Libur Semester Genap', type: 'holiday' },
  ];

  for (let c of customEvents) {
    events.push({
      ...c,
      class_name: null // Global
    });
  }

  const { error } = await supabase.from('events').insert(events);
  if (error) {
    console.error('Insert error', error);
  } else {
    console.log(`Inserted ${events.length} events!`);
  }
}
run();
