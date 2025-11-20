-- Add review_drafts table for saving partial review progress
-- This allows users to resume reviews where they left off

CREATE TABLE IF NOT EXISTS review_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  champion_id UUID NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
  panel_id TEXT NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  indicator_id TEXT NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  
  -- Draft form data
  necessary TEXT CHECK (necessary IN ('yes', 'no', 'not-sure')),
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  comments TEXT,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one draft per champion per indicator
  UNIQUE(champion_id, indicator_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_review_drafts_champion_id ON review_drafts(champion_id);
CREATE INDEX IF NOT EXISTS idx_review_drafts_panel_id ON review_drafts(panel_id);
CREATE INDEX IF NOT EXISTS idx_review_drafts_indicator_id ON review_drafts(indicator_id);
CREATE INDEX IF NOT EXISTS idx_review_drafts_last_activity ON review_drafts(last_activity_at DESC);

-- Enable RLS
ALTER TABLE review_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own drafts" ON review_drafts;
DROP POLICY IF EXISTS "Users can insert own drafts" ON review_drafts;
DROP POLICY IF EXISTS "Users can update own drafts" ON review_drafts;
DROP POLICY IF EXISTS "Users can delete own drafts" ON review_drafts;

CREATE POLICY "Users can read own drafts" ON review_drafts
  FOR SELECT
  USING (auth.uid() = champion_id);

CREATE POLICY "Users can insert own drafts" ON review_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = champion_id);

CREATE POLICY "Users can update own drafts" ON review_drafts
  FOR UPDATE
  USING (auth.uid() = champion_id)
  WITH CHECK (auth.uid() = champion_id);

CREATE POLICY "Users can delete own drafts" ON review_drafts
  FOR DELETE
  USING (auth.uid() = champion_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_review_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_review_drafts_updated_at ON review_drafts;
CREATE TRIGGER update_review_drafts_updated_at
  BEFORE UPDATE ON review_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_review_drafts_updated_at();

-- Function to save or update draft
CREATE OR REPLACE FUNCTION save_review_draft(
  p_champion_id UUID,
  p_panel_id TEXT,
  p_indicator_id TEXT,
  p_necessary TEXT DEFAULT NULL,
  p_rating INTEGER DEFAULT NULL,
  p_comments TEXT DEFAULT NULL,
  p_progress_percentage INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_draft_id UUID;
BEGIN
  INSERT INTO review_drafts (
    champion_id,
    panel_id,
    indicator_id,
    necessary,
    rating,
    comments,
    progress_percentage,
    last_activity_at
  )
  VALUES (
    p_champion_id,
    p_panel_id,
    p_indicator_id,
    p_necessary,
    p_rating,
    p_comments,
    p_progress_percentage,
    NOW()
  )
  ON CONFLICT (champion_id, indicator_id) DO UPDATE
  SET
    necessary = COALESCE(EXCLUDED.necessary, review_drafts.necessary),
    rating = COALESCE(EXCLUDED.rating, review_drafts.rating),
    comments = COALESCE(EXCLUDED.comments, review_drafts.comments),
    progress_percentage = EXCLUDED.progress_percentage,
    last_activity_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_draft_id;
  
  RETURN v_draft_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's latest draft for resume
CREATE OR REPLACE FUNCTION get_latest_review_draft(p_champion_id UUID)
RETURNS TABLE (
  id UUID,
  panel_id TEXT,
  indicator_id TEXT,
  necessary TEXT,
  rating INTEGER,
  comments TEXT,
  progress_percentage INTEGER,
  last_activity_at TIMESTAMPTZ,
  panel_title TEXT,
  indicator_title TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rd.id,
    rd.panel_id,
    rd.indicator_id,
    rd.necessary,
    rd.rating,
    rd.comments,
    rd.progress_percentage,
    rd.last_activity_at,
    p.title as panel_title,
    i.title as indicator_title
  FROM review_drafts rd
  JOIN panels p ON p.id = rd.panel_id
  JOIN indicators i ON i.id = rd.indicator_id
  WHERE rd.champion_id = p_champion_id
  ORDER BY rd.last_activity_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

