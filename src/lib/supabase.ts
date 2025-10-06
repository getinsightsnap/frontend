import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for both Vite and CRA
const getEnvVar = (key: string): string => {
  // Try Vite first (import.meta.env)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[`VITE_${key}`] || '';
  }
  // Fallback to Create React App (process.env)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`REACT_APP_${key}`] || '';
  }
  // Fallback to empty string
  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

// Debug log environment variables
console.log('🔍 Environment check:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing',
  keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'missing'
});

// Create Supabase client with fallback values to prevent app crash
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase = createClient(
  supabaseUrl || fallbackUrl, 
  supabaseAnonKey || fallbackKey
)

// Debug log (remove this after testing)
console.log('🔑 Supabase Config loaded:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  urlLength: supabaseUrl.length,
  anonKeyLength: supabaseAnonKey.length
});

// Database types
export interface User {
  id: string
  email: string
  name: string
  created_at: string
  subscription_tier: 'free' | 'standard' | 'pro'
  search_count: number
  last_reset_date: string
}

export interface SearchHistory {
  id: string
  user_id: string
  query: string
  language: string
  time_filter: string
  platforms: string[]
  results_count: number
  created_at: string
}
