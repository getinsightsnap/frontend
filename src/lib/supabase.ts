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

// Use actual Supabase credentials
const actualUrl = 'https://gytwrtduuauffcrvnlza.supabase.co';
const actualKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dHdydGR1dWF1ZmZjcnZubHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NzUyMDAsImV4cCI6MjA3MjE1MTIwMH0.1YUii8tAfXf7sHvKIE317uawYux6U_Ow74bqCUXkyzw';

export const supabase = createClient(actualUrl, actualKey)

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