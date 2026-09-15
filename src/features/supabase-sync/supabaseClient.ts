import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://juaanjhfsvtzwmznbjnq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YWFuamhmc3Z0endtem5iam5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDcyNjEsImV4cCI6MjEwNTAyMzI2MX0.Zipv4hAGpyov0avGV4JTdngLiwlSipQOjd0eOJsxx1s';

export let supabase: SupabaseClient | null = null;

try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (error) {
  console.warn('Không thể khởi tạo Supabase Client:', error);
}
