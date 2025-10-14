-- Create table for storing relevance ratings
CREATE TABLE IF NOT EXISTS relevance_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    post_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_relevance_ratings_query ON relevance_ratings(search_query);
CREATE INDEX IF NOT EXISTS idx_relevance_ratings_user ON relevance_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_relevance_ratings_post ON relevance_ratings(post_id);
CREATE INDEX IF NOT EXISTS idx_relevance_ratings_created_at ON relevance_ratings(created_at);

-- Create table for aggregated rating analytics
CREATE TABLE IF NOT EXISTS relevance_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    search_query TEXT NOT NULL,
    platform TEXT NOT NULL,
    avg_rating DECIMAL(3,2) NOT NULL,
    total_ratings INTEGER NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(search_query, platform)
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_relevance_analytics_query ON relevance_analytics(search_query);
CREATE INDEX IF NOT EXISTS idx_relevance_analytics_platform ON relevance_analytics(platform);

-- Function to update analytics when new rating is added
CREATE OR REPLACE FUNCTION update_relevance_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO relevance_analytics (search_query, platform, avg_rating, total_ratings)
    VALUES (NEW.search_query, NEW.platform, NEW.rating, 1)
    ON CONFLICT (search_query, platform)
    DO UPDATE SET
        avg_rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM relevance_ratings
            WHERE search_query = NEW.search_query AND platform = NEW.platform
        ),
        total_ratings = (
            SELECT COUNT(*)
            FROM relevance_ratings
            WHERE search_query = NEW.search_query AND platform = NEW.platform
        ),
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update analytics
CREATE TRIGGER trigger_update_relevance_analytics
    AFTER INSERT ON relevance_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_relevance_analytics();

-- Create table for AI learning patterns
CREATE TABLE IF NOT EXISTS ai_learning_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    search_query TEXT NOT NULL,
    similar_queries TEXT[],
    platform TEXT NOT NULL,
    content_patterns TEXT[],
    avg_relevance_score DECIMAL(3,2),
    improvement_suggestions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for learning patterns
CREATE INDEX IF NOT EXISTS idx_ai_learning_query ON ai_learning_patterns(search_query);
CREATE INDEX IF NOT EXISTS idx_ai_learning_platform ON ai_learning_patterns(platform);
