-- Check Detailed Policy Information for Champions Table
-- Run this to see the exact policy configurations

SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  qual as "USING Clause (for SELECT/UPDATE)",
  with_check as "WITH CHECK Clause (for INSERT/UPDATE)",
  permissive as "Type",
  roles as "Roles"
FROM pg_policies 
WHERE tablename = 'champions'
ORDER BY cmd, policyname;

-- Check if policies are correct
-- The INSERT policy should have: with_check = '(auth.uid() = id)'
-- If it's different or NULL, that's the problem!

