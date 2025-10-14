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
  private static readonly API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

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
      // Prepare posts data for the prompt - show full content for single posts, truncated for multiple
      const postsContext = request.posts.length === 1 
        ? `Post from ${request.posts[0].platform.toUpperCase()} (${request.posts[0].source} - ${request.posts[0].engagement} engagement):\n"${request.posts[0].content}"`
        : request.posts.slice(0, 5).map((post, index) => 
            `${index + 1}. [${post.platform.toUpperCase()}] ${post.source} (${post.engagement} engagement): "${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}"`
          ).join('\n');

      // Create content type specific prompts
      const contentSpecs = this.getContentSpecifications(request.contentType, request.length);

      // Determine the content focus based on category
      const contentFocus = request.category === 'painPoints' 
        ? 'Create content that addresses the problem/pain point mentioned in the post and provides practical solutions'
        : request.category === 'trendingIdeas'
        ? 'Create content that explores the trending topic/idea mentioned in the post and provides valuable insights'
        : 'Create educational content that teaches about the topic/idea mentioned in the post';

      const prompt = `
You are a professional content creator. Your task is to write a COMPLETE, WORD-FOR-WORD ${request.contentType} script that a content creator can immediately use to create their content.

SOCIAL MEDIA POST THAT INSPIRED THIS:
${postsContext}

YOUR TASK:
${contentFocus}

CRITICAL INSTRUCTIONS:
1. Write an ACTUAL ${request.contentType} script with complete sentences and paragraphs
2. DO NOT write guidelines or instructions on how to make content
3. Write the exact words the content creator should say or write
4. Focus on the SPECIFIC topic/issue mentioned in the post above
5. DO NOT mention the category "${request.category}" - only discuss the actual post topic
6. Make it sound natural and ${request.tone}

${contentSpecs.structure}

CONTENT SPECIFICATIONS:
- Type: ${request.contentType}
- Length: ${request.length} (${contentSpecs.duration})
- Tone: ${request.tone}
- Format: Complete, ready-to-use script

EXAMPLE OF WHAT TO DO:
If the post is about "struggling with AI learning", write:
"Hey everyone! Today I want to dive into something many of you asked about - learning AI can feel overwhelming..."

EXAMPLE OF WHAT NOT TO DO (Don't write this):
"1. Introduction to the topic
2. Discuss the main points
3. Provide solutions"

RESPOND ONLY WITH VALID JSON:
{
  "title": "Engaging title about the specific post topic",
  "content": "COMPLETE WORD-FOR-WORD SCRIPT - Write the full script with all sentences, paragraphs, transitions. Include opening hook, main content, and closing. Make it conversational and ready to perform. This should be 200-800 words depending on length.",
  "keyPoints": ["Actual specific point from the topic", "Another concrete point", "Third actionable point"],
  "callToAction": "Natural call to action related to the topic",
  "hashtags": ["#topicHashtag", "#relevantTag", "#nicheTopic"],
  "estimatedDuration": "${contentSpecs.duration}"
}

ABSOLUTE REQUIREMENTS:
- The "content" field MUST be a complete, word-for-word script
- Write EXACTLY what the creator should say/write
- Focus entirely on the topic mentioned in the social media post
- ${request.tone === 'professional' ? 'Use professional, authoritative language' : request.tone === 'casual' ? 'Use friendly, conversational language like talking to a friend' : request.tone === 'educational' ? 'Explain concepts clearly like a teacher' : 'Make it entertaining and fun'}
- Include specific insights from the post
- Make it immediately usable without any editing needed`;

      const response = await this.callPerplexityAPI(prompt, 2500);
      
      try {
        // Clean and parse the JSON response
        let cleanResponse = response.trim();
        console.log('🔍 Raw Perplexity response:', response.substring(0, 200) + '...');
        
        cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('❌ No JSON found in Perplexity response');
          console.log('📄 Full response:', response);
          throw new Error('No JSON found in response');
        }

        const generatedScript = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (!generatedScript.title || !generatedScript.content || !generatedScript.keyPoints || !generatedScript.callToAction) {
          console.error('❌ Invalid script structure:', generatedScript);
          throw new Error('Invalid script structure received');
        }

        // Check if content is actually a script (not guidelines)
        if (generatedScript.content.length < 100 || 
            generatedScript.content.includes('Understanding the core issue') ||
            generatedScript.content.includes('Practical solutions and actionable advice')) {
          console.warn('⚠️ Generated content looks like guidelines, using fallback');
          return this.createFallbackScript(request);
        }

        console.log('✅ Script generated successfully with', generatedScript.content.length, 'characters');
        return generatedScript;

      } catch (parseError) {
        console.error('❌ Failed to parse script generation response:', parseError);
        console.warn('📄 Raw response preview:', response.substring(0, 500));
        
        // Fallback: Create a basic script structure
        return this.createFallbackScript(request);
      }

    } catch (error) {
      console.error('❌ Error generating script:', error);
      return this.createFallbackScript(request);
    }
  }

  private static getContentSpecifications(contentType: string, length: string) {
    const specs: Record<string, Record<string, { duration: string; structure: string }>> = {
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

    return specs[contentType]?.[length] || specs.blog.medium;
  }

  private static createFallbackScript(request: ScriptRequest): GeneratedScript {
    // Extract key information from the first post
    const firstPost = request.posts[0];
    const platform = firstPost?.platform.toUpperCase() || 'social media';
    const source = firstPost?.source || 'a community';
    
    // Extract a topic hint from the post content
    const postContent = firstPost?.content || '';
    const words = postContent.split(' ').slice(0, 50).join(' ');
    
    // Generate opening based on tone
    const openings = {
      professional: `Welcome. Today I want to address an important discussion that recently emerged on ${platform}.`,
      casual: `Hey everyone! So I came across this really interesting post on ${platform} and I had to talk about it.`,
      educational: `Hello and welcome! Today we're going to explore an important topic that was recently discussed on ${platform}.`,
      entertaining: `What's up everyone! You won't believe what I found on ${platform} today - it's actually pretty interesting!`
    };
    
    const closings = {
      professional: `I hope this analysis has provided valuable insights. Thank you for your time.`,
      casual: `Alright, that's it from me! Let me know what you think in the comments below!`,
      educational: `I hope you learned something valuable today. Feel free to ask questions in the comments!`,
      entertaining: `And that's all folks! Don't forget to like and subscribe if you found this helpful!`
    };
    
    const opening = openings[request.tone] || openings.casual;
    const closing = closings[request.tone] || closings.casual;
    
    // Create content type specific script
    let scriptContent = '';
    
    if (request.contentType === 'video') {
      scriptContent = `${opening}

A member from ${source} shared their experience: "${words}${postContent.length > 50 ? '...' : ''}"

This resonates with many people facing similar challenges. Let me break down what's really going on here and what you can do about it.

First, it's important to understand the context. When we see discussions like this, there's usually a deeper issue at play. Many people struggle with this exact situation, and you're not alone if you've experienced something similar.

Second, let's talk about practical solutions. Based on common approaches that work well, here are some actionable steps you can take:

Start by identifying the core challenge. What's the real problem here? Once you understand that, you can begin to address it systematically.

Next, look for patterns in your own situation. Does this apply to you? If so, how? Understanding your specific context is crucial.

Finally, take action. Knowledge without action doesn't create change. Start with one small step today.

${closing}`;
    } else if (request.contentType === 'blog') {
      scriptContent = `# Understanding the Discussion

${opening}

## The Original Post

Someone on ${source} shared: "${words}${postContent.length > 50 ? '...' : ''}"

This caught my attention because it highlights a challenge many face.

## Why This Matters

When we see discussions like this emerge on platforms like ${platform}, it tells us something important about what people are experiencing. This isn't an isolated incident - it's a common concern that deserves our attention.

## What You Can Do

Here are practical steps to address this:

**1. Recognize the Pattern**
The first step is acknowledging that this situation exists. You can't solve a problem you don't acknowledge.

**2. Understand Your Context**
How does this apply to your specific situation? Take a moment to reflect on your own experience.

**3. Take Action**
Start implementing small changes today. Progress comes from consistent action, not perfect plans.

## Moving Forward

The key is to start somewhere. Don't let perfect be the enemy of good.

${closing}`;
    } else if (request.contentType === 'social') {
      scriptContent = `${opening}

Saw this on ${source}: "${words.substring(0, 100)}${words.length > 100 ? '...' : ''}"

This is SO relatable. Here's what I think about it:

→ First, understand you're not alone in this
→ Second, there are practical ways to address it  
→ Third, small steps lead to big changes

The key? Start today, not tomorrow.

${closing}`;
    } else { // email
      scriptContent = `Subject: Thoughts on [Topic from ${platform}]

${opening}

I recently came across a discussion on ${source} that I thought you'd find valuable:

"${words}${postContent.length > 50 ? '...' : ''}"

This resonated with me because it highlights something many of us face. Here's what I learned:

**Key Insight #1:** Understanding the situation is half the battle. When we recognize patterns, we can address them.

**Key Insight #2:** There are practical solutions available. You don't have to figure everything out alone.

**Key Insight #3:** Taking action, even small steps, creates momentum.

What's your experience with this? I'd love to hear your thoughts.

${closing}`;
    }
    
    return {
      title: `Insights from ${platform}: ${source} Discussion`,
      content: scriptContent,
      keyPoints: [
        'Real discussion from community members',
        'Practical insights you can apply today',
        'Understanding common challenges and solutions'
      ],
      callToAction: `What's your experience with this? Share your thoughts!`,
      hashtags: [`#${platform.toLowerCase()}`, '#community', '#insights'],
      estimatedDuration: request.length === 'short' ? '2-3 minutes' : request.length === 'medium' ? '5-7 minutes' : '10-15 minutes'
    };
  }

  // New method using backend API with enhanced Perplexity intelligence
  static async generateScriptViaBackend(request: ScriptRequest): Promise<GeneratedScript> {
    try {
      console.log('🎬 Generating script via backend API...');
      
      const response = await fetch(`${this.API_BASE_URL}/scripts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Script generation failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Script generation failed');
      }

      console.log('✅ Script generated successfully via backend');
      return result.data;

    } catch (error) {
      console.error('❌ Backend script generation error:', error);
      throw error;
    }
  }
}
