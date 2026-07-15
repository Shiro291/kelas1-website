const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data } = await supabase.from('events').select('*').order('start_date');
  const selectedClass = 'IR Soekarno';
  
  const filteredData = data.filter(ev => 
    !ev.class_name || ev.class_name === 'Semua Kelas' || ev.class_name === selectedClass
  );
  
  const allEvents = filteredData.map(ev => ({
    start: ev.start_date,
    end: ev.end_date,
    title: ev.title,
    type: ev.type,
    isGlobal: !ev.class_name || ev.class_name === 'Semua Kelas'
  }));

  const year = 2026;
  const month = 7; // August
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = allEvents.filter(ev => dateStr >= ev.start && dateStr <= ev.end);
    return dayEvents.length;
  });

  console.log('August days with events:', dayCells.map((c, i) => c > 0 ? (i+1) : null).filter(x => x));

  // Also test currentMonthEvents
  const currentMonthEvents = allEvents.filter(ev => {
    const evStart = new Date(ev.start);
    const evEnd = new Date(ev.end);
    return (evStart.getFullYear() === year && evStart.getMonth() === month) || 
           (evEnd.getFullYear() === year && evEnd.getMonth() === month);
  });
  console.log('Current month events count:', currentMonthEvents.length);
}
test();
