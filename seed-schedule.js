import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const class_name = 'IR Soekarno';

const scheduleData = [
  {
    target_date: '2026-07-13',
    class_name,
    schedule: 'MPLS Hari Pertama: Pengenalan Lingkungan Sekolah',
    homework: 'Tidak ada PR, istirahat yang cukup',
    uniform: 'Seragam Bebas Rapi',
    highlights: 'Hari ini anak-anak sangat antusias menonton penampilan ekskul marching band, atraksi Tapak Suci, dan serunya Cat Show seragam sekolah!'
  },
  {
    target_date: '2026-07-14',
    class_name,
    schedule: 'MPLS Hari Kedua: Kegiatan Motorik',
    homework: 'Tidak ada PR',
    uniform: 'Seragam Olahraga',
    highlights: 'Anak-anak bersemangat mengikuti berbagai kegiatan motorik yang melatih ketangkasan dan kerja sama dengan teman-teman baru.'
  },
  {
    target_date: '2026-07-15',
    class_name,
    schedule: 'MPLS Hari Ketiga: Pawai & Makan Sehat',
    homework: 'Bercerita pengalaman pawai di rumah',
    uniform: 'Baju Adat Nusantara',
    highlights: 'Luar biasa meriah! Anak-anak tampil percaya diri dengan baju adatnya saat pawai keliling sekolah, dilanjutkan dengan sesi makan sehat bersama untuk mengembalikan energi.'
  },
  {
    target_date: '2026-07-16',
    class_name,
    schedule: 'KBM / Pengenalan Kelas Lanjutan',
    homework: 'Membawa alat tulis lengkap',
    uniform: 'Seragam Batik',
    highlights: 'Besok kita akan mulai belajar rutinitas kelas. Jangan lupa seragam Batik ya!'
  }
];

async function insertData() {
  for (const data of scheduleData) {
    const { error } = await supabase.from('schedule').upsert([data], { onConflict: 'class_name,target_date' });
    if (error) {
      console.error(`Error inserting ${data.target_date}:`, error);
    } else {
      console.log(`Successfully inserted data for ${data.target_date}`);
    }
  }
}

insertData();
