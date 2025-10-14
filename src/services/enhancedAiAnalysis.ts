import { API_CONFIG, SocialPost, AnalyzedResults } from './apiConfig';

export class EnhancedAiAnalysisService {
  async analyzePosts(posts: SocialPost[], query: string): Promise<AnalyzedResults> {
    try {
      console.log('🤖 Enhanced AI Analysis - Starting intelligent categorization');
      
      if (posts.length === 0) {
        return { painPoints: [], trendingIdeas: [], contentIdeas: [] };
      }

      // Advanced keyword sets with weights
      const painKeywords = {
        // Strong pain indicators (high weight)
        'problem': 3, 'issue': 3, 'frustrated': 3, 'hate': 3, 'terrible': 3, 'awful': 3,
        'broken': 3, 'fail': 3, 'worst': 3, 'sucks': 3, 'disappointed': 3, 'angry': 3,
        'upset': 3, 'complaint': 3, 'bug': 3, 'error': 3, 'glitch': 3,
        
        // Medium pain indicators
        'difficult': 2, 'hard': 2, 'struggle': 2, 'annoying': 2, 'slow': 2, 'expensive': 2,
        'overpriced': 2, 'confused': 2, 'lost': 2, 'stuck': 2,
        
        // Weak pain indicators
        'can\'t': 1, 'won\'t': 1, 'doesn\'t work': 1, 'help me': 1, 'fix this': 1
      };

      const trendingKeywords = {
        // Strong trending indicators
        'trending': 3, 'viral': 3, 'breaking': 3, 'huge': 3, 'massive': 3, 'insane': 3,
        'crazy': 3, 'amazing': 3, 'incredible': 3, 'game changer': 3, 'revolutionary': 3,
        
        // Medium trending indicators
        'popular': 2, 'hot': 2, 'new': 2, 'latest': 2, 'everyone': 2, 'all over': 2,
        'everywhere': 2, 'just dropped': 2, 'breakthrough': 2, 'innovative': 2,
        
        // Weak trending indicators
        'next level': 1, 'cutting edge': 1
      };

      const contentKeywords = {
        // Strong content indicators
        'how to': 3, 'tutorial': 3, 'learn': 3, 'teach': 3, 'explain': 3, 'guide': 3,
        'step by step': 3, 'tips': 3, 'tricks': 3, 'advice': 3,
        
        // Medium content indicators
        'want to know': 2, 'help': 2, 'recommend': 2, 'suggest': 2, 'what is': 2,
        'where to': 2, 'when to': 2, 'why': 2, 'best way': 2,
        
        // Weak content indicators
        'beginner': 1, 'advanced': 1, 'pro tip': 1, 'expert': 1
      };

      const categorizePost = (post: SocialPost) => {
        const content = post.content.toLowerCase();
        
        // Calculate weighted scores
        let painScore = 0;
        let trendingScore = 0;
        let contentScore = 0;
        
        // Pain score calculation
        Object.entries(painKeywords).forEach(([keyword, weight]) => {
          if (content.includes(keyword)) {
            painScore += weight;
          }
        });
        
        // Trending score calculation
        Object.entries(trendingKeywords).forEach(([keyword, weight]) => {
          if (content.includes(keyword)) {
            trendingScore += weight;
          }
        });
        
        // Content score calculation
        Object.entries(contentKeywords).forEach(([keyword, weight]) => {
          if (content.includes(keyword)) {
            contentScore += weight;
          }
        });
        
        // Engagement bonus (logarithmic scaling)
        const engagementBonus = Math.log(post.engagement + 1) / 8;
        
        // Question bonus (questions often indicate content needs)
        const questionBonus = (content.match(/\?/g) || []).length * 0.8;
        
        // Exclamation bonus (indicates trending/emotional content)
        const exclamationBonus = (content.match(/!/g) || []).length * 0.3;
        
        // Emotional words bonus
        const emotionalWords = ['love', 'hate', 'amazing', 'terrible', 'awesome', 'awful', 'incredible', 'horrible', 'excited', 'disappointed'];
        const emotionalBonus = emotionalWords.filter(word => content.includes(word)).length * 0.4;
        
        // Platform-specific bonuses
        let platformBonus = 0;
        if (post.platform === 'reddit') platformBonus += 0.2; // Reddit often has more detailed discussions
        if (post.platform === 'x') platformBonus += 0.1; // X has trending content
        
        // Final scores
        const finalPainScore = painScore + engagementBonus + emotionalBonus + platformBonus;
        const finalTrendingScore = trendingScore + engagementBonus + exclamationBonus + platformBonus;
        const finalContentScore = contentScore + engagementBonus + questionBonus + platformBonus;
        
        return {
          pain: finalPainScore,
          trending: finalTrendingScore,
          content: finalContentScore,
          post,
          rawScores: { pain: painScore, trending: trendingScore, content: contentScore }
        };
      };

      // Score all posts
      const scoredPosts = posts.map(categorizePost);
      
      // Debug logging for top posts
      console.log('🔍 Top scored posts:', scoredPosts
        .sort((a, b) => Math.max(b.pain, b.trending, b.content) - Math.max(a.pain, a.trending, a.content))
        .slice(0, 5)
        .map(item => ({
          content: item.post.content.substring(0, 50) + '...',
          scores: { pain: item.pain.toFixed(2), trending: item.trending.toFixed(2), content: item.content.toFixed(2) },
          engagement: item.post.engagement
        }))
      );
      
      // Sort by highest scores for each category and remove duplicates
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

      // Fill missing slots with highest engagement posts
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

      console.log('✅ Enhanced AI analysis complete:', {
        painPoints: results.painPoints.length,
        trendingIdeas: results.trendingIdeas.length,
        contentIdeas: results.contentIdeas.length,
        totalPosts: posts.length,
        query: query
      });

      return results;
    } catch (error) {
      console.error('❌ Enhanced AI analysis error:', error);
      return { painPoints: [], trendingIdeas: [], contentIdeas: [] };
    }
  }
}
