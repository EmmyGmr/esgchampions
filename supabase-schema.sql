-- Supabase Database Schema for STIF ESG Champions Platform
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CHAMPIONS (Users) TABLE
-- ============================================
-- Note: Supabase Auth handles user authentication
-- This table stores additional champion profile data
CREATE TABLE IF NOT EXISTS champions (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization TEXT,
  role TEXT,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT,
  office_phone TEXT,
  linkedin TEXT,
  website TEXT,
  competence TEXT, -- 'beginner', 'intermediate', 'advanced', 'expert'
  contributions TEXT,
  primary_sector TEXT,
  expertise_panels TEXT, -- JSON array or comma-separated
  cla_accepted BOOLEAN DEFAULT false,
  nda_accepted BOOLEAN DEFAULT false,
  nda_signature TEXT,
  terms_accepted BOOLEAN DEFAULT false,
  ip_policy_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PANELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS panels (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'environmental', 'social', 'governance'
  description TEXT,
  purpose TEXT,
  key_indicators TEXT,
  frameworks TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDICATORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS indicators (
  id TEXT PRIMARY KEY,
  panel_id TEXT NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  formula_required BOOLEAN DEFAULT false,
  unit TEXT,
  frameworks TEXT,
  sector_context TEXT,
  validation_question TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  champion_id UUID NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
  indicator_id TEXT NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  vote TEXT NOT NULL, -- 'up', 'down', 'neutral'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(champion_id, indicator_id) -- One vote per champion per indicator
);

-- ============================================
-- 5. COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  champion_id UUID NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
  indicator_id TEXT NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  champion_id UUID NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
  indicator_id TEXT NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  necessary TEXT, -- 'yes', 'no', 'not-sure'
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(champion_id, indicator_id) -- One review per champion per indicator
);

-- ============================================
-- 7. INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_champion_id UUID NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  panel_id TEXT NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_champions_email ON champions(email);
CREATE INDEX IF NOT EXISTS idx_indicators_panel_id ON indicators(panel_id);
CREATE INDEX IF NOT EXISTS idx_votes_champion_id ON votes(champion_id);
CREATE INDEX IF NOT EXISTS idx_votes_indicator_id ON votes(indicator_id);
CREATE INDEX IF NOT EXISTS idx_comments_champion_id ON comments(champion_id);
CREATE INDEX IF NOT EXISTS idx_comments_indicator_id ON comments(indicator_id);
CREATE INDEX IF NOT EXISTS idx_reviews_champion_id ON reviews(champion_id);
CREATE INDEX IF NOT EXISTS idx_reviews_indicator_id ON reviews(indicator_id);
CREATE INDEX IF NOT EXISTS idx_invitations_to_email ON invitations(to_email);
CREATE INDEX IF NOT EXISTS idx_invitations_panel_id ON invitations(panel_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Champions: Users can read all, but only update their own
CREATE POLICY "Champions are viewable by everyone" ON champions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own champion profile" ON champions
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own champion profile" ON champions
  FOR UPDATE USING (auth.uid() = id);

-- Panels: Readable by all authenticated users
CREATE POLICY "Panels are viewable by authenticated users" ON panels
  FOR SELECT USING (auth.role() = 'authenticated');

-- Indicators: Readable by all authenticated users
CREATE POLICY "Indicators are viewable by authenticated users" ON indicators
  FOR SELECT USING (auth.role() = 'authenticated');

-- Votes: Users can read all, insert/update their own
CREATE POLICY "Votes are viewable by everyone" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = champion_id);

CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (auth.uid() = champion_id);

CREATE POLICY "Users can delete their own votes" ON votes
  FOR DELETE USING (auth.uid() = champion_id);

-- Comments: Users can read all, insert/update their own
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = champion_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = champion_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = champion_id);

-- Reviews: Users can read all, insert/update their own
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = champion_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = champion_id);

-- Invitations: Users can read their own (sent or received)
CREATE POLICY "Users can view invitations sent to their email" ON invitations
  FOR SELECT USING (
    auth.uid() = from_champion_id OR 
    to_email = (SELECT email FROM champions WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert invitations" ON invitations
  FOR INSERT WITH CHECK (auth.uid() = from_champion_id);

CREATE POLICY "Users can update invitations they sent" ON invitations
  FOR UPDATE USING (auth.uid() = from_champion_id);

-- ============================================
-- FUNCTIONS for Updated Timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_champions_updated_at BEFORE UPDATE ON champions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panels_updated_at BEFORE UPDATE ON panels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indicators_updated_at BEFORE UPDATE ON indicators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

