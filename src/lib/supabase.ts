import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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