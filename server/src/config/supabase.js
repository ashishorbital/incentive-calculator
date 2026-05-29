import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_KEY missing — API will fail on DB calls');
}

export const supabase = createClient(url || '', key || '', {
  auth: { persistSession: false },
});
