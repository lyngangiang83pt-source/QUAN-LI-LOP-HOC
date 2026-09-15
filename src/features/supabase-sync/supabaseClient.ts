import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'SUPABASE_CUSTOM_URL';
const STORAGE_ANON_KEY = 'SUPABASE_CUSTOM_ANON_KEY';

export function getSavedCredentials(): { url: string; anonKey: string; isCustom: boolean } {
  const customUrl = localStorage.getItem(STORAGE_URL_KEY);
  const customKey = localStorage.getItem(STORAGE_ANON_KEY);

  const isCustom = !!(customUrl && customKey);
  const url = customUrl || import.meta.env.VITE_SUPABASE_URL || 'https://juaanjhfsvtzwmznbjnq.supabase.co';
  const anonKey =
    customKey ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YWFuamhmc3Z0endtem5iam5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDcyNjEsImV4cCI6MjEwNTAyMzI2MX0.Zipv4hAGpyov0avGV4JTdngLiwlSipQOjd0eOJsxx1s';

  return { url, anonKey, isCustom };
}

export function saveCustomCredentials(url: string, anonKey: string): boolean {
  try {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    reinitSupabaseClient();
    return true;
  } catch (e) {
    console.error('Không thể lưu cấu hình Supabase vào localStorage:', e);
    return false;
  }
}

export function clearCustomCredentials(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_ANON_KEY);
  reinitSupabaseClient();
}

export let supabase: SupabaseClient | null = null;

export function reinitSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSavedCredentials();
  try {
    if (url && anonKey) {
      supabase = createClient(url, anonKey);
      return supabase;
    }
  } catch (error) {
    console.warn('Không thể khởi tạo Supabase Client:', error);
  }
  return null;
}

// Khởi tạo Supabase Client ban đầu
reinitSupabaseClient();

