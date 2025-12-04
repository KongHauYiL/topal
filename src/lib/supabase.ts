import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TopalSite {
  id: string;
  domain: string;
  tld: string;
  full_domain: string;
  title: string;
  html_content: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
}
