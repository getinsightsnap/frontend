import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export class AuthService {
  // Sign in with Google
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error }
    }
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      if (error) throw error

      // Create user profile in your custom users table
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                name: name,
                subscription_tier: 'free',
                search_count: 0,
                last_reset_date: new Date().toISOString()
              }
            ])

          if (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't throw error, user can still verify email and sign in
            // Profile will be created when they first access the app
          } else {
            console.log('✅ User profile created successfully')
          }
        } catch (err) {
          console.error('Exception creating profile:', err)
          // Continue with signup process even if profile creation fails
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  // Test database connection and auth system
  static async testDatabaseConnection() {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test auth system instead of custom table
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        return { success: false, error };
      }
      
      console.log('✅ Supabase connection test successful');
      console.log('ℹ️ Current session status:', session ? 'Active' : 'No active session');
      return { success: true, data: { session } };
    } catch (err) {
      console.error('❌ Supabase connection test exception:', err);
      return { success: false, error: err };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      console.log('🔍 getCurrentUser: Starting user fetch...');
      
      // First check if there's an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ getCurrentUser: Session error:', sessionError);
        return { user: null, profile: null }
      }
      
      if (!session || !session.user) {
        console.log('ℹ️ getCurrentUser: No active session');
        return { user: null, profile: null }
      }

      // Use the user from the session
      const user = session.user
      console.log('✅ getCurrentUser: Found user in session:', user.email);
      
      // Create profile data directly from auth user data
      // Since we don't have a custom users table, we'll use the auth user data
      const storageKey = `search_count_${user.id}`;
      const searchCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
      
      const profile = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        subscription_tier: 'free',
        search_count: searchCount,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      };
      
      console.log('✅ getCurrentUser: Created profile from auth data:', profile);
      return { user, profile }
      
    } catch (error: any) {
      console.error('❌ getCurrentUser: Top-level error:', error);
      return { user: null, profile: null }
    }
  }

  // Update user search count (using localStorage for now since we don't have custom users table)
  static async updateSearchCount(userId: string, increment: number = 1) {
    try {
      // For now, use localStorage to track search count
      // In the future, you can create a custom users table if needed
      const storageKey = `search_count_${userId}`;
      const currentCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
      const newCount = currentCount + increment;
      
      localStorage.setItem(storageKey, newCount.toString());
      
      console.log(`📊 Updated search count for user ${userId}: ${currentCount} -> ${newCount}`);
      
      return { data: { search_count: newCount }, error: null }
    } catch (error) {
      console.error('Update search count error:', error)
      return { data: null, error }
    }
  }

  // Save search history
  static async saveSearchHistory(userId: string, searchData: {
    query: string
    language: string
    time_filter: string
    platforms: string[]
    results_count: number
  }) {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .insert([
          {
            user_id: userId,
            ...searchData
          }
        ])

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Save search history error:', error)
      return { data: null, error }
    }
  }

  // Get user's search history
  static async getSearchHistory(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get search history error:', error)
      return { data: null, error }
    }
  }

  // Check if user has reached search limit
  static async checkSearchLimit(userId: string, tier: 'free' | 'standard' | 'pro' = 'free') {
    try {
      const limits = {
        free: 5,
        standard: 50,
        pro: 999999 // Unlimited
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('search_count, last_reset_date')
        .eq('id', userId)
        .single()

      if (error) throw error

      const limit = limits[tier]
      const hasReachedLimit = profile.search_count >= limit

      return { 
        hasReachedLimit, 
        currentCount: profile.search_count, 
        limit,
        error: null 
      }
    } catch (error) {
      console.error('Check search limit error:', error)
      return { hasReachedLimit: false, currentCount: 0, limit: 0, error }
    }
  }
}
