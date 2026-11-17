import { supabase } from '@/lib/supabase';
export function adminClient() {
  if (!supabase) throw new Error('Backend unavailable');
  return supabase;
}
