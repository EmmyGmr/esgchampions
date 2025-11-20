-- Add is_admin column to champions table
-- Run this ONLY if the column doesn't exist yet
-- The complete-database-schema.sql already includes this column

-- Check if column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'champions' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE champions 
    ADD COLUMN is_admin BOOLEAN DEFAULT false;
    
    CREATE INDEX IF NOT EXISTS idx_champions_is_admin ON champions(is_admin);
    
    RAISE NOTICE 'Column is_admin added successfully';
  ELSE
    RAISE NOTICE 'Column is_admin already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'champions' 
  AND column_name = 'is_admin';

