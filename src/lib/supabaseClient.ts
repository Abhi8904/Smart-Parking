import { createClient } from '@supabase/supabase-js';

// 1. Grab environment variables exposed via Vite (matching your dashboard naming)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// 2. Safety check to catch configuration issues early
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase configuration error: Missing environment variables. " +
    "Please check your local .env file or deployment dashboard configuration."
  );
}

// 3. Initialize and export a single, reusable client instance
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);