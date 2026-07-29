import { createClient } from '@supabase/supabase-js';

// 1. Grab environment variables exposed via Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Safety check to catch configuration issues early in development
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase configuration error: Missing environment variables. " +
    "Please check your local .env file or Vercel dashboard configuration."
  );
}

// 3. Initialize and export a single, reusable client instance
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);