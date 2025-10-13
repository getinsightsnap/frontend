-- Drop existing incomplete table
DROP TABLE IF EXISTS public.search_history CASCADE;

-- Create complete search_history table
CREATE TABLE public.search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  time_filter VARCHAR(20) DEFAULT 'week',
  user_tier VARCHAR(20) DEFAULT 'free',
  
  -- Results metadata
  total_results INTEGER DEFAULT 0,
  pain_points_count INTEGER DEFAULT 0,
  trending_ideas_count INTEGER DEFAULT 0,
  content_ideas_count INTEGER DEFAULT 0,
  
  -- User context
  user_email TEXT,
  is_authenticated BOOLEAN DEFAULT false,
  
  -- Search metadata
  search_duration_ms INTEGER,
  platforms_succeeded TEXT[],
  platforms_failed TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_created_at ON public.search_history(created_at);
CREATE INDEX idx_search_history_search_query ON public.search_history(search_query);
CREATE INDEX idx_search_history_user_tier ON public.search_history(user_tier);

-- Enable Row Level Security
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own search history" ON public.search_history;
DROP POLICY IF EXISTS "Anyone can insert search history" ON public.search_history;

-- Policy: Users can view their own search history
CREATE POLICY "Users can view own search history"
  ON public.search_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can insert (for tracking anonymous users too)
CREATE POLICY "Anyone can insert search history"
  ON public.search_history
  FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON public.search_history TO authenticated;
GRANT SELECT, INSERT ON public.search_history TO anon;

-- Verify table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'search_history'
ORDER BY ordinal_position;

