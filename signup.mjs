import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bdclaqhqueuaxgruzsfy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkY2xhcWhxdWV1YXhncnV6c2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MzYwMjIsImV4cCI6MjA5OTUxMjAyMn0.wqUTgRrCz8E69kfe-pH7XfHNxafuqJHmotRz2j1dpEw'
);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@test.com',
    password: 'admin123mudipas',
  });
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success:', data.user?.id);
  }
}

main();
