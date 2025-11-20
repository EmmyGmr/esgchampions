-- Fix Duplicate and Incorrect RLS Policies for Champions Table
-- This script removes duplicate policies and ensures correct WITH CHECK clauses

-- Drop ALL existing policies (we'll recreate them correctly)
DROP POLICY IF EXISTS "Champions are viewable by everyone" ON champions;
DROP POLICY IF EXISTS "Users can insert own profile" ON champions;
DROP POLICY IF EXISTS "Users can insert their own champion profile" ON champions;
DROP POLICY IF EXISTS "Users can read own profile" ON champions;
DROP POLICY IF EXISTS "Users can update own profile" ON champions;
DROP POLICY IF EXISTS "Users can update their own champion profile" ON champions;

-- Recreate policies with correct configurations

-- Policy 1: Users can read their own profile
CREATE POLICY "Users can read own profile" 
ON champions
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON champions
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can insert their own profile (CRITICAL FOR REGISTRATION)
-- This allows registration when the id matches auth.uid()
CREATE POLICY "Users can insert own profile" 
ON champions
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Optional: Allow public read access (if you want everyone to see champion profiles)
-- Uncomment if needed:
-- CREATE POLICY "Champions are viewable by everyone" 
-- ON champions
-- FOR SELECT 
-- USING (true);

-- Verify policies were created correctly
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  qual as "USING Clause",
  with_check as "WITH CHECK Clause"
FROM pg_policies 
WHERE tablename = 'champions'
ORDER BY cmd, policyname;

-- The INSERT policy should show: with_check = '(auth.uid() = id)'
-- If it shows something different or NULL, that's the problem!

