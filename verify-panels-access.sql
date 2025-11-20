-- Quick verification script to check if panels are accessible
-- Run this in Supabase SQL Editor to verify RLS policies and data

-- 1. Check if panels exist
SELECT 'Total panels in database:' as info, COUNT(*) as count FROM panels;

-- 2. Check RLS policies on panels table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'panels';

-- 3. Try to select panels (this simulates what the app does)
SELECT id, title, category, icon FROM panels ORDER BY id LIMIT 5;

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'panels';

-- If you see panels but they're not showing in the app:
-- 1. Make sure you're logged in (authenticated)
-- 2. Check browser console for errors
-- 3. Verify the RLS policy allows SELECT for authenticated users

