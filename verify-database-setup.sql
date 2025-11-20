-- Verification Script for Database Setup
-- Run this after complete-database-schema.sql to verify everything was created correctly

-- ============================================
-- VERIFY TABLES EXIST
-- ============================================
SELECT 
  'Tables Check' AS check_type,
  COUNT(*) AS count,
  CASE 
    WHEN COUNT(*) = 9 THEN '✅ All tables created'
    ELSE '❌ Missing tables: Expected 9, found ' || COUNT(*)::TEXT
  END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'champions', 'panels', 'indicators', 'votes', 
    'comments', 'reviews', 'accepted_reviews', 
    'admin_actions', 'invitations'
  );

-- ============================================
-- VERIFY RLS IS ENABLED
-- ============================================
SELECT 
  'RLS Check' AS check_type,
  tablename,
  rowsecurity AS "RLS Enabled",
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

-- ============================================
-- VERIFY RLS POLICIES
-- ============================================
SELECT 
  'RLS Policies Check' AS check_type,
  tablename,
  COUNT(*) AS "Policy Count",
  CASE 
    WHEN tablename = 'champions' AND COUNT(*) >= 3 THEN '✅ Policies OK'
    WHEN tablename = 'panels' AND COUNT(*) >= 1 THEN '✅ Policies OK'
    WHEN tablename = 'indicators' AND COUNT(*) >= 1 THEN '✅ Policies OK'
    WHEN tablename = 'votes' AND COUNT(*) >= 4 THEN '✅ Policies OK'
    WHEN tablename = 'comments' AND COUNT(*) >= 4 THEN '✅ Policies OK'
    WHEN tablename = 'reviews' AND COUNT(*) >= 3 THEN '✅ Policies OK'
    WHEN tablename = 'accepted_reviews' AND COUNT(*) >= 2 THEN '✅ Policies OK'
    WHEN tablename = 'admin_actions' AND COUNT(*) >= 2 THEN '✅ Policies OK'
    WHEN tablename = 'invitations' AND COUNT(*) >= 3 THEN '✅ Policies OK'
    ELSE '⚠️ Check policies'
  END AS status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'champions', 'panels', 'indicators', 'votes', 
    'comments', 'reviews', 'accepted_reviews', 
    'admin_actions', 'invitations'
  )
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- VERIFY CHAMPIONS INSERT POLICY (CRITICAL)
-- ============================================
SELECT 
  'Critical Policy Check' AS check_type,
  policyname,
  cmd AS "Command",
  with_check AS "WITH CHECK Clause",
  CASE 
    WHEN cmd = 'INSERT' AND with_check LIKE '%auth.uid() = id%' THEN '✅ Correct INSERT Policy'
    WHEN cmd = 'INSERT' AND with_check IS NULL THEN '❌ Missing WITH CHECK clause'
    ELSE '⚠️ Check policy'
  END AS status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'champions'
  AND cmd = 'INSERT';

-- ============================================
-- VERIFY FUNCTIONS EXIST
-- ============================================
SELECT 
  'Functions Check' AS check_type,
  routine_name AS "Function Name",
  routine_type AS "Type",
  '✅ Function exists' AS status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'accept_review',
    'delete_review',
    'update_updated_at_column'
  )
ORDER BY routine_name;

-- ============================================
-- VERIFY INDEXES EXIST
-- ============================================
SELECT 
  'Indexes Check' AS check_type,
  COUNT(*) AS "Index Count",
  CASE 
    WHEN COUNT(*) >= 25 THEN '✅ Indexes OK'
    ELSE '⚠️ Some indexes may be missing'
  END AS status
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN (
    'champions', 'panels', 'indicators', 'votes', 
    'comments', 'reviews', 'accepted_reviews', 
    'admin_actions', 'invitations'
  );

-- ============================================
-- SUMMARY
-- ============================================
SELECT 
  '=== SETUP VERIFICATION SUMMARY ===' AS summary,
  'Check all sections above for ✅ or ❌' AS instructions,
  'If you see ❌, review the complete-database-schema.sql script' AS note;

