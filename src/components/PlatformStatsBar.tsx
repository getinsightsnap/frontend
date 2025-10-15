import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Search, Zap } from 'lucide-react';
import { StatsService, PlatformStats } from '../services/statsService';

export const PlatformStatsBar: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalSearches: 0,
    activeUsers: 0,
    searchesToday: 0,
    topKeywords: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load
    loadStats();

    // Subscribe to real-time updates
    const unsubscribe = StatsService.subscribeToStatsUpdates((newStats) => {
      setStats(newStats);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    const newStats = await StatsService.getPlatformStats();
    setStats(newStats);
    setIsLoading(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-6 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Searches */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-3">
          <div className="bg-white/20 rounded-full p-3">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white/80 text-xs font-medium">Total Searches</div>
            <div className="text-white text-2xl font-bold">
              {isLoading ? (
                <div className="animate-pulse h-8 w-16 bg-white/20 rounded"></div>
              ) : (
                <span className="flex items-center">
                  {formatNumber(stats.totalSearches)}
                  <Zap className="w-4 h-4 ml-1 text-yellow-300" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-3">
          <div className="bg-white/20 rounded-full p-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white/80 text-xs font-medium">Active Users</div>
            <div className="text-white text-2xl font-bold">
              {isLoading ? (
                <div className="animate-pulse h-8 w-16 bg-white/20 rounded"></div>
              ) : (
                <span className="flex items-center">
                  {formatNumber(stats.activeUsers)}
                  <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Today's Searches */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-3">
          <div className="bg-white/20 rounded-full p-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white/80 text-xs font-medium">Today's Searches</div>
            <div className="text-white text-2xl font-bold">
              {isLoading ? (
                <div className="animate-pulse h-8 w-16 bg-white/20 rounded"></div>
              ) : (
                formatNumber(stats.searchesToday)
              )}
            </div>
          </div>
        </div>

        {/* Trending Keywords */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="text-white/80 text-xs font-medium mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Trending Now
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <>
                <div className="animate-pulse h-4 w-full bg-white/20 rounded"></div>
                <div className="animate-pulse h-4 w-3/4 bg-white/20 rounded"></div>
                <div className="animate-pulse h-4 w-1/2 bg-white/20 rounded"></div>
              </>
            ) : stats.topKeywords.length > 0 ? (
              stats.topKeywords.slice(0, 3).map((kw, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-white font-medium truncate max-w-[120px]">
                    {index + 1}. {kw.keyword}
                  </span>
                  <span className="text-white/60 ml-2">×{kw.count}</span>
                </div>
              ))
            ) : (
              <div className="text-white/60 text-xs">No data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-center mt-4">
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-medium">Live Stats</span>
        </div>
      </div>
    </div>
  );
};

