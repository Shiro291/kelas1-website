const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY); // Or however it's configured

async function run() {
  const tables = ['students', 'schedule', 'profiles'];
  for (const table of tables) {
    console.log(`Updating ${table}...`);
    const { data, error } = await supabase.from(table).update({ class_name: 'I. IR Soekarno' }).eq('class_name', 'IR Soekarno');
    if (error) console.error(error);
    else console.log(`Updated ${table} successfully`);
  }
}

run();
