import React, { useState } from 'react';
import { X, Download, Copy, Check, Loader, FileText, Video, Mail, Share2, Sparkles } from 'lucide-react';
import { ContentGenerationService, ScriptRequest, GeneratedScript } from '../services/contentGenerationService';
import { SocialPost } from '../services/apiConfig';

interface ScriptGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'painPoints' | 'trendingIdeas' | 'contentIdeas';
  posts: SocialPost[];
  userTier: 'free' | 'standard' | 'pro';
  onUpgrade: () => void;
}

const ScriptGenerationModal: React.FC<ScriptGenerationModalProps> = ({
  isOpen,
  onClose,
  category,
  posts,
  userTier,
  onUpgrade
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'reddit' | 'x' | 'youtube'>('all');
  const [contentType, setContentType] = useState<'video' | 'blog' | 'social' | 'email'>('video');
  const [tone, setTone] = useState<'professional' | 'casual' | 'educational' | 'entertaining'>('educational');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Check if user can generate scripts
  const canGenerateScript = userTier !== 'free';
  const scriptLimits = {
    free: 0,
    standard: 25,
    pro: 999999
  };

  const categoryTitles = {
    painPoints: 'Pain Points',
    trendingIdeas: 'Trending Ideas',
    contentIdeas: 'Content Ideas'
  };

  const contentTypeIcons = {
    video: <Video className="w-5 h-5" />,
    blog: <FileText className="w-5 h-5" />,
    social: <Share2 className="w-5 h-5" />,
    email: <Mail className="w-5 h-5" />
  };

  // Get post preview for display
  const getPostPreview = () => {
    if (posts.length === 0) return 'Social Media Post';
    const firstPost = posts[0];
    const preview = firstPost.content.substring(0, 60);
    return posts.length === 1 
      ? `"${preview}${firstPost.content.length > 60 ? '...' : ''}"`
      : `${posts.length} Posts from ${categoryTitles[category]}`;
  };

  const handleGenerateScript = async () => {
    if (!canGenerateScript) {
      onUpgrade();
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedScript(null);

    try {
      console.log('🎬 Generating script for:', { category, contentType, tone, length });
      
      const request: ScriptRequest = {
        category,
        posts: selectedPlatform === 'all' ? posts : posts.filter(p => p.platform === selectedPlatform),
        platform: selectedPlatform,
        contentType,
        tone,
        length
      };

      console.log('📝 Script request:', request);
      const script = await ContentGenerationService.generateScript(request);
      console.log('✅ Script generated:', script);
      
      setGeneratedScript(script);
    } catch (err) {
      console.error('❌ Script generation error:', err);
      setError('Failed to generate script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!generatedScript) return;

    try {
      const scriptText = `${generatedScript.title}\n\n${generatedScript.content}\n\nKey Points:\n${generatedScript.keyPoints.map(point => `• ${point}`).join('\n')}\n\nCall to Action:\n${generatedScript.callToAction}`;
      
      await navigator.clipboard.writeText(scriptText);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    if (!generatedScript) return;

    const scriptText = `${generatedScript.title}\n\n${generatedScript.content}\n\nKey Points:\n${generatedScript.keyPoints.map(point => `• ${point}`).join('\n')}\n\nCall to Action:\n${generatedScript.callToAction}${generatedScript.hashtags ? `\n\nHashtags:\n${generatedScript.hashtags.join(' ')}` : ''}`;
    
    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedScript.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetModal = () => {
    setGeneratedScript(null);
    setError(null);
    setCopiedToClipboard(false);
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Generate Script from Post
              </h2>
            </div>
            {posts.length === 1 && (
              <p className="text-sm text-gray-600 ml-9 line-clamp-2">
                Creating content based on: {getPostPreview()}
              </p>
            )}
            {posts.length > 1 && (
              <p className="text-sm text-gray-600 ml-9">
                Creating content based on {posts.length} posts from {categoryTitles[category]}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!canGenerateScript ? (
            /* Upgrade Prompt for Free Users */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Script Generation Available with Standard & Pro
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Upgrade your plan to generate unlimited AI-powered scripts based on your research insights.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI-powered script generation using Perplexity AI</li>
                  <li>• Multiple content formats (Video, Blog, Social, Email)</li>
                  <li>• Customizable tone and length</li>
                  <li>• Ready-to-use hashtags and CTAs</li>
                  <li>• Export and download options</li>
                  <li>• Based on real-time social media data</li>
                </ul>
              </div>
              <button
                onClick={onUpgrade}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Upgrade Now
              </button>
            </div>
          ) : !generatedScript ? (
            /* Script Configuration */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Configure Your Script
                </h3>
                
                {/* Show the source post(s) */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    📝 Source Content:
                  </h4>
                  {posts.length === 1 ? (
                    <div className="text-sm text-blue-800">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{posts[0].platform.toUpperCase()}</span>
                        <span className="text-blue-600">•</span>
                        <span>{posts[0].source}</span>
                      </div>
                      <p className="italic line-clamp-3">"{posts[0].content}"</p>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-800">
                      {posts.length} posts from {categoryTitles[category]}
                    </p>
                  )}
                </div>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus on Platform
                </label>
                <div className="flex gap-2">
                  {['all', 'reddit', 'x'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPlatform === platform
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {platform === 'all' ? 'All Platforms' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['video', 'blog', 'social', 'email'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setContentType(type)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors ${
                        contentType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {contentTypeIcons[type]}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['professional', 'casual', 'educational', 'entertaining'] as const).map((toneOption) => (
                    <button
                      key={toneOption}
                      onClick={() => setTone(toneOption)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        tone === toneOption
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'short', label: 'Short', desc: '1-3 min' },
                    { key: 'medium', label: 'Medium', desc: '5-8 min' },
                    { key: 'long', label: 'Long', desc: '10-15 min' }
                  ] as const).map((lengthOption) => (
                    <button
                      key={lengthOption.key}
                      onClick={() => setLength(lengthOption.key)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        length === lengthOption.key
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div>{lengthOption.label}</div>
                      <div className="text-xs opacity-75">{lengthOption.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerateScript}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating Script with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Script
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Generated Script Display */
            <div className="space-y-6">
              {/* Script Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Generated Script</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {copiedToClipboard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedToClipboard ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              {/* Script Content */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {generatedScript.title}
                  </h4>
                  {generatedScript.estimatedDuration && (
                    <p className="text-sm text-gray-600 mb-4">
                      Estimated duration: {generatedScript.estimatedDuration}
                    </p>
                  )}
                </div>

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {generatedScript.content}
                  </div>
                </div>

                {/* Key Points */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Key Points:</h5>
                  <ul className="space-y-1">
                    {generatedScript.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to Action */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Call to Action:</h5>
                  <p className="text-gray-700 italic">"{generatedScript.callToAction}"</p>
                </div>

                {/* Hashtags */}
                {generatedScript.hashtags && generatedScript.hashtags.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Suggested Hashtags:</h5>
                    <div className="flex flex-wrap gap-2">
                      {generatedScript.hashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Another Button */}
              <button
                onClick={() => setGeneratedScript(null)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Generate Another Script
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScriptGenerationModal;
