import { SearchParams, AnalyzedResults } from './apiConfig';

export interface SearchOptions {
  userTier?: 'free' | 'standard' | 'pro';
  userId?: string;
}

export interface SearchResponse {
  results: AnalyzedResults;
  metadata?: {
    noResultsMessage?: {
      title: string;
      message: string;
      reasons: string[];
      suggestions: string[];
      tip: string;
    };
    [key: string]: any;
  };
}

export class SearchService {
  private static readonly API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

  static async performSearch(params: SearchParams, options?: SearchOptions): Promise<SearchResponse> {
    try {
      console.log('🔍 Starting search with params:', params);
      console.log('🎯 User tier:', options?.userTier || 'free');
      console.log('🌐 Backend URL:', this.API_BASE_URL);
      
      const response = await fetch(`${this.API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: params.query,
          platforms: params.platforms,
          language: params.language,
          timeFilter: params.timeFilter
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Search API error:', errorData);
        
        // Handle specific error cases
        if (response.status === 429) {
          throw new Error('⚠️ Too many searches. Please wait a few minutes and try again.');
        } else if (response.status === 503) {
          throw new Error('⚠️ Service temporarily unavailable due to high traffic. Please try again in a minute.');
        } else if (response.status >= 500) {
          throw new Error('⚠️ Server error. Our team has been notified. Please try again shortly.');
        }
        
        throw new Error(errorData.message || `Search failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('❌ Search failed:', result.message);
        throw new Error(result.message || 'Search failed');
      }

      console.log('🎉 Search complete!');
      console.log(`📊 Results: ${result.data.painPoints.length} pain points, ${result.data.trendingIdeas.length} trending ideas, ${result.data.contentIdeas.length} content ideas`);
      console.log('⏱️ Duration:', result.metadata.duration + 'ms');
      
      if (result.metadata.errors && result.metadata.errors.length > 0) {
        console.warn('⚠️ Some platforms failed:', result.metadata.errors);
      }

      // Check for intelligent no-results message
      if (result.metadata.noResultsMessage) {
        console.log('📝 No results message:', result.metadata.noResultsMessage.title);
      }

      // Apply tier-based filtering
      const userTier = options?.userTier || 'free';
      const filteredResults = this.applyTierFiltering(result.data, userTier);
      
      console.log('✅ Analysis complete:', {
        painPoints: filteredResults.painPoints.length,
        trendingIdeas: filteredResults.trendingIdeas.length,
        contentIdeas: filteredResults.contentIdeas.length,
        tier: userTier
      });

      // Return both results and metadata including noResultsMessage
      return {
        results: filteredResults,
        metadata: result.metadata
      };

    } catch (error) {
      console.error('❌ Search error:', error);
      
      // Re-throw error with user-friendly message
      throw error;
    }
  }

  static async testApiConnections(): Promise<{reddit: boolean, x: boolean, backend: boolean}> {
    const results = {
      reddit: false,
      x: false,
      backend: false
    };

    console.log('🧪 Testing API connections...');

    try {
      // Test backend health
      console.log('🔍 Testing backend connection...');
      const healthResponse = await fetch(`${this.API_BASE_URL}/search/health`);
      if (healthResponse.ok) {
        console.log('✅ Backend connection: OK');
        results.backend = true;
      }
    } catch (error) {
      console.error('❌ Backend connection test failed:', error);
    }

    try {
      // Test Reddit via backend
      console.log('🔍 Testing Reddit API via backend...');
      const redditResponse = await fetch(`${this.API_BASE_URL}/reddit/health`);
      if (redditResponse.ok) {
        console.log('✅ Reddit API test: OK');
        results.reddit = true;
      }
    } catch (error) {
      console.error('❌ Reddit API test failed:', error);
    }

    try {
      // Test X via backend
      console.log('🐦 Testing X API via backend...');
      const xResponse = await fetch(`${this.API_BASE_URL}/x/health`);
      if (xResponse.ok) {
        const xData = await xResponse.json();
        console.log(`✅ X API test: ${xData.message}`);
        results.x = xData.available;
      }
    } catch (error) {
      console.error('❌ X API test failed:', error);
    }

    console.log('📊 API Test Results:', results);
    return results;
  }

  /**
   * Apply tier-based result filtering
   * Distributes results per platform for balanced representation
   * Free: 3 from each platform = 9 total per category
   * Standard: 5 from each platform = 15 total per category
   * Pro: 10 from each platform = 30 total per category
   */
  private static applyTierFiltering(results: AnalyzedResults, userTier: string): AnalyzedResults {
    const limitsPerPlatform = {
      free: 3,      // 3 per platform = 9 total
      standard: 5,  // 5 per platform = 15 total
      pro: 10       // 10 per platform = 30 total
    };

    const limitPerPlatform = limitsPerPlatform[userTier as keyof typeof limitsPerPlatform] || limitsPerPlatform.free;

    return {
      painPoints: this.filterByPlatform(results.painPoints, limitPerPlatform),
      trendingIdeas: this.filterByPlatform(results.trendingIdeas, limitPerPlatform),
      contentIdeas: this.filterByPlatform(results.contentIdeas, limitPerPlatform)
    };
  }

  /**
   * Filter results to get N results from each platform
   */
  private static filterByPlatform(posts: any[], limitPerPlatform: number): any[] {
    const platforms = ['reddit', 'x', 'youtube'];
    const filtered: any[] = [];

    console.log(`🔧 Filtering ${posts.length} posts, ${limitPerPlatform} per platform`);

    // Get N posts from each platform
    platforms.forEach(platform => {
      const platformPosts = posts.filter(post => post.platform === platform);
      console.log(`  ${platform}: ${platformPosts.length} available, taking ${Math.min(platformPosts.length, limitPerPlatform)}`);
      filtered.push(...platformPosts.slice(0, limitPerPlatform));
    });

    console.log(`✅ Filtered result: ${filtered.length} total posts`);
    return filtered;
  }

  /**
   * Get tier limits for UI display
   */
  static getTierLimits(userTier: string) {
    // Results are per platform, so multiply by 3 for total
    const perPlatform = userTier === 'free' ? 3 : userTier === 'standard' ? 5 : 10;
    const totalPerCategory = perPlatform * 3; // 3 platforms
    
    return {
      maxSearches: userTier === 'free' ? 5 : userTier === 'standard' ? 50 : 999999,
      resultsPerCategory: totalPerCategory  // Free: 9, Standard: 15, Pro: 30
    };
  }
}
