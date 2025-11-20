-- Fix accept_review function to handle duplicate key errors
-- This allows accepting a review even if it was already accepted before

DROP FUNCTION IF EXISTS accept_review(UUID, UUID);

CREATE OR REPLACE FUNCTION accept_review(
  p_review_id UUID,
  p_admin_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_accepted_id UUID;
  v_review_data RECORD;
  v_panel_id TEXT;
  v_indicator_title TEXT;
  v_panel_title TEXT;
BEGIN
  -- Get review data with indicator and panel information
  SELECT 
    r.*,
    i.title as indicator_title,
    i.panel_id,
    p.title as panel_title
  INTO v_review_data
  FROM reviews r
  JOIN indicators i ON i.id = r.indicator_id
  JOIN panels p ON p.id = i.panel_id
  WHERE r.id = p_review_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review not found';
  END IF;
  
  -- Check if review is already accepted
  IF v_review_data.status = 'accepted' THEN
    -- Get existing accepted review ID
    SELECT id INTO v_accepted_id
    FROM accepted_reviews
    WHERE review_id = p_review_id
    LIMIT 1;
    
    IF FOUND THEN
      -- Review already accepted, return existing ID
      RETURN v_accepted_id;
    END IF;
  END IF;
  
  -- Extract values from the record
  v_panel_id := v_review_data.panel_id;
  v_indicator_title := v_review_data.indicator_title;
  v_panel_title := v_review_data.panel_title;
  
  -- Insert into accepted_reviews with ON CONFLICT handling
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
    v_panel_id,
    v_review_data.necessary,
    v_review_data.rating,
    v_review_data.comments,
    p_admin_id
  )
  ON CONFLICT (review_id) DO UPDATE
  SET 
    champion_id = EXCLUDED.champion_id,
    indicator_id = EXCLUDED.indicator_id,
    panel_id = EXCLUDED.panel_id,
    necessary = EXCLUDED.necessary,
    rating = EXCLUDED.rating,
    comments = EXCLUDED.comments,
    accepted_by = EXCLUDED.accepted_by,
    accepted_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_accepted_id;
  
  -- Update review status
  UPDATE reviews
  SET status = 'accepted',
      updated_at = NOW()
  WHERE id = p_review_id;
  
  -- Record admin action (only if not already recorded)
  INSERT INTO admin_actions (admin_id, review_id, action)
  VALUES (p_admin_id, p_review_id, 'accept')
  ON CONFLICT DO NOTHING;
  
  -- Create notification for champion (if review was just accepted)
  IF v_review_data.status != 'accepted' THEN
    PERFORM create_notification(
      v_review_data.champion_id,
      'review_accepted',
      'Review Accepted',
      'Your review for "' || v_indicator_title || '" in panel "' || v_panel_title || '" has been accepted and added to the rankings.',
      p_review_id
    );
  END IF;
  
  RETURN v_accepted_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

