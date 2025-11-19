-- Fix RLS Policies for Champions Table
-- This allows users to insert their own profile during registration
-- Run this in Supabase SQL Editor

-- Enable RLS (if not already enabled)
ALTER TABLE champions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own profile" ON champions;
DROP POLICY IF EXISTS "Users can update own profile" ON champions;
DROP POLICY IF EXISTS "Users can insert own profile" ON champions;

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile" 
ON champions
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON champions
FOR UPDATE 
USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile (during registration)
-- This is critical - it allows users to insert a row where id = their auth.uid()
CREATE POLICY "Users can insert own profile" 
ON champions
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Verify the policies were created
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
WHERE tablename = 'champions'
ORDER BY policyname;

-- Test query to verify setup
-- This should return all policies for champions table
SELECT 
  'RLS enabled: ' || tablename AS status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'champions'
  AND rowsecurity = true;

