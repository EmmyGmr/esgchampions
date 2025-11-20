-- Check RLS Policies on Champions Table
-- Run this to see what policies exist

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'champions';

-- Check existing policies for champions table
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  permissive as "Type",
  roles as "Roles",
  qual as "Using Clause",
  with_check as "With Check Clause"
FROM pg_policies 
WHERE tablename = 'champions'
ORDER BY cmd, policyname;

-- If no policies exist, you'll see no rows returned
-- If policies exist, you'll see them listed above

