import { createClient } from '@supabase/supabase-js';

// Hardcoded fallback for production stability
const HARDCODED_URL = 'https://onwvisahipnlpdijqzoa.supabase.co';
// UPDATED KEY: Matches local .env (Confirmed valid)
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ud3Zpc2FoaXBubHBkaWpxem9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODE0NzEsImV4cCI6MjA4NDA1NzQ3MX0.BBUSXoFkC4ZUBggxHYNdMaw7IfL5xs8DcVGfiSOfI2Y';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || HARDCODED_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || HARDCODED_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // Only warn if we are NOT in mock mode, otherwise this is expected
    if (!import.meta.env.VITE_USE_MOCK) {
        console.warn('Missing Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
    }
}

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);
