import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { env } from './env';
/** Import this module only from backend-enabled features; no client is created in mock mode. */
export const supabase =
  env.vaultMode === 'supabase' && env.VITE_SUPABASE_URL && env.VITE_SUPABASE_PUBLISHABLE_KEY
    ? createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false, detectSessionInUrl: false },
      })
    : null;
