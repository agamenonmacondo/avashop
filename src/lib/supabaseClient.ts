import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl) return null; // evita crash en build/prerender
  if (_supabase) return _supabase;
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export default getSupabase;