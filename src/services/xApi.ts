import { API_CONFIG, SocialPost } from './apiConfig';

export class XApiService {
  private static async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${API_CONFIG.x.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.x.bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`X API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async searchPosts(query: string, language: string = 'en', maxResults: number = 50): Promise<SocialPost[]> {
    try {
      if (!API_CONFIG.x.bearerToken) {
        console.warn('⚠️ X API bearer token not configured, skipping X search');
        return [];
      }

      console.log(`🐦 Fetching X posts for: "${query}"`);

      // Try direct API call first (will likely fail due to CORS)
      try {
        console.log('🔄 Attempting direct X API call...');
        
        // Build search query with language filter if not English
        let searchQuery = query;
        if (language !== 'en') {
          searchQuery = `${query} lang:${language}`;
        }

        const params = {
          'query': searchQuery,
          'max_results': Math.min(maxResults, 100).toString(),
          'tweet.fields': 'created_at,public_metrics,context_annotations,lang,author_id',
          'user.fields': 'username,name,verified',
          'expansions': 'author_id'
        };

        const data = await this.makeRequest('/tweets/search/recent', params);
        console.log('📊 X API Response:', data);

        // Handle different response structures
        let tweets = [];
        if (data.data && Array.isArray(data.data)) {
          tweets = data.data;
        } else if (data.tweets && Array.isArray(data.tweets)) {
          tweets = data.tweets;
        } else if (Array.isArray(data)) {
          tweets = data;
        }

        if (tweets.length > 0) {
          const posts: SocialPost[] = tweets.map((tweet: any) => {
            const metrics = tweet.public_metrics || {};
            const author = data.includes?.users?.find((u: any) => u.id === tweet.author_id) || {};
            
            return {
              id: `x_${tweet.id}`,
              content: tweet.text,
              platform: 'x' as const,
              source: `@${author.username || 'unknown'}`,
              engagement: (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0),
              timestamp: this.formatTimestamp(tweet.created_at),
              url: `https://x.com/${author.username || 'unknown'}/status/${tweet.id}`,
              author: author.name || author.username || 'Unknown'
            };
          });

          console.log(`✅ Found ${posts.length} X posts via direct API`);
          return posts.sort((a, b) => b.engagement - a.engagement);
        }

        console.log('⚠️ No tweets found in X API response');
        return [];

      } catch (corsError) {
        console.warn('⚠️ Direct X API call failed (likely CORS):', corsError.message);
        
        // Try Netlify Function first (works in production)
        try {
          console.log('🔄 Trying Netlify Function...');
          const response = await fetch('/.netlify/functions/x-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query,
              language,
              maxResults
            })
          });

          if (response.ok) {
            const posts = await response.json();
            console.log(`✅ Found ${posts.length} X posts via Netlify Function`);
            return posts;
          } else {
            console.warn(`⚠️ Netlify Function returned ${response.status}: ${response.statusText}`);
          }
        } catch (serverlessError) {
          console.warn('⚠️ Netlify Function not available:', serverlessError.message);
        }

        // Try Vite proxy for local development
        try {
          console.log('🔄 Trying Vite proxy for local development...');
          return await this.searchViaViteProxy(query, language, maxResults);
        } catch (proxyError) {
          console.warn('⚠️ Vite proxy failed:', proxyError.message);
        }

        // Final fallback: return empty array
        console.warn('⚠️ All X API methods failed, returning empty results');
        return [];
      }

    } catch (error) {
      console.error('❌ Error fetching X posts:', error);
      return [];
    }
  }

  // Vite proxy method for local development
  private static async searchViaViteProxy(query: string, language: string = 'en', maxResults: number = 50): Promise<SocialPost[]> {
    try {
      if (!API_CONFIG.x.bearerToken) {
        console.warn('⚠️ X API bearer token not configured, skipping X search');
        return [];
      }

      console.log(`🐦 Fetching X posts via Vite proxy for: "${query}"`);

      // Build search query with language filter if not English
      let searchQuery = query;
      if (language !== 'en') {
        searchQuery = `${query} lang:${language}`;
      }

      const params = new URLSearchParams({
        'query': searchQuery,
        'max_results': Math.min(maxResults, 100).toString(),
        'tweet.fields': 'created_at,public_metrics,context_annotations,lang,author_id',
        'user.fields': 'username,name,verified',
        'expansions': 'author_id'
      });

      const proxyUrl = `/api/x/tweets/search/recent?${params}`;

      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.x.bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`X API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 X API Response:', data);

      // Handle different response structures
      let tweets = [];
      if (data.data && Array.isArray(data.data)) {
        tweets = data.data;
      } else if (data.tweets && Array.isArray(data.tweets)) {
        tweets = data.tweets;
      } else if (Array.isArray(data)) {
        tweets = data;
      }

      if (tweets.length > 0) {
        const posts: SocialPost[] = tweets.map((tweet: any) => {
          const metrics = tweet.public_metrics || {};
          const author = data.includes?.users?.find((u: any) => u.id === tweet.author_id) || {};
          
          return {
            id: `x_${tweet.id}`,
            content: tweet.text,
            platform: 'x' as const,
            source: `@${author.username || 'unknown'}`,
            engagement: (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0),
            timestamp: this.formatTimestamp(tweet.created_at),
            url: `https://x.com/${author.username || 'unknown'}/status/${tweet.id}`,
            author: author.name || author.username || 'Unknown'
          };
        });

        console.log(`✅ Found ${posts.length} X posts via Vite proxy`);
        return posts.sort((a, b) => b.engagement - a.engagement);
      }

      console.log('⚠️ No tweets found in X API response');
      return [];

    } catch (error) {
      console.error('❌ Error with X Vite proxy:', error);
      throw error;
    }
  }

  private static getMockXPosts(query: string, language: string): SocialPost[] {
    // Mock data for demonstration - replace with real data when server-side proxy is implemented
    const mockPosts: SocialPost[] = [
      {
        id: 'x_mock_1',
        content: `Just discovered some amazing ${query} tips! The community response has been incredible. Anyone else struggling with this? 🔥`,
        platform: 'x' as const,
        source: '@ContentCreator',
        engagement: 245,
        timestamp: '2 hours ago',
        url: 'https://x.com/mock_post_1',
        author: 'Content Creator'
      },
      {
        id: 'x_mock_2',
        content: `Why is ${query} so difficult to master? I've been trying for months and still feel like a beginner. Any advice from pros? 😅`,
        platform: 'x' as const,
        source: '@Learner_Daily',
        engagement: 189,
        timestamp: '4 hours ago',
        url: 'https://x.com/mock_post_2',
        author: 'Daily Learner'
      },
      {
        id: 'x_mock_3',
        content: `Thread: Top 5 ${query} mistakes I made as a beginner (and how to avoid them) 🧵 1/5`,
        platform: 'x' as const,
        source: '@ExpertAdvice',
        engagement: 567,
        timestamp: '6 hours ago',
        url: 'https://x.com/mock_post_3',
        author: 'Expert Advice'
      },
      {
        id: 'x_mock_4',
        content: `Looking for ${query} tutorials that actually work. Tired of outdated content everywhere. Recommendations? 📚`,
        platform: 'x' as const,
        source: '@SkillSeeker',
        engagement: 134,
        timestamp: '8 hours ago',
        url: 'https://x.com/mock_post_4',
        author: 'Skill Seeker'
      },
      {
        id: 'x_mock_5',
        content: `${query} is trending everywhere! Everyone's talking about it but nobody's explaining HOW to actually get started 🤔`,
        platform: 'x' as const,
        source: '@TrendWatcher',
        engagement: 298,
        timestamp: '12 hours ago',
        url: 'https://x.com/mock_post_5',
        author: 'Trend Watcher'
      }
    ];

    return mockPosts.sort((a, b) => b.engagement - a.engagement);
  }

  private static formatTimestamp(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  }
}