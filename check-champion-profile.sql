-- Check if Champion Profile Exists
-- Run this in Supabase SQL Editor to debug profile loading issues

-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- Or replace 'YOUR_EMAIL' with your email

-- Option 1: Check by email
SELECT 
  c.*,
  u.email as auth_email,
  u.id as auth_id,
  u.created_at as auth_created_at
FROM champions c
RIGHT JOIN auth.users u ON c.id = u.id
WHERE u.email = 'YOUR_EMAIL@example.com';

-- Option 2: Check by user ID
-- First, get your user ID:
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'YOUR_EMAIL@example.com';

-- Then check champion profile:
SELECT * 
FROM champions 
WHERE id = 'YOUR_USER_ID_HERE';

-- Option 3: Check RLS policies for champions table
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual as "USING clause",
  with_check as "WITH CHECK clause"
FROM pg_policies 
WHERE tablename = 'champions'
ORDER BY cmd, policyname;

-- The SELECT policy should allow reading champion profiles
-- If it's too restrictive, that could be the issue

