import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a separate client that doesn't persist the session.
// This is a workaround to allow the Super Admin to create new teacher accounts 
// from the client side without logging out the current Super Admin session.
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: () => null,
      setItem: (_key, _value) => {},
      removeItem: (_key) => {},
    },
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
});
