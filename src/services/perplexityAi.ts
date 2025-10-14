import { API_CONFIG, SocialPost, AnalyzedResults } from './apiConfig';

export class PerplexityAiService {
  private static async makeRequest(messages: any[]) {
    if (!API_CONFIG.perplexity.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch(`/api/perplexity/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.perplexity.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-chat',
        messages,
        max_tokens: 1500,
        temperature: 0.3,
        top_p: 0.9,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async analyzePosts(posts: SocialPost[], query: string): Promise<AnalyzedResults> {
    try {
      if (posts.length === 0) {
        return {
          painPoints: [],
          trendingIdeas: [],
          contentIdeas: []
        };
      }

      const postsText = posts.map((post, index) => 
        `Post ${index + 1} [${post.platform.toUpperCase()}] (${post.engagement} engagement): ${post.content.substring(0, 300)}...`
      ).join('\n\n');

      const systemPrompt = `You are an AI analyst specializing in social media content categorization. Your task is to analyze social media posts and categorize them into three specific categories based on their content and context.

CATEGORIES TO IDENTIFY:

1. PAIN POINTS: Posts where people express frustrations, problems, challenges, complaints, or difficulties they're experiencing
2. TRENDING IDEAS: Posts discussing current trends, popular topics, emerging concepts, or viral discussions gaining momentum  
3. CONTENT IDEAS: Posts where people explicitly request content, ask for tutorials, seek educational material, or express what they want to learn about

ANALYSIS RULES:
- Focus on engagement levels (higher engagement = more relevant)
- Each category should have exactly 3 posts
- Return post indices (1-based) that correspond to the input posts
- If there aren't enough posts for a category, return fewer entries
- Prioritize clarity and relevance over quantity

Please respond ONLY with a JSON object in this exact format:
{
  "painPoints": [post_index1, post_index2, post_index3],
  "trendingIdeas": [post_index1, post_index2, post_index3], 
  "contentIdeas": [post_index1, post_index2, post_index3]
}`;

      const userPrompt = `Query: "${query}"

Social Media Posts to Analyze:
${postsText}

Please categorize these posts and return the indices for each category.`;

      const response = await this.makeRequest([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from Perplexity AI');
      }

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      const categorization = JSON.parse(jsonMatch[0]);

      // Convert indices to actual posts
      const result: AnalyzedResults = {
        painPoints: this.getPostsByIndices(posts, categorization.painPoints || []),
        trendingIdeas: this.getPostsByIndices(posts, categorization.trendingIdeas || []),
        contentIdeas: this.getPostsByIndices(posts, categorization.contentIdeas || [])
      };

      return result;
    } catch (error) {
      console.error('Error analyzing posts with Perplexity AI:', error);
      
      // Fallback: Simple engagement-based categorization
      return this.fallbackCategorization(posts);
    }
  }

  private static getPostsByIndices(posts: SocialPost[], indices: number[]): SocialPost[] {
    return indices
      .map(index => posts[index - 1]) // Convert 1-based to 0-based index
      .filter(post => post !== undefined)
      .slice(0, 3); // Ensure max 3 posts
  }

  private static fallbackCategorization(posts: SocialPost[]): AnalyzedResults {
    console.log('🔄 Using enhanced fallback categorization');
    
    // Enhanced fallback based on keywords and engagement
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

    const result = {
      painPoints: painPoints.slice(0, 3),
      trendingIdeas: trendingIdeas.slice(0, 3),
      contentIdeas: contentIdeas.slice(0, 3)
    };

    console.log('✅ Enhanced fallback complete:', {
      painPoints: result.painPoints.length,
      trendingIdeas: result.trendingIdeas.length,
      contentIdeas: result.contentIdeas.length,
      totalPosts: posts.length
    });

    return result;
  }
}
