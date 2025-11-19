-- Make Your User an Admin
-- Run this in Supabase SQL Editor

-- Option 1: Make yourself admin by email (REPLACE YOUR EMAIL)
UPDATE champions
SET is_admin = true
WHERE email = 'YOUR_EMAIL@example.com';

-- Option 2: Make the first user admin (if you're the first registered user)
UPDATE champions
SET is_admin = true
WHERE id = (
  SELECT id FROM champions 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Option 3: Make all users admin (for testing only - NOT RECOMMENDED FOR PRODUCTION)
-- UPDATE champions
-- SET is_admin = true;

-- Verify you're now admin
SELECT id, email, first_name, last_name, is_admin, created_at
FROM champions
WHERE is_admin = true
ORDER BY created_at DESC;

