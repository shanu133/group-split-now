
import { createClient } from '@supabase/supabase-js';

// Use the same configuration as the integrations client
const supabaseUrl = "https://dnlofwunhgitzjozvigz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubG9md3VuaGdpdHpqb3p2aWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MTAzMjQsImV4cCI6MjA3MjA4NjMyNH0.v56az885rWG8D4BCrLHk4jUPC4OAY8qiAashQy4muG4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Types for our database tables
export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  members?: Profile[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paid_by: string;
  group_id: string;
  category: string;
  created_at: string;
  updated_at: string;
  payer?: Profile;
  splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  user?: Profile;
}

export interface Settlement {
  id: string;
  from_user: string;
  to_user: string;
  amount: number;
  group_id: string;
  settled: boolean;
  settled_at?: string;
  created_at: string;
  from_profile?: Profile;
  to_profile?: Profile;
}