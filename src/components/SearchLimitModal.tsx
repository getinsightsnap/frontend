import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface SearchLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
  searchCount: number;
  userTier?: 'free' | 'standard' | 'pro';
}

const SearchLimitModal: React.FC<SearchLimitModalProps> = ({
  isOpen,
  onClose,
  onSignUp,
  searchCount,
  userTier = 'free'
}) => {
  if (!isOpen) return null;

  const limits = {
    free: 5,
    standard: 50,
    pro: 999999
  };

  const currentLimit = limits[userTier];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Search Limit Reached</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            You've used {searchCount} of your {currentLimit} daily searches.
          </p>
          
          {userTier === 'free' && (
            <>
              <p className="text-gray-600 mb-6">
                Upgrade to unlock more searches and additional features!
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onSignUp();
                    onClose();
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Upgrade to Standard
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Maybe Later
                </button>
              </div>
            </>
          )}
          
          {userTier !== 'free' && (
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchLimitModal;
