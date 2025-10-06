import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Home, 
  ExternalLink, 
  Twitter, 
  Youtube, 
  MessageSquare, 
  TrendingUp, 
  Lightbulb,
  Sparkles,
  Crown,
  Mail,
  Linkedin,
  Instagram
} from 'lucide-react';
import { AnalyzedResults, SocialPost } from '../services/apiConfig';
import ScriptGenerationModal from './ScriptGenerationModal';

interface ResultsPageProps {
  results: AnalyzedResults;
  searchQuery: string;
  onBack: () => void;
  onHome: () => void;
  onContact: () => void;
  onLogin: () => void;
  onSignUp: () => void;
  onPrivacyPolicy: () => void;
  user: { 
    id: string;
    name: string; 
    email: string;
    subscription_tier: 'free' | 'standard' | 'pro';
    search_count: number;
  } | null;
  onSignOut: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  results,
  searchQuery,
  onBack,
  onHome,
  onContact,
  onLogin,
  onSignUp,
  onPrivacyPolicy,
  user,
  onSignOut
}) => {
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [scriptModalCategory, setScriptModalCategory] = useState<'painPoints' | 'trendingIdeas' | 'contentIdeas'>('painPoints');
  const [scriptModalPosts, setScriptModalPosts] = useState<SocialPost[]>([]);

  const userTier = user?.subscription_tier || 'free';
  const tierLimits = {
    free: 3,
    standard: 5,
    pro: 10
  };

  const handleGenerateScript = (category: 'painPoints' | 'trendingIdeas' | 'contentIdeas', posts: SocialPost[]) => {
    setScriptModalCategory(category);
    setScriptModalPosts(posts);
    setScriptModalOpen(true);
  };

  const renderResultCard = (
    title: string, 
    icon: React.ReactNode, 
    results: SocialPost[], 
    bgColor: string, 
    category: 'painPoints' | 'trendingIdeas' | 'contentIdeas'
  ) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className={`${bgColor} p-6 rounded-t-xl`}>
        <div className="flex items-center gap-3 text-white">
          {icon}
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-white/80 text-sm">
            {results.length} of {tierLimits[userTier]} results
          </span>
          {userTier !== 'free' && userTier === 'pro' && (
            <Crown className="w-5 h-5 text-yellow-300" />
          )}
        </div>
      </div>

      {/* Results */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">{icon}</div>
              <p className="text-gray-500">No results found for this category</p>
            </div>
          ) : (
            results.map((result) => (
              <div key={result.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {result.platform === 'reddit' && (
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        r
                      </div>
                    )}
                    {result.platform === 'x' && <Twitter className="w-6 h-6 text-blue-500" />}
                    {result.platform === 'youtube' && <Youtube className="w-6 h-6 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm leading-relaxed mb-3">
                      {result.content}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="font-medium">{result.source}</span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {result.engagement} engagement
                        </span>
                        <span>{result.timestamp}</span>
                        {result.url && (
                          <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleGenerateScript(category, [result])}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all text-xs font-medium shadow-sm hover:shadow-md"
                      >
                        <Sparkles className="w-3 h-3" />
                        Generate Script
                        {userTier === 'free' && <Crown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <button 
                onClick={onHome}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo.png" 
                  alt="InsightSnap Logo" 
                  className="w-12 h-12"
                />
              </button>
              
              <div>
                <button 
                  onClick={onHome}
                  className="text-lg font-bold hover:text-indigo-600 transition-colors"
                >
                  InsightSnap
                </button>
                <div className="text-sm text-gray-500">
                  Results for "{searchQuery}"
                </div>
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">
                      {user.name}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        userTier === 'pro' ? 'bg-purple-100 text-purple-800' :
                        userTier === 'standard' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {tierLimits[userTier]} results per category
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {onSignOut && (
                      <button
                        onClick={onSignOut}
                        className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onLogin}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={onSignUp}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Insights for "{searchQuery}"
          </h1>
          <p className="text-gray-600">
            AI-powered analysis from social media discussions
          </p>
        </div>

        {/* Results Grid - Side by Side */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Pain Points */}
          {renderResultCard(
            'Pain Points',
            <MessageSquare className="w-6 h-6" />,
            results.painPoints,
            'bg-red-600',
            'painPoints'
          )}

          {/* Trending Ideas */}
          {renderResultCard(
            'Trending Ideas',
            <TrendingUp className="w-6 h-6" />,
            results.trendingIdeas,
            'bg-green-600',
            'trendingIdeas'
          )}

          {/* Content Ideas */}
          {renderResultCard(
            'Content Ideas',
            <Lightbulb className="w-6 h-6" />,
            results.contentIdeas,
            'bg-purple-600',
            'contentIdeas'
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {results.painPoints.length}
              </div>
              <div className="text-sm text-gray-600">Pain Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.trendingIdeas.length}
              </div>
              <div className="text-sm text-gray-600">Trending Ideas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {results.contentIdeas.length}
              </div>
              <div className="text-sm text-gray-600">Content Ideas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {results.painPoints.length + results.trendingIdeas.length + results.contentIdeas.length}
              </div>
              <div className="text-sm text-gray-600">Total Results</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            New Search
          </button>
          <button
            onClick={onHome}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </main>

      {/* Script Generation Modal */}
      <ScriptGenerationModal
        isOpen={scriptModalOpen}
        onClose={() => setScriptModalOpen(false)}
        category={scriptModalCategory}
        posts={scriptModalPosts}
        userTier={userTier}
        onUpgrade={onSignUp}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-0 mb-4">
                <img 
                  src="/logo.png" 
                  alt="InsightSnap Logo" 
                  className="w-16 h-16"
                />
                <h3 className="text-xl font-bold">InsightSnap</h3>
              </div>
              <p className="text-gray-400">
                Discover what your audience really wants with AI-powered social media insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:contact@insightsnap.co" className="hover:text-white transition-colors">
                    contact@insightsnap.co
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li>
                  <button 
                    onClick={onContact}
                    className="hover:text-white transition-colors text-left w-full"
                  >
                    Contact Us
                  </button>
                </li>
                 <li>
                  <button 
                    onClick={onPrivacyPolicy}
                    className="hover:text-white transition-colors text-left w-full"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 InsightSnap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResultsPage;
