import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = 'https://exifiejtxsolzicgwpkm.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4aWZpZWp0eHNvbHppY2d3cGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MjY5MDksImV4cCI6MjA5NzQwMjkwOX0.lf8MkGr4c1CBujpnHA1mawW7_PbC4Ya8mgnOXDgtTTw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
