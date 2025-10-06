import { API_CONFIG, SocialPost, AnalyzedResults } from './apiConfig';

export class AIAnalysisService {
  async analyzePosts(posts: SocialPost[], query: string): Promise<AnalyzedResults> {
    try {
      console.log('🤖 AI Analysis - Using mock categorization');
      
      // EMERGENCY FIX: Simple mock categorization
      const results: AnalyzedResults = {
        painPoints: [],
        trendingIdeas: [],
        contentIdeas: []
      };

      // Simple keyword-based categorization
      posts.forEach(post => {
        const content = post.content.toLowerCase();
        
        if (results.painPoints.length < 3 && (
          content.includes('problem') || content.includes('issue') || content.includes('difficult') ||
          content.includes('struggle') || content.includes('challenge')
        )) {
          results.painPoints.push(post);
        } else if (results.contentIdeas.length < 3 && (
          content.includes('how to') || content.includes('tutorial') || content.includes('learn') ||
          content.includes('guide') || content.includes('?')
        )) {
          results.contentIdeas.push(post);
        } else if (results.trendingIdeas.length < 3) {
          results.trendingIdeas.push(post);
        }
      });
      
      // Fill remaining slots with highest engagement posts
      const usedPosts = new Set([...results.painPoints, ...results.trendingIdeas, ...results.contentIdeas].map(p => p.id));
      const remaining = posts
        .filter(p => !usedPosts.has(p.id))
        .sort((a, b) => b.engagement - a.engagement);
      
      while (results.painPoints.length < 3 && remaining.length > 0) results.painPoints.push(remaining.shift()!);
      while (results.trendingIdeas.length < 3 && remaining.length > 0) results.trendingIdeas.push(remaining.shift()!);
      while (results.contentIdeas.length < 3 && remaining.length > 0) results.contentIdeas.push(remaining.shift()!);

      return results;
    } catch (error) {
      console.error('Error analyzing posts:', error);
      return { painPoints: [], trendingIdeas: [], contentIdeas: [] };
    }
  }
}