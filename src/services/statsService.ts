import { supabase } from '../lib/supabase';

export interface PlatformStats {
  totalSearches: number; // Lifetime total searches
  registeredUsers: number; // Users who have ever performed a search
  searchesToday: number; // Searches performed today
  topKeywords: { keyword: string; count: number }[];
}

export class StatsService {
  /**
   * Get real-time platform statistics
   */
  static async getPlatformStats(): Promise<PlatformStats> {
    try {
      // Get total searches count
      const { count: totalSearches } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true });

      // Get registered users count (users who have searched at least once)
      const { data: registeredUsersData } = await supabase
        .from('search_history')
        .select('user_id')
        .not('user_id', 'is', null);
      
      // Count unique users
      const uniqueUsers = new Set(registeredUsersData?.map(item => item.user_id) || []);

      // Get searches from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: searchesToday } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get top 5 keywords (most searched)
      const { data: searchHistoryData } = await supabase
        .from('search_history')
        .select('search_query')
        .order('created_at', { ascending: false })
        .limit(100); // Get last 100 searches

      // Count keyword frequencies
      const keywordCounts: { [key: string]: number } = {};
      searchHistoryData?.forEach((search) => {
        const query = search.search_query.toLowerCase().trim();
        keywordCounts[query] = (keywordCounts[query] || 0) + 1;
      });

      // Sort and get top 5
      const topKeywords = Object.entries(keywordCounts)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSearches: totalSearches || 0,
        registeredUsers: uniqueUsers.size || 0,
        searchesToday: searchesToday || 0,
        topKeywords
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Return default values on error
      return {
        totalSearches: 0,
        registeredUsers: 0,
        searchesToday: 0,
        topKeywords: []
      };
    }
  }

  /**
   * Subscribe to real-time stats updates
   */
  static subscribeToStatsUpdates(callback: (stats: PlatformStats) => void) {
    // Initial fetch
    this.getPlatformStats().then(callback);

    // Subscribe to search_history changes
    const channel = supabase
      .channel('stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'search_history'
        },
        () => {
          // Fetch updated stats when search_history changes
          this.getPlatformStats().then(callback);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

