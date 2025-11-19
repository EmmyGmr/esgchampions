-- Additional Schema for Admin Review System
-- Run this after the main supabase-schema.sql

-- ============================================
-- 1. UPDATE REVIEWS TABLE
-- ============================================
-- Add status column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'deleted'));

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================
-- 2. ADMIN ACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('accept', 'delete')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_review_id ON admin_actions(review_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- Enable RLS
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_actions
-- Only admins can view and create admin actions
-- Note: You'll need to create an admin role or check admin status
CREATE POLICY "Admins can view all admin actions" ON admin_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM champions 
      WHERE champions.id = auth.uid() 
      AND champions.is_admin = true
    )
  );

CREATE POLICY "Admins can insert admin actions" ON admin_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM champions 
      WHERE champions.id = auth.uid() 
      AND champions.is_admin = true
    )
  );

-- ============================================
-- 3. ADD ADMIN FLAG TO CHAMPIONS TABLE
-- ============================================
ALTER TABLE champions 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_champions_is_admin ON champions(is_admin);

-- ============================================
-- 4. ACCEPTED REVIEWS TABLE (for ranking page)
-- ============================================
-- This table stores accepted reviews that appear on the ranking page
CREATE TABLE IF NOT EXISTS accepted_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  champion_id UUID NOT NULL REFERENCES champions(id) ON DELETE CASCADE,
  indicator_id TEXT NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  panel_id TEXT NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  necessary TEXT,
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  comments TEXT,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(review_id)
);

CREATE INDEX IF NOT EXISTS idx_accepted_reviews_indicator_id ON accepted_reviews(indicator_id);
CREATE INDEX IF NOT EXISTS idx_accepted_reviews_panel_id ON accepted_reviews(panel_id);
CREATE INDEX IF NOT EXISTS idx_accepted_reviews_champion_id ON accepted_reviews(champion_id);

-- Enable RLS
ALTER TABLE accepted_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accepted_reviews
CREATE POLICY "Accepted reviews are viewable by everyone" ON accepted_reviews
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert accepted reviews" ON accepted_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM champions 
      WHERE champions.id = auth.uid() 
      AND champions.is_admin = true
    )
  );

-- ============================================
-- 5. FUNCTION TO ACCEPT REVIEW
-- ============================================
CREATE OR REPLACE FUNCTION accept_review(
  p_review_id UUID,
  p_admin_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_accepted_id UUID;
  v_review_data RECORD;
BEGIN
  -- Get review data
  SELECT * INTO v_review_data
  FROM reviews
  WHERE id = p_review_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found or already processed';
  END IF;
  
  -- Get panel_id from indicator
  SELECT panel_id INTO v_review_data.panel_id
  FROM indicators
  WHERE id = v_review_data.indicator_id;
  
  -- Insert into accepted_reviews
  INSERT INTO accepted_reviews (
    review_id,
    champion_id,
    indicator_id,
    panel_id,
    necessary,
    rating,
    comments,
    accepted_by
  ) VALUES (
    p_review_id,
    v_review_data.champion_id,
    v_review_data.indicator_id,
    v_review_data.panel_id,
    v_review_data.necessary,
    v_review_data.rating,
    v_review_data.comments,
    p_admin_id
  )
  RETURNING id INTO v_accepted_id;
  
  -- Update review status
  UPDATE reviews
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_review_id;
  
  -- Log admin action
  INSERT INTO admin_actions (admin_id, review_id, action, notes)
  VALUES (p_admin_id, p_review_id, 'accept', 'Review accepted and added to rankings');
  
  RETURN v_accepted_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. FUNCTION TO DELETE REVIEW
-- ============================================
CREATE OR REPLACE FUNCTION delete_review(
  p_review_id UUID,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Check if review exists and is pending
  IF NOT EXISTS (
    SELECT 1 FROM reviews WHERE id = p_review_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Review not found or already processed';
  END IF;
  
  -- Update review status
  UPDATE reviews
  SET status = 'deleted', updated_at = NOW()
  WHERE id = p_review_id;
  
  -- Log admin action
  INSERT INTO admin_actions (admin_id, review_id, action, notes)
  VALUES (p_admin_id, p_review_id, 'delete', COALESCE(p_notes, 'Review deleted by admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

