import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Browser client — used in client components
export function createBrowserSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Return a dummy client during build/SSG
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Server client — used in API routes / server components
export function createServerSupabaseClient() {
  return createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Singleton browser client for reuse
let browserClient = null;
export function getSupabase() {
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient();
  }
  return browserClient;
}
