-- Fix Foreign Key Constraint Issue
-- This creates a trigger to automatically create champion profile when auth user is created
-- Run this in Supabase SQL Editor

-- ============================================
-- OPTION 1: Create Trigger Function (Recommended)
-- ============================================
-- This automatically creates a champion profile when a user signs up
-- This ensures the foreign key constraint is always satisfied

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into champions table with the new user's ID
  -- Note: This will be called AFTER auth.users row is created
  INSERT INTO public.champions (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate if trigger fires twice
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- OPTION 2: Alternative - Update RLS Policy to Allow Service Role
-- ============================================
-- If the trigger approach doesn't work, we can modify the INSERT policy
-- But the trigger is better because it ensures data consistency

-- ============================================
-- VERIFY TRIGGER WAS CREATED
-- ============================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'on_auth_user_created';

-- ============================================
-- TEST: Check if function exists
-- ============================================
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

