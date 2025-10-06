import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthService } from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  subscription_tier: 'free' | 'standard' | 'pro';
  search_count: number;
}

interface AuthCallbackProps {
  onAuthComplete: (user: User) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting auth callback process');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        // Check if we have tokens in the URL hash
        const hash = window.location.hash;
        console.log('🔍 Checking URL hash:', hash);
        
        if (!hash || !hash.includes('access_token')) {
          console.error('No access token found in URL hash');
          setError('Invalid authentication link. Please try signing in again.');
          return;
        }
        
        // Extract access token from URL hash immediately
        console.log('🔍 Extracting access token from URL...');
        const urlParams = new URLSearchParams(hash.substring(1));
        const accessToken = urlParams.get('access_token');
        const tokenType = urlParams.get('token_type');
        const expiresAt = urlParams.get('expires_at');
        
        console.log('🔍 Token details:', {
          hasAccessToken: !!accessToken,
          tokenType,
          expiresAt,
          tokenLength: accessToken?.length
        });
        
        if (accessToken) {
          try {
            // Decode the JWT token to get user info
            console.log('🔍 Decoding JWT token...');
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            console.log('✅ Extracted user info from token:', payload);
            
            const userData = {
              id: payload.sub,
              name: payload.user_metadata?.name || payload.email?.split('@')[0] || 'User',
              email: payload.email || '',
              subscription_tier: 'free' as const,
              search_count: 0
            };
            
            console.log('✅ Using extracted user data:', userData);
            console.log('🚀 Calling onAuthComplete...');
            onAuthComplete(userData);
            return;
          } catch (tokenError) {
            console.error('Failed to extract user info from token:', tokenError);
            console.error('Token parts:', accessToken.split('.'));
          }
        }
        
        // Fallback: Wait a moment for Supabase to process the tokens
        console.log('⏳ Waiting for Supabase to process tokens...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to get the session after tokens are processed
        let sessionData = null;
        let sessionError = null;
        
        try {
          console.log('🔍 Attempting to get session from Supabase...');
          const { data, error } = await supabase.auth.getSession();
          sessionData = data;
          sessionError = error;
          console.log('AuthCallback: Session data:', data);
          console.log('AuthCallback: Session error:', error);
        } catch (err) {
          console.warn('Session retrieval failed:', err);
          sessionError = err;
        }
        
        // If session retrieval also failed, show error
        if (sessionError || !sessionData?.session?.user) {
          console.error('❌ Both token extraction and session retrieval failed');
          setError('Authentication failed. Please try signing in again.');
          return;
        }

        if (sessionData.session?.user) {
          console.log('✅ User session found:', sessionData.session.user.email);
          
          // Create basic user data for completion
          const userData = {
            id: sessionData.session.user.id,
            name: sessionData.session.user.user_metadata?.name || sessionData.session.user.email?.split('@')[0] || 'User',
            email: sessionData.session.user.email || '',
            subscription_tier: 'free' as const,
            search_count: 0
          };
          
          // Try to get/create profile, but don't let it block completion
          try {
            console.log('🔍 Attempting to get/create user profile...');
            const { user: authUser, profile } = await AuthService.getCurrentUser();
            
            if (authUser && profile) {
              console.log('✅ Profile found, using profile data');
              onAuthComplete({
                id: authUser.id,
                name: profile.name,
                email: profile.email,
                subscription_tier: profile.subscription_tier,
                search_count: profile.search_count
              });
            } else {
              console.log('⚠️ No profile found, using basic user data');
              onAuthComplete(userData);
            }
          } catch (profileError) {
            console.warn('⚠️ Profile creation/retrieval failed, using basic user data:', profileError);
            onAuthComplete(userData);
          }
        } else {
          setError('No user session found. Please try signing in again.');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Add fallback timeout to ensure callback always completes
    const fallbackTimeout = setTimeout(() => {
      console.warn('⚠️ Auth callback taking too long, forcing completion...');
      setIsLoading(false);
      setError('Authentication is taking longer than expected. Please try refreshing the page.');
    }, 10000); // 10 second fallback

    handleAuthCallback().finally(() => {
      clearTimeout(fallbackTimeout);
    });
  }, [onAuthComplete]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-900 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;
