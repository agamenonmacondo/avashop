import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let _supabase: SupabaseClient | null = null;

/**
 * Devuelve el cliente Supabase si se puede inicializar.
 * Retorna null durante SSR/build si no hay URL (evita errores en prerender).
 * Llamar sólo desde componentes cliente (useEffect) o comprobar null.
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl) return null;
  if (_supabase) return _supabase;
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export default getSupabase;