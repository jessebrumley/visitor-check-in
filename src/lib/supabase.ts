import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export type Visitor = {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  purpose?: string;
  host_name?: string;
  checked_in_at: string;
  checked_out_at?: string;
  status: 'checked_in' | 'checked_out';
  created_at: string;
  updated_at: string;
  badge_id: string;
  citizenship: boolean;
};