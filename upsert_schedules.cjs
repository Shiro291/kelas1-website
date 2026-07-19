const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const data = JSON.parse(fs.readFileSync('seed_data.json', 'utf-8'));
  
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    // Using upsert with onConflict on 'class_name,target_date'
    const { error } = await supabase.from('schedule').upsert(batch, { onConflict: 'class_name,target_date' });
    
    if (error) {
      console.error(`Error inserting batch ${i}:`, error.message);
      errorCount++;
    } else {
      successCount += batch.length;
      console.log(`Successfully upserted ${successCount}/${data.length} records...`);
    }
  }
  
  console.log(`Finished! Upserted: ${successCount}. Errors: ${errorCount}`);
}

run();
