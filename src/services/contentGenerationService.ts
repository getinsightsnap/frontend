import { API_CONFIG, SocialPost } from './apiConfig';

export interface ScriptRequest {
  category: 'painPoints' | 'trendingIdeas' | 'contentIdeas';
  posts: SocialPost[];
  platform: 'all' | 'reddit' | 'x' | 'youtube';
  contentType: 'video' | 'blog' | 'social' | 'email';
  tone: 'professional' | 'casual' | 'educational' | 'entertaining';
  length: 'short' | 'medium' | 'long';
}

export interface GeneratedScript {
  title: string;
  content: string;
  keyPoints: string[];
  callToAction: string;
  hashtags?: string[];
  estimatedDuration?: string;
}

export class ContentGenerationService {
  private static async callPerplexityAPI(prompt: string, maxTokens: number = 2000): Promise<string> {
    try {
      if (!API_CONFIG.perplexity.apiKey) {
        throw new Error('Perplexity API key not configured');
      }

      const response = await fetch(`${API_CONFIG.perplexity.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.perplexity.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are an expert content creator and scriptwriter. You create engaging, well-structured content based on social media insights. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.9,
          return_citations: false,
          search_domain_filter: ["perplexity.ai"],
          return_images: false,
          return_related_questions: false,
          search_recency_filter: "month",
          top_k: 0,
          stream: false,
          presence_penalty: 0,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Content generation API error:', error);
      throw error;
    }
  }

  static async generateScript(request: ScriptRequest): Promise<GeneratedScript> {
    try {
      // Prepare posts data for the prompt
      const postsContext = request.posts.slice(0, 5).map((post, index) => 
        `${index + 1}. [${post.platform.toUpperCase()}] ${post.source} (${post.engagement} engagement): "${post.content.substring(0, 200)}..."`
      ).join('\n');

      // Create content type specific prompts
      const contentSpecs = this.getContentSpecifications(request.contentType, request.length);
      const categoryContext = this.getCategoryContext(request.category);

      const prompt = `
Based on the following social media insights about ${request.category.replace(/([A-Z])/g, ' $1').toLowerCase()}, create a ${request.contentType} script with a ${request.tone} tone.

SOCIAL MEDIA INSIGHTS:
${postsContext}

CONTENT REQUIREMENTS:
- Type: ${request.contentType}
- Length: ${request.length} (${contentSpecs.duration})
- Tone: ${request.tone}
- Target audience: People interested in the topics mentioned in the posts
- Purpose: ${categoryContext.purpose}

${contentSpecs.structure}

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "title": "Compelling title for the content",
  "content": "Full script/content with clear structure and engaging language",
  "keyPoints": ["point1", "point2", "point3"],
  "callToAction": "Clear call to action for the audience",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "estimatedDuration": "estimated reading/viewing time"
}

Rules:
- Make it actionable and valuable
- Reference insights from the social media posts naturally
- Include specific examples or tips
- ${request.tone === 'professional' ? 'Use professional language' : request.tone === 'casual' ? 'Use conversational, friendly language' : request.tone === 'educational' ? 'Focus on teaching and explaining' : 'Make it fun and engaging'}
- Ensure the content directly addresses what the audience is asking for based on the posts`;

      const response = await this.callPerplexityAPI(prompt, 2500);
      
      try {
        // Clean and parse the JSON response
        let cleanResponse = response.trim();
        cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const generatedScript = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (!generatedScript.title || !generatedScript.content || !generatedScript.keyPoints || !generatedScript.callToAction) {
          throw new Error('Invalid script structure received');
        }

        console.log('✅ Script generated successfully');
        return generatedScript;

      } catch (parseError) {
        console.error('Failed to parse script generation response:', parseError);
        console.warn('Raw response:', response);
        
        // Fallback: Create a basic script structure
        return this.createFallbackScript(request);
      }

    } catch (error) {
      console.error('Error generating script:', error);
      return this.createFallbackScript(request);
    }
  }

  private static getContentSpecifications(contentType: string, length: string) {
    const specs = {
      video: {
        short: { duration: '1-3 minutes', structure: 'Create a video script with: Hook (15 seconds), Problem identification (30 seconds), Solution/Tips (90 seconds), Call to action (15 seconds)' },
        medium: { duration: '5-8 minutes', structure: 'Create a video script with: Introduction (30 seconds), Problem deep-dive (2 minutes), Multiple solutions with examples (4 minutes), Conclusion and CTA (30 seconds)' },
        long: { duration: '10-15 minutes', structure: 'Create a comprehensive video script with: Introduction (1 minute), Background context (2 minutes), Detailed analysis (6 minutes), Step-by-step solutions (5 minutes), Conclusion (1 minute)' }
      },
      blog: {
        short: { duration: '3-5 minute read', structure: 'Create a blog post with: Compelling headline, Brief introduction, 3-5 main points with examples, Conclusion with CTA' },
        medium: { duration: '7-10 minute read', structure: 'Create a detailed blog post with: Introduction, Problem statement, 5-7 main sections with subheadings, Examples and case studies, Actionable tips, Conclusion' },
        long: { duration: '15-20 minute read', structure: 'Create a comprehensive guide with: Executive summary, Detailed introduction, Multiple main sections, In-depth analysis, Case studies, Step-by-step instructions, Resources and conclusion' }
      },
      social: {
        short: { duration: 'Quick post', structure: 'Create a social media post with: Attention-grabbing hook, Key insight, Value proposition, Call to action' },
        medium: { duration: 'Thread/carousel', structure: 'Create a social media thread/carousel with: Hook post, 3-5 supporting posts with tips/insights, Engagement question, CTA post' },
        long: { duration: 'Series of posts', structure: 'Create a social media series with: Announcement post, 5-7 educational posts, Interactive elements, Community engagement prompts' }
      },
      email: {
        short: { duration: '2-3 minute read', structure: 'Create an email with: Subject line, Personal greeting, Main message with 2-3 key points, Clear CTA' },
        medium: { duration: '5-7 minute read', structure: 'Create a newsletter with: Engaging subject, Introduction, 3-4 main sections, Personal insights, Resources/links, CTA' },
        long: { duration: '10-12 minute read', structure: 'Create a comprehensive email with: Compelling subject, Personal story/intro, Detailed content sections, Examples and case studies, Multiple CTAs' }
      }
    };

    return specs[contentType as keyof typeof specs]?.[length as keyof typeof specs[typeof contentType]] || specs.blog.medium;
  }

  private static getCategoryContext(category: string) {
    const contexts = {
      painPoints: {
        purpose: 'Address common problems and provide practical solutions'
      },
      trendingIdeas: {
        purpose: 'Capitalize on current trends and provide timely insights'
      },
      contentIdeas: {
        purpose: 'Create educational content that teaches what the audience wants to learn'
      }
    };

    return contexts[category as keyof typeof contexts] || contexts.contentIdeas;
  }

  private static createFallbackScript(request: ScriptRequest): GeneratedScript {
    const categoryName = request.category.replace(/([A-Z])/g, ' $1').toLowerCase();
    
    return {
      title: `${request.contentType.charAt(0).toUpperCase() + request.contentType.slice(1)} About ${categoryName}`,
      content: `This ${request.contentType} addresses key insights from social media about ${categoryName}. Based on the discussions we analyzed, here are the main points to cover:\n\n1. Address the common concerns people are sharing\n2. Provide practical solutions and actionable advice\n3. Share relevant examples and tips\n4. Engage with your audience about their experiences\n\nRemember to keep the tone ${request.tone} and focus on providing real value to your audience.`,
      keyPoints: [
        `Address common ${categoryName} discussed online`,
        'Provide practical, actionable solutions',
        'Engage with audience experiences',
        'Share relevant examples and tips'
      ],
      callToAction: `What's your experience with ${categoryName}? Share your thoughts in the comments!`,
      hashtags: [`#${categoryName.replace(/\s+/g, '')}`, '#content', '#tips'],
      estimatedDuration: request.length === 'short' ? '2-3 minutes' : request.length === 'medium' ? '5-7 minutes' : '10-15 minutes'
    };
  }
}
