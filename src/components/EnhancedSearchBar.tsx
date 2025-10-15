import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { SearchService, Subtopic } from '../services/searchService';
import { QueryExpansionModal } from './QueryExpansionModal';
import { CategorySelectionModal } from './CategorySelectionModal';
import { VirtualKeyboard } from './VirtualKeyboard';

interface EnhancedSearchBarProps {
  onSearchComplete: (results: any, query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  userTier: 'free' | 'standard' | 'pro';
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearchComplete,
  isLoading,
  setIsLoading,
  userTier
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Debug: Log when searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      console.log('🔍 Search query updated to:', searchQuery);
    }
  }, [searchQuery]);
  
  // Multi-step search state
  const [currentStep, setCurrentStep] = useState<'search' | 'expansion' | 'category'>('search');
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);

  // Languages for virtual keyboard
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ];

  const handleInitialSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Starting enhanced search for:', searchQuery);
      
      // Step 1: Generate query expansion options
      const expansionResponse = await SearchService.generateQueryExpansion(searchQuery.trim());
      
      if (expansionResponse.success && expansionResponse.data.subtopics.length > 0) {
        setSubtopics(expansionResponse.data.subtopics);
        setCurrentStep('expansion');
        console.log('✅ Query expansion generated, showing subtopic selection');
      } else {
        throw new Error('Failed to generate search options');
      }
    } catch (err) {
      console.error('❌ Query expansion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate search options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubtopicSelection = (subtopic: Subtopic) => {
    console.log('📝 User selected subtopic:', subtopic.title);
    setSelectedSubtopic(subtopic);
    setCurrentStep('category');
  };

  const handleCustomQuery = async (customQuery: string) => {
    console.log('📝 User entered custom query:', customQuery);
    const customSubtopic: Subtopic = {
      title: 'Custom Topic',
      description: `Your custom search: ${customQuery}`,
      expandedQuery: customQuery,
      category: 'custom',
      isCustom: true
    };
    setSelectedSubtopic(customSubtopic);
    setCurrentStep('category');
  };

  const handleCategorySelection = async (category: 'pain-points' | 'trending-ideas' | 'content-ideas') => {
    if (!selectedSubtopic) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🎯 Performing focused search:', {
        subtopic: selectedSubtopic.title,
        category,
        expandedQuery: selectedSubtopic.expandedQuery
      });

      // Step 3: Perform focused search
      const searchResponse = await SearchService.performFocusedSearch(
        searchQuery,
        selectedSubtopic.expandedQuery,
        category,
        {
          platforms: ['reddit', 'x', 'youtube'],
          timeFilter: 'week',
          language: 'en'
        }
      );

      if (searchResponse.success) {
        // Convert to the format expected by ResearchDashboard
        const formattedResults = {
          painPoints: searchResponse.data.metadata.category === 'pain-points' ? searchResponse.data.results : [],
          trendingIdeas: searchResponse.data.metadata.category === 'trending-ideas' ? searchResponse.data.results : [],
          contentIdeas: searchResponse.data.metadata.category === 'content-ideas' ? searchResponse.data.results : [],
          metadata: searchResponse.data.metadata
        };
        
        onSearchComplete(formattedResults, searchResponse.data.metadata.expandedQuery);
        console.log('✅ Enhanced search complete:', {
          results: searchResponse.data.results.length,
          relevance: searchResponse.data.metadata.relevanceScore
        });
        
        // Reset state
        resetSearch();
      } else {
        throw new Error('Focused search failed');
      }
    } catch (err) {
      console.error('❌ Focused search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSearch = () => {
    setCurrentStep('search');
    setSubtopics([]);
    setSelectedSubtopic(null);
    setError(null);
  };

  const goBack = () => {
    if (currentStep === 'expansion') {
      setCurrentStep('search');
    } else if (currentStep === 'category') {
      setCurrentStep('expansion');
    }
  };

  return (
    <>
      {/* Enhanced Search Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What insights are you looking for?
        </label>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-800">
            <strong>🎯 Enhanced AI Search:</strong> Get more relevant results with our multi-step AI-powered search that helps you find exactly what you need.
          </p>
        </div>
        
        {/* Progress Indicator */}
        {currentStep !== 'search' && (
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'expansion' ? 'text-blue-600' : currentStep === 'category' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep === 'expansion' ? 'bg-blue-600 text-white' : currentStep === 'category' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <span className="text-sm font-medium">Search</span>
            </div>
            <div className={`w-12 h-1 rounded-full ${currentStep === 'expansion' || currentStep === 'category' ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${currentStep === 'expansion' ? 'text-blue-600' : currentStep === 'category' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep === 'expansion' ? 'bg-blue-600 text-white' : currentStep === 'category' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Focus</span>
            </div>
            <div className={`w-12 h-1 rounded-full ${currentStep === 'category' ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${currentStep === 'category' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep === 'category' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <span className="text-sm font-medium">Results</span>
            </div>
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., AI marketing, content creation, productivity tips..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleInitialSearch()}
            disabled={isLoading || currentStep !== 'search'}
          />
          <button
            onClick={handleInitialSearch}
            disabled={!searchQuery.trim() || isLoading || currentStep !== 'search'}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <Search className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Current Step Info */}
        {currentStep === 'search' && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="font-medium text-blue-900 mb-2">🎯 Enhanced AI Search</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• AI generates specific focus areas for your topic</li>
              <li>• Choose exactly what type of insights you want</li>
              <li>• Get highly relevant, filtered results</li>
              <li>• No more irrelevant posts like stock trading or horror stories!</li>
            </ul>
          </div>
        )}

        {/* Back Button */}
        {currentStep !== 'search' && (
          <div className="mt-3">
            <button
              onClick={goBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to {currentStep === 'expansion' ? 'Search' : 'Focus Selection'}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <QueryExpansionModal
        isOpen={currentStep === 'expansion'}
        onClose={() => setCurrentStep('search')}
        originalQuery={searchQuery}
        subtopics={subtopics}
        onSelectSubtopic={handleSubtopicSelection}
        onCustomInput={handleCustomQuery}
        isLoading={isLoading}
      />

      <CategorySelectionModal
        isOpen={currentStep === 'category'}
        onClose={() => setCurrentStep('expansion')}
        selectedSubtopic={selectedSubtopic!}
        onSelectCategory={handleCategorySelection}
      />

      {/* Virtual Keyboard */}
      <VirtualKeyboard 
        onTextChange={setSearchQuery}
        languages={languages}
      />
    </>
  );
};
