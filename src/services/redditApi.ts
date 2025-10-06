import { API_CONFIG, SocialPost } from './apiConfig';

export class RedditApiService {
  private static async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${API_CONFIG.reddit.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': API_CONFIG.reddit.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Check if Reddit API is available (always true for public API)
  static isAvailable(): boolean {
    return true;
  }

  // Search posts across multiple subreddits
  static async searchPosts(query: string, language: string = 'en', timeFilter: string = 'week'): Promise<SocialPost[]> {
    try {
      console.log(`🔍 Searching Reddit for: "${query}"`);
      console.log('🔧 Reddit API Config:', {
        baseUrl: API_CONFIG.reddit.baseUrl,
        userAgent: API_CONFIG.reddit.userAgent
      });

      // Try Netlify Function first (works in production)
      try {
        console.log('🔄 Trying Netlify Function...');
        const response = await fetch('/.netlify/functions/reddit-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            language,
            timeFilter
          })
        });

        if (response.ok) {
          const posts = await response.json();
          console.log(`✅ Found ${posts.length} Reddit posts via Netlify Function`);
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
        return await this.searchViaViteProxy(query, language, timeFilter);
      } catch (proxyError) {
        console.warn('⚠️ Vite proxy failed:', proxyError.message);
      }

      // Final fallback: return empty array
      console.warn('⚠️ All Reddit API methods failed, returning empty results');
      return [];
    } catch (error) {
      console.error('❌ Error with Reddit search:', error);
      return [];
    }
  }

  // Vite proxy method for local development
  private static async searchViaViteProxy(query: string, language: string = 'en', timeFilter: string = 'week'): Promise<SocialPost[]> {
    const allPosts: SocialPost[] = [];
    
    // Use Vite proxy to access Reddit API
    const subreddits = ['AskReddit', 'worldnews', 'news', 'entrepreneur', 'business', 'productivity', 'technology'];
    
    for (const subreddit of subreddits.slice(0, 5)) {
      try {
        const proxyUrl = `/api/reddit/r/${subreddit}/hot.json?limit=25`;
        
        console.log(`📡 Fetching r/${subreddit} via Vite proxy...`);
        
        const response = await fetch(proxyUrl);
        if (!response.ok) continue;
        
        const redditData = await response.json();
        
        if (redditData.data?.children) {
          const relevantPosts = redditData.data.children
            .map((child: any) => child.data)
            .filter((post: any) => {
              const content = (post.title + ' ' + (post.selftext || '')).toLowerCase();
              const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
              return queryWords.some(word => content.includes(word)) || 
                     content.includes(query.toLowerCase());
            })
            .slice(0, 3)
            .map((post: any) => ({
              id: `reddit_${post.id}`,
              content: post.title + (post.selftext ? ' ' + post.selftext : ''),
              platform: 'reddit' as const,
              source: `r/${post.subreddit}`,
              engagement: post.score + post.num_comments,
              timestamp: this.formatTimestamp(post.created_utc),
              url: `https://reddit.com${post.permalink}`,
              author: post.author
            }));
          
          allPosts.push(...relevantPosts);
          console.log(`✅ Found ${relevantPosts.length} relevant posts in r/${subreddit}`);
        }
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.warn(`⚠️ Error fetching r/${subreddit}:`, error);
        continue;
      }
    }
    
    // Try global search if we don't have enough results
    if (allPosts.length < 10) {
      try {
        console.log('📡 Trying global Reddit search via Vite proxy...');
        const searchUrl = `/api/reddit/search.json?q=${encodeURIComponent(query)}&sort=top&t=${timeFilter}&limit=25`;
        
        const response = await fetch(searchUrl);
        if (response.ok) {
          const searchData = await response.json();
          
          if (searchData.data?.children) {
            const searchPosts = searchData.data.children.map((child: any) => {
              const post = child.data;
              return {
                id: `reddit_search_${post.id}`,
                content: post.title + (post.selftext ? ' ' + post.selftext : ''),
                platform: 'reddit' as const,
                source: `r/${post.subreddit}`,
                engagement: post.score + post.num_comments,
                timestamp: this.formatTimestamp(post.created_utc),
                url: `https://reddit.com${post.permalink}`,
                author: post.author
              };
            });
            
            allPosts.push(...searchPosts);
            console.log(`✅ Found ${searchPosts.length} posts from global search`);
          }
        }
      } catch (error) {
        console.warn('⚠️ Error with global search:', error);
      }
    }
    
    // Remove duplicates and sort
    const uniquePosts = Array.from(
      new Map(allPosts.map(post => [post.id, post])).values()
    );
    
    return uniquePosts.sort((a, b) => b.engagement - a.engagement).slice(0, 25);
  }

  // Direct Reddit API search (will fail due to CORS in browser)
  private static async searchPostsDirect(query: string, language: string = 'en', timeFilter: string = 'week'): Promise<SocialPost[]> {
    // This method will fail due to CORS, but we keep it for completeness
    throw new Error('Direct Reddit API calls blocked by CORS policy');
  }

  private static formatTimestamp(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000);
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