// API Configuration - Compatible with both Vite and Create React App
const getEnvVar = (key: string): string => {
  // Try Vite first (import.meta.env)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[`VITE_${key}`] || '';
  }
  // Fallback to Create React App (process.env)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`REACT_APP_${key}`] || '';
  }
  // Fallback to empty string
  return '';
};

export const API_CONFIG = {
  reddit: {
    baseUrl: 'https://www.reddit.com', // Fixed: was showing oauth.reddit.com in logs
    userAgent: 'InsightSnap/1.0.0'
  },
  x: {
    baseUrl: 'https://api.x.com/2',
    bearerToken: getEnvVar('X_BEARER_TOKEN')
  },
  perplexity: {
    apiKey: getEnvVar('PERPLEXITY_API_KEY'),
    baseUrl: 'https://api.perplexity.ai'
  }
};



export interface SearchParams {
  query: string;
  language: string;
  timeFilter: string;
  platforms: string[];
}

export interface SocialPost {
  id: string;
  content: string;
  platform: 'reddit' | 'x' | 'youtube';
  source: string;
  engagement: number;
  timestamp: string;
  url?: string;
  author?: string;
}

export interface AnalyzedResults {
  painPoints: SocialPost[];
  trendingIdeas: SocialPost[];
  contentIdeas: SocialPost[];
}

export interface NoResultsMessage {
  title: string;
  message: string;
  reasons: string[];
  suggestions: string[];
  tip: string;
}