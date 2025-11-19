-- Quick Fix: Add is_admin column to champions table
-- Run this in Supabase SQL Editor if you get the error "column champions.is_admin does not exist"

-- Add is_admin column to champions table
ALTER TABLE champions 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_champions_is_admin ON champions(is_admin);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'champions' AND column_name = 'is_admin';

