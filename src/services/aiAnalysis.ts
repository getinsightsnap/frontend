import { API_CONFIG, SocialPost, AnalyzedResults } from './apiConfig';

export class AIAnalysisService {
  async analyzePosts(posts: SocialPost[], query: string): Promise<AnalyzedResults> {
    try {
      console.log('🤖 AI Analysis - Using enhanced categorization');
      
      if (posts.length === 0) {
        return { painPoints: [], trendingIdeas: [], contentIdeas: [] };
      }

      // Enhanced keyword-based categorization with scoring
      const painKeywords = [
        'problem', 'issue', 'frustrated', 'difficult', 'hard', 'struggle', 'hate', 'annoying', 'broken',
        'fail', 'worst', 'terrible', 'awful', 'sucks', 'disappointed', 'angry', 'upset', 'complaint',
        'bug', 'error', 'glitch', 'not working', 'broken', 'slow', 'expensive', 'overpriced',
        'confused', 'lost', 'stuck', 'can\'t', 'won\'t', 'doesn\'t work', 'help me', 'fix this'
      ];

      const trendingKeywords = [
        'trending', 'viral', 'popular', 'hot', 'new', 'latest', 'everyone', 'all over', 'everywhere',
        'breaking', 'just dropped', 'huge', 'massive', 'insane', 'crazy', 'amazing', 'incredible',
        'game changer', 'revolutionary', 'breakthrough', 'innovative', 'cutting edge', 'next level'
      ];

      const contentKeywords = [
        'how to', 'tutorial', 'learn', 'teach', 'explain', 'guide', 'want to know', 'help',
        'tips', 'tricks', 'advice', 'recommend', 'suggest', 'what is', 'where to', 'when to',
        'why', 'best way', 'step by step', 'beginner', 'advanced', 'pro tip', 'expert'
      ];

      const categorizePost = (post: SocialPost) => {
        const content = post.content.toLowerCase();
        
        const painScore = painKeywords.filter(keyword => content.includes(keyword)).length;
        const trendingScore = trendingKeywords.filter(keyword => content.includes(keyword)).length;
        const contentScore = contentKeywords.filter(keyword => content.includes(keyword)).length;
        
        // Add engagement bonus
        const engagementBonus = Math.log(post.engagement + 1) / 10;
        
        // Check for question marks (content indicator)
        const questionBonus = (content.match(/\?/g) || []).length * 0.5;
        
        // Check for emotional words
        const emotionalWords = ['love', 'hate', 'amazing', 'terrible', 'awesome', 'awful', 'incredible', 'horrible'];
        const emotionalBonus = emotionalWords.filter(word => content.includes(word)).length * 0.3;
        
        return {
          pain: painScore + engagementBonus + emotionalBonus,
          trending: trendingScore + engagementBonus,
          content: contentScore + engagementBonus + questionBonus,
          post
        };
      };

      // Score all posts
      const scoredPosts = posts.map(categorizePost);
      
      // Sort by highest scores for each category
      const painPoints = scoredPosts
        .sort((a, b) => b.pain - a.pain)
        .slice(0, 3)
        .map(item => item.post);

      const trendingIdeas = scoredPosts
        .sort((a, b) => b.trending - a.trending)
        .slice(0, 3)
        .map(item => item.post);

      const contentIdeas = scoredPosts
        .sort((a, b) => b.content - a.content)
        .slice(0, 3)
        .map(item => item.post);

      // Remove duplicates and fill with remaining high-engagement posts
      const usedPosts = new Set([...painPoints, ...trendingIdeas, ...contentIdeas].map(p => p.id));
      const remaining = posts
        .filter(p => !usedPosts.has(p.id))
        .sort((a, b) => b.engagement - a.engagement);

      // Fill missing slots
      while (painPoints.length < 3 && remaining.length > 0) {
        painPoints.push(remaining.shift()!);
      }
      while (trendingIdeas.length < 3 && remaining.length > 0) {
        trendingIdeas.push(remaining.shift()!);
      }
      while (contentIdeas.length < 3 && remaining.length > 0) {
        contentIdeas.push(remaining.shift()!);
      }

      const results: AnalyzedResults = {
        painPoints: painPoints.slice(0, 3),
        trendingIdeas: trendingIdeas.slice(0, 3),
        contentIdeas: contentIdeas.slice(0, 3)
      };

      console.log('✅ Enhanced analysis complete:', {
        painPoints: results.painPoints.length,
        trendingIdeas: results.trendingIdeas.length,
        contentIdeas: results.contentIdeas.length,
        totalPosts: posts.length
      });

      return results;
    } catch (error) {
      console.error('Error analyzing posts:', error);
      return { painPoints: [], trendingIdeas: [], contentIdeas: [] };
    }
  }
}