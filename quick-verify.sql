-- Quick Verification - Check All Tables Were Created
-- Run this in Supabase SQL Editor

-- Check all 9 tables exist
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled'
  END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'champions', 'panels', 'indicators', 'votes', 
    'comments', 'reviews', 'accepted_reviews', 
    'admin_actions', 'invitations'
  )
ORDER BY tablename;

-- Check critical INSERT policy for champions (for registration)
SELECT 
  'Critical Policy' AS check_type,
  policyname,
  with_check AS "WITH CHECK Clause",
  CASE 
    WHEN with_check LIKE '%auth.uid() = id%' THEN '✅ Correct INSERT Policy'
    ELSE '❌ Check policy'
  END AS status
FROM pg_policies 
WHERE tablename = 'champions' 
  AND cmd = 'INSERT';

