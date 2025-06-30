import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helper functions
export const db = {
  // Users
  getUser: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return { data, error };
  },

  createUser: async (userData: any) => {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    return { data, error };
  },

  createUserForSpouse: async (userData: any) => {
    try {
      console.log('Creating spouse user with data:', userData);
      
      // Ensure we have the correct structure for spouse creation
      const spouseData = {
        name: userData.name,
        email: userData.email || 'spouse@example.com', // Fallback email
        date_of_birth: userData.date_of_birth || '1990-01-01',
        province: userData.province || 'Ontario',
        relationship_status: userData.relationship_status || 'married',
        is_primary: false, // Critical: this must be false for spouse
        contribution_limits: userData.contribution_limits || {
          rrsp: {
            taxYearContributionRoom: 31560,
            totalFirstContributionPeriod: 0,
            totalSecondContributionPeriod: 0,
            totalTaxYearContributions: 0,
            unusedContributions: 0,
            pensionAdjustment: 0,
            availableContributionRoom: 31560
          },
          tfsa: {
            maxAnnual: 7000,
            cumulativeRoom: 95000,
            withdrawalRoom: 0
          }
        }
      };

      console.log('Formatted spouse data:', spouseData);

      const { data, error } = await supabase
        .from('users')
        .insert(spouseData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating spouse:', error);
        throw error;
      }

      console.log('Successfully created spouse user:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error in createUserForSpouse:', error);
      return { data: null, error };
    }
  },

  updateUser: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Accounts
  getAccounts: async (userId?: string) => {
    let query = supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  createAccount: async (account: any) => {
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single();
    return { data, error };
  },

  updateAccount: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  deleteAccount: async (id: string) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Transactions
  getTransactions: async (userId?: string, accountId?: string) => {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  createTransaction: async (transaction: any) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    return { data, error };
  },

  updateTransaction: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  deleteTransaction: async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Goals
  getGoals: async (userId?: string) => {
    let query = supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  createGoal: async (goal: any) => {
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single();
    return { data, error };
  },

  updateGoal: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  deleteGoal: async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Couples
  getCouple: async (userId: string) => {
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .or(`partner1_id.eq.${userId},partner2_id.eq.${userId}`)
      .single();
    return { data, error };
  },

  createCouple: async (couple: any) => {
    const { data, error } = await supabase
      .from('couples')
      .insert(couple)
      .select()
      .single();
    return { data, error };
  }
};