import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const initialStudents = [
  { id: 1, name: "Khalilur Adhib Al Ghifari", phone: "081324648430", photo: "", birthday: "", hobby: "" },
  { id: 2, name: "Salsabila Azzahra Ramadhan", phone: "081219684465", photo: "", birthday: "", hobby: "" },
  { id: 3, name: "Kaina Rinjani Nugroho", phone: "08990863224", photo: "", birthday: "", hobby: "" },
  { id: 4, name: "Azriel Rahandika Ardyansyah", phone: "082111826004", photo: "", birthday: "", hobby: "" },
  { id: 5, name: "Muhammad Arsya Budiarta", phone: "081367357055", photo: "", birthday: "", hobby: "" },
  { id: 6, name: "Nizam Zakaria Frastya", phone: "087886508005", photo: "", birthday: "", hobby: "" },
  { id: 7, name: "Marvella Annavita Hasanah", phone: "085891295531", photo: "", birthday: "", hobby: "" },
  { id: 8, name: "Rafifa Humaira Zulfha", phone: "085693238041", photo: "", birthday: "", hobby: "" },
  { id: 9, name: "Shafiyah Tazakka", phone: "085695769577", photo: "", birthday: "", hobby: "" },
  { id: 10, name: "Nizar Rayyan Syauqi", phone: "08599808029", photo: "", birthday: "", hobby: "" },
  { id: 11, name: "Aatiqah Sakinah Rahmah", phone: "", photo: "", birthday: "", hobby: "" },
  { id: 12, name: "Arsyanendra Wirabhuwana", phone: "0855106737795", photo: "", birthday: "", hobby: "" },
  { id: 13, name: "Umaira Almasyair", phone: "081808660942", photo: "", birthday: "", hobby: "" },
  { id: 14, name: "Arga Al Ghozali", phone: "088294548409", photo: "", birthday: "", hobby: "" },
  { id: 15, name: "Salma Amirah", phone: "081388441467", photo: "", birthday: "", hobby: "" },
  { id: 16, name: "Muhammad Rafa Atalah", phone: "", photo: "", birthday: "", hobby: "" },
  { id: 17, name: "Muhammad Zaki Al Fatih Nasution", phone: "081293337551", photo: "", birthday: "", hobby: "" },
  { id: 18, name: "Syafinatun Najjah", phone: "085235792173", photo: "", birthday: "", hobby: "" },
  { id: 19, name: "Ersya Keinarra Ghassani", phone: "089606766279", photo: "", birthday: "", hobby: "" },
  { id: 20, name: "Maryam Arsyila", phone: "081213544708", photo: "", birthday: "", hobby: "" },
  { id: 21, name: "Muhammad Rafaeyza Zein", phone: "08", photo: "", birthday: "", hobby: "" },
  { id: 22, name: "Ahmad Ali Husein", phone: "085886098220", photo: "", birthday: "", hobby: "" },
  { id: 23, name: "Ayunindya Qanita Mahdya", phone: "Mutasi", photo: "", birthday: "", hobby: "" },
  { id: 24, name: "Aisyah Maharani Yasmin", phone: "Mutasi", photo: "", birthday: "", hobby: "" }
];

async function seed() {
  console.log('Seeding data to Supabase...');
  
  const { count } = await supabase.from('students').select('*', { count: 'exact', head: true });
  
  if (count === 0) {
    const { error } = await supabase.from('students').insert(initialStudents);
    if (error) {
      console.error('Error inserting students:', error);
    } else {
      console.log('Successfully inserted initial students.');
    }
  } else {
    console.log('Students table already has data. Skipping seed.');
  }
}

seed();
