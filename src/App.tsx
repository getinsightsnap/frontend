import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ResearchDashboard from './components/ResearchDashboard';
import ResultsPage from './components/ResultsPage';
import AuthModal from './components/AuthModal';
import AuthCallback from './components/AuthCallback';
import SearchLimitModal from './components/SearchLimitModal';
import ContactPage from './components/ContactPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import { AuthService } from './services/authService';
import { supabase } from './lib/supabase';
import { AnalyzedResults } from './services/apiConfig';
import { MetaPixelService } from './services/metaPixelService';

interface User {
  id: string;
  name: string;
  email: string;
  subscription_tier: 'free' | 'standard' | 'pro';
  search_count: number;
}

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'results' | 'contact' | 'privacy' | 'auth-callback'>('landing');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['landing']);
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [searchLimitModalOpen, setSearchLimitModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resetAuthLoading, setResetAuthLoading] = useState(false);
  
  // Anonymous user search count state
  const [anonymousSearchCount, setAnonymousSearchCount] = useState<number>(() => {
    const stored = localStorage.getItem('anonymousSearchCount');
    return stored ? parseInt(stored, 10) : 0;
  });
  
  // Results state
  const [currentResults, setCurrentResults] = useState<AnalyzedResults | null>(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('');

  // Initialize Meta Pixel on app start
  useEffect(() => {
    // Use your actual Meta Pixel ID
    const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '782862880877552';
    
    if (PIXEL_ID && PIXEL_ID !== 'YOUR_PIXEL_ID_HERE') {
      MetaPixelService.initialize(PIXEL_ID);
    } else {
      console.warn('⚠️ Meta Pixel ID not configured. Add VITE_META_PIXEL_ID to your .env file');
    }
  }, []);

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 App initializing...');
        console.log('🔍 Environment variables check:', {
          hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          hasBackendUrl: !!import.meta.env.VITE_BACKEND_URL,
          hasMetaPixelId: !!import.meta.env.VITE_META_PIXEL_ID
        });
        
        // Track app initialization
        MetaPixelService.trackFunnelStep('app_initialization', 1);
        
        // Test database connection
        const dbTest = await AuthService.testDatabaseConnection();
        if (!dbTest.success) {
          console.error('❌ Database connection failed during app initialization');
        }
        
        // Check if this is an auth callback URL
        const path = window.location.pathname;
        const hash = window.location.hash;
        const currentUrl = window.location.href;
        
        console.log('Current URL:', currentUrl);
        console.log('Current path:', path);
        console.log('Current hash:', hash);
        
        // Clean up URL if it has the @ prefix issue
        if (currentUrl.includes('@https://')) {
          console.log('🔧 Fixing URL with @ prefix');
          const cleanUrl = currentUrl.replace('@https://', 'https://');
          window.history.replaceState({}, '', cleanUrl);
        }
        
        // Check for auth callback conditions
        const isAuthCallback = (
          path === '/auth/callback' || 
          hash.includes('access_token') || 
          hash.includes('refresh_token') ||
          hash.includes('type=signup') ||
          currentUrl.includes('@https://') // Handle the @ prefix case
        );
        
        console.log('🔍 Auth callback check:', {
          path,
          hash,
          isAuthCallback,
          hasAccessToken: hash.includes('access_token'),
          hasRefreshToken: hash.includes('refresh_token'),
          hasTypeSignup: hash.includes('type=signup'),
          hasAtPrefix: currentUrl.includes('@https://')
        });
        
        if (isAuthCallback) {
          console.log('🔄 Auth callback detected - switching to auth-callback view');
          MetaPixelService.trackFunnelStep('auth_callback', 2);
          setCurrentView('auth-callback');
          setIsLoading(false);
          return;
        }

        // Normal app initialization - check for existing session
        console.log('🔍 Checking for existing session...');
        
        try {
          // Add timeout to prevent hanging
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 5000)
          );
          
          const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
          
          if (session?.user) {
            console.log('✅ Found existing session for:', session.user.email);
            
            // Track returning user
            MetaPixelService.trackLogin('returning_session');
            
            // Get user profile with timeout
            try {
              const profilePromise = AuthService.getCurrentUser() as Promise<{ user: any; profile: any }>;
              const profileTimeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
              );
              
              const { user: authUser, profile } = await Promise.race([profilePromise, profileTimeoutPromise]) as any;
              
              if (authUser && profile) {
                setUser({
                  id: authUser.id,
                  name: profile.name,
                  email: profile.email,
                  subscription_tier: profile.subscription_tier,
                  search_count: profile.search_count
                });
                
                // Track user tier
                MetaPixelService.trackCustomEvent('UserTierIdentified', {
                  tier: profile.subscription_tier,
                  search_count: profile.search_count
                });
              }
            } catch (profileError) {
              console.warn('⚠️ Could not fetch user profile:', profileError);
              // Continue without profile - user can still use the app
            }
          } else {
            console.log('ℹ️ No existing session found');
            MetaPixelService.trackPageView('landing_page_first_visit');
          }
        } catch (sessionError) {
          console.warn('⚠️ Session check failed:', sessionError);
          // Continue without session - user can still use the app
          MetaPixelService.trackPageView('landing_page_first_visit');
        }
        
      } catch (error) {
        console.error('❌ App initialization error:', error);
        MetaPixelService.trackCustomEvent('AppInitializationError', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setIsLoading(false);
        console.log('✅ App initialization complete');
      }
    };

    // Add a fallback timeout to ensure app always loads
    const fallbackTimeout = setTimeout(() => {
      console.warn('⚠️ App initialization taking too long, forcing completion...');
      setIsLoading(false);
    }, 10000); // 10 second fallback

    initializeApp().finally(() => {
      clearTimeout(fallbackTimeout);
    });
  }, []); // Empty dependency array - only run once

  // Listen for auth state changes
  useEffect(() => {
    console.log('👂 Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email || 'no user');
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          console.log('🔐 User signed in, fetching profile...');
          
          // Don't close modal if we're showing email verification
          if (showEmailVerification) {
            console.log('📧 Email verification screen is showing, keeping modal open');
            return;
          }
          
          // Check if user is already set to prevent duplicate processing
          if (user && user.email === session.user.email) {
            console.log('✅ User already set, skipping duplicate processing');
            return;
          }
          
          // Add timeout to prevent hanging
          const profileFetchPromise = AuthService.getCurrentUser();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
          );
          
          const { user: authUser, profile } = await Promise.race([
            profileFetchPromise,
            timeoutPromise
          ]) as { user: any; profile: any };
          
          console.log('🔍 Auth state change: getCurrentUser result:', { authUser: !!authUser, profile: !!profile });
          
          if (authUser) {
            let userData;
            
            if (profile) {
              // Use profile data if available
              userData = {
                id: authUser.id,
                name: profile.name,
                email: profile.email,
                subscription_tier: profile.subscription_tier,
                search_count: profile.search_count
              };
              console.log('✅ Using profile data:', userData);
            } else {
              // Fallback to basic user data if profile fetch failed
              userData = {
                id: authUser.id,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                email: authUser.email || '',
                subscription_tier: 'free' as const,
                search_count: 0
              };
              console.log('⚠️ Profile fetch failed, using basic user data:', userData);
            }
            
            setUser(userData);
            console.log('✅ User set:', userData.email);
            
            // Close auth modal and navigate to dashboard
            setAuthModalOpen(false);
            setCurrentView('dashboard');
            setNavigationHistory(['landing', 'dashboard']);
            
            // Reset loading state in modal
            setResetAuthLoading(true);
            setTimeout(() => setResetAuthLoading(false), 100);
            
            // Track successful login
            MetaPixelService.trackLogin('email_password');
            MetaPixelService.trackFunnelStep('successful_login', 3);
          } else {
            console.error('❌ Auth state change: No user found in getCurrentUser result');
            // This shouldn't happen if we have a session, but handle it gracefully
            const basicUserData = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              subscription_tier: 'free' as const,
              search_count: 0
            };
            setUser(basicUserData);
            setAuthModalOpen(false);
            setCurrentView('dashboard');
            setNavigationHistory(['landing', 'dashboard']);
            
            // Reset loading state in modal
            setResetAuthLoading(true);
            setTimeout(() => setResetAuthLoading(false), 100);
            
            MetaPixelService.trackLogin('email_password');
          }
        } catch (error) {
          console.error('❌ Error fetching user profile:', error);
          // Even if profile fetch fails, close modal and set basic user data
          const basicUserData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            subscription_tier: 'free' as const,
            search_count: 0
          };
          setUser(basicUserData);
          setAuthModalOpen(false);
          setCurrentView('dashboard');
          setNavigationHistory(['landing', 'dashboard']);
          
          // Reset loading state in modal
          setResetAuthLoading(true);
          setTimeout(() => setResetAuthLoading(false), 100);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        console.log('�� User signed out');
        MetaPixelService.trackCustomEvent('UserSignedOut');
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth listener...');
      subscription?.unsubscribe();
    };
  }, [showEmailVerification, user]); // Include user in dependencies to prevent duplicate processing

  // Handle auth callback completion
  const handleAuthComplete = (userData: User) => {
    console.log('🎉 Auth complete, redirecting to dashboard for:', userData.email);
    setUser(userData);
    setCurrentView('dashboard');
    setNavigationHistory(['landing', 'dashboard']);
    
    // Track successful registration/authentication
    MetaPixelService.trackSignUp('email_password');
    MetaPixelService.trackFunnelStep('dashboard_reached', 4);
    MetaPixelService.trackUserJourney('auth_callback', 'dashboard');
    
    // Clean up the URL
    window.history.replaceState({}, document.title, '/');
  };

  // Navigation functions
  const navigateTo = (view: 'landing' | 'dashboard' | 'results' | 'contact' | 'privacy') => {
    const previousView = currentView;
    setNavigationHistory(prev => [...prev, view]);
    setCurrentView(view);
    
    // Track page navigation
    MetaPixelService.trackUserJourney(previousView, view);
    MetaPixelService.trackPageView(view);
  };

  const handleGoBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentView(previousPage as 'landing' | 'dashboard' | 'results' | 'contact' | 'privacy');
      
      MetaPixelService.trackEngagement('navigation_back', previousPage);
    } else {
      setCurrentView('landing');
      MetaPixelService.trackPageView('landing');
    }
  };

  const handleGoHome = () => {
    setCurrentView('landing');
    setNavigationHistory(['landing']);
    MetaPixelService.trackEngagement('navigation_home');
    MetaPixelService.trackPageView('landing');
  };

  const handleGetStarted = () => {
    navigateTo('dashboard');
    MetaPixelService.trackEngagement('get_started_clicked');
    MetaPixelService.trackFunnelStep('get_started_clicked', 1);
  };

  const handleContact = () => {
    navigateTo('contact');
    MetaPixelService.trackContact('contact_page_visited');
  };

  const handlePrivacyPolicy = () => {
    navigateTo('privacy');
    MetaPixelService.trackEngagement('privacy_policy_viewed');
  };

  const handleLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
    setAuthError(null);
    MetaPixelService.trackEngagement('login_modal_opened');
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
    setAuthError(null);
    MetaPixelService.trackEngagement('signup_modal_opened');
    MetaPixelService.trackFunnelStep('signup_initiated', 2);
  };

  const handleShowResults = (results: AnalyzedResults, query: string) => {
    setCurrentResults(results);
    setCurrentSearchQuery(query);
    navigateTo('results');
    
    // Track successful search
    MetaPixelService.trackSearch(query, 'content_research');
    MetaPixelService.trackFunnelStep('search_results_displayed', 5);
    
    // Track results metrics
    const totalResults = (results.painPoints?.length || 0) + 
                        (results.trendingIdeas?.length || 0) + 
                        (results.contentIdeas?.length || 0);
    
    MetaPixelService.trackCustomEvent('SearchCompleted', {
      query,
      total_results: totalResults,
      pain_points: results.painPoints?.length || 0,
      trending_ideas: results.trendingIdeas?.length || 0,
      content_ideas: results.contentIdeas?.length || 0,
      user_tier: user?.subscription_tier || 'free'
    });
  };

  const handleAuth = async (email: string, password: string, name?: string) => {
    try {
      setAuthError(null);
      console.log('🔐 Starting authentication:', { mode: authMode, email });
      
      // Check if user is already signed in
      const { user: currentUser } = await AuthService.getCurrentUser();
      if (currentUser && currentUser.email === email) {
        console.log('✅ User is already signed in, closing modal and navigating to dashboard');
        setUser({
          id: currentUser.id,
          name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || '',
          subscription_tier: 'free',
          search_count: 0
        });
        setAuthModalOpen(false);
        setCurrentView('dashboard');
        setNavigationHistory(['landing', 'dashboard']);
        
        // Reset loading state in modal
        setResetAuthLoading(true);
        setTimeout(() => setResetAuthLoading(false), 100);
        
        MetaPixelService.trackLogin('email_password');
        return;
      }
      
      if (authMode === 'signup') {
        if (!name) {
          setAuthError('Name is required for sign up');
          return;
        }
        console.log('📝 Attempting sign up...');
        const { error } = await AuthService.signUp(email, password, name);
        if (error) {
          let errorMessage = 'Sign up failed';
          
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'object' && error !== null) {
            errorMessage = (error as any).message || 'Sign up failed';
          }
          
          // Handle specific error cases
          if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
            errorMessage = 'An account with this email already exists. Please sign in instead.';
          } else if (errorMessage.includes('Invalid email')) {
            errorMessage = 'Please enter a valid email address.';
          } else if (errorMessage.includes('Password')) {
            errorMessage = 'Password must be at least 6 characters long.';
          }
          
          console.error('❌ Sign up error:', errorMessage);
          setAuthError(errorMessage);
          MetaPixelService.trackCustomEvent('SignUpError', { error: errorMessage });
          return;
        }
        console.log('✅ Sign up successful');
        MetaPixelService.trackSignUp('email_password');
        
        // Show email verification screen instead of closing modal
        setAuthError(null);
        setVerificationEmail(email);
        setShowEmailVerification(true);
      } else {
        console.log('🔑 Attempting sign in...');
        const { error } = await AuthService.signIn(email, password);
        if (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
          console.error('❌ Sign in error:', errorMessage);
          setAuthError(errorMessage);
          MetaPixelService.trackCustomEvent('LoginError', { error: errorMessage });
          // Clear any email verification state on sign in error
          setShowEmailVerification(false);
          setVerificationEmail('');
          return;
        }
        console.log('✅ Sign in successful - waiting for auth state change...');
        // Clear any email verification state on successful sign in
        setShowEmailVerification(false);
        setVerificationEmail('');
        // Don't close modal here - let the auth state change handler do it
        // This ensures proper user state and navigation
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      setAuthError('An unexpected error occurred');
      MetaPixelService.trackCustomEvent('AuthenticationError', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 Signing out user...');
      const { error } = await AuthService.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        return;
      }
      
      // Clear all user-related state
      setUser(null);
      setCurrentView('landing');
      setNavigationHistory(['landing']);
      setAuthModalOpen(false);
      setAuthError(null);
      setShowEmailVerification(false);
      setVerificationEmail('');
      
      // Track sign out
      MetaPixelService.trackCustomEvent('UserSignedOut');
      MetaPixelService.trackPageView('landing');
      
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const handleSwitchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    setAuthError(null);
    MetaPixelService.trackEngagement(`auth_mode_switched_to_${authMode === 'login' ? 'signup' : 'login'}`);
  };

  const handleSearchLimitReached = () => {
    setSearchLimitModalOpen(true);
    MetaPixelService.trackUpgradePrompt(user?.subscription_tier || 'free', 'standard');
    MetaPixelService.trackCustomEvent('SearchLimitReached', {
      current_tier: user?.subscription_tier || 'free',
      search_count: user?.search_count || 0
    });
  };

  const handleSearchPerformed = async () => {
    if (user) {
      try {
        await AuthService.updateSearchCount(user.id);
        setUser(prev => prev ? { ...prev, search_count: prev.search_count + 1 } : null);
        
        MetaPixelService.trackDashboardUsage('search_performed');
        MetaPixelService.trackCustomEvent('SearchCountUpdated', {
          new_count: (user.search_count || 0) + 1,
          user_tier: user.subscription_tier
        });
      } catch (error) {
        console.error('Error updating search count:', error);
      }
    } else {
      // Handle anonymous user search count
      const newCount = anonymousSearchCount + 1;
      setAnonymousSearchCount(newCount);
      localStorage.setItem('anonymousSearchCount', newCount.toString());
      
      MetaPixelService.trackDashboardUsage('search_performed');
      MetaPixelService.trackCustomEvent('AnonymousSearchCountUpdated', {
        new_count: newCount,
        user_tier: 'free'
      });
    }
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    console.log('🔄 App is loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('�� Rendering app with view:', currentView, 'User:', user?.email || 'not logged in');

  return (
    <>
      {currentView === 'auth-callback' ? (
        <AuthCallback onAuthComplete={handleAuthComplete} />
      ) : currentView === 'landing' ? (
        <LandingPage
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onContact={handleContact}
          onPrivacyPolicy={handlePrivacyPolicy}
        />
      ) : currentView === 'dashboard' ? (
        <ResearchDashboard
          onBack={handleGoBack}
          onHome={handleGoHome}
          onContact={handleContact}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          user={user}
          searchCount={user?.search_count || anonymousSearchCount}
          onSearchLimitReached={handleSearchLimitReached}
          onPrivacyPolicy={handlePrivacyPolicy}
          onSearchPerformed={handleSearchPerformed}
          onSignOut={handleSignOut}
          onShowResults={handleShowResults}
        />
      ) : currentView === 'results' && currentResults ? (
        <ResultsPage
          results={currentResults}
          searchQuery={currentSearchQuery}
          onBack={() => setCurrentView('dashboard')}
          onHome={handleGoHome}
          onContact={handleContact}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onPrivacyPolicy={handlePrivacyPolicy}
          user={user}
          onSignOut={handleSignOut}
        />
      ) : currentView === 'contact' ? (
        <ContactPage
          onBack={handleGoBack}
          onHome={handleGoHome}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onPrivacyPolicy={handlePrivacyPolicy}
        />
      ) : currentView === 'privacy' ? (
        <PrivacyPolicy
          onBack={handleGoBack}
        />
      ) : null}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthError(null);
          setShowEmailVerification(false);
          setVerificationEmail('');
          MetaPixelService.trackEngagement('auth_modal_closed');
        }}
        mode={authMode}
        onSwitchMode={handleSwitchAuthMode}
        onAuth={handleAuth}
        error={authError}
        showEmailVerification={showEmailVerification}
        verificationEmail={verificationEmail}
        resetLoading={resetAuthLoading}
      />

      <SearchLimitModal
        isOpen={searchLimitModalOpen}
        onClose={() => {
          setSearchLimitModalOpen(false);
          MetaPixelService.trackEngagement('search_limit_modal_closed');
        }}
        onSignUp={handleSignUp}
        searchCount={user?.search_count || anonymousSearchCount}
        userTier={user?.subscription_tier || 'free'}
      />
    </>
  );
}

export default App;