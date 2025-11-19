# Fix Registration Issues - Data Not Saving to Supabase

If registration appears successful but data isn't saved to Supabase, check these issues:

## Issue 1: Row Level Security (RLS) Policies

The most common issue is RLS policies blocking the insert. Check if RLS is enabled and if there's a policy allowing inserts.

### Check RLS Status:
1. Go to Supabase dashboard → **Table Editor** → `champions` table
2. Click the **"RLS policies"** button (top right)
3. Check if RLS is enabled

### Fix: Create Insert Policy

Run this SQL in Supabase SQL Editor:

```sql
-- Allow users to insert their own champion profile
CREATE POLICY "Users can insert own profile" 
ON champions
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- If the above doesn't work, try this more permissive policy (for testing):
-- DROP POLICY IF EXISTS "Users can insert own profile" ON champions;
-- CREATE POLICY "Users can insert own profile" 
-- ON champions
-- FOR INSERT 
-- WITH CHECK (true);  -- Allow any authenticated user to insert

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'champions';
```

## Issue 2: Email Confirmation Required

If email confirmation is enabled, the user won't be fully authenticated until they confirm their email.

### Fix: Disable Email Confirmation (for testing)

1. Go to Supabase dashboard → **Authentication** → **Settings**
2. Under **Email Auth**, find **"Enable email confirmations"**
3. **Disable** it for testing
4. Or set it to auto-confirm for testing

## Issue 3: Check Browser Console for Errors

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try registering again
4. Look for error messages

Common errors:
- `new row violates row-level security policy` → RLS issue (see Issue 1)
- `permission denied` → Policy issue
- `duplicate key value` → User already exists

## Issue 4: Verify Supabase Connection

Run this in the browser console (F12) on the registration page:

```javascript
// Check if Supabase is connected
console.log('Supabase client:', supabaseClient);
console.log('Supabase config:', SUPABASE_CONFIG);

// Test connection
supabaseClient
  .from('champions')
  .select('count')
  .then(({data, error}) => {
    console.log('Connection test:', error ? 'FAILED' : 'SUCCESS', error);
  });
```

## Issue 5: Check if Auth User Was Created

Even if champion profile fails, the auth user might be created:

1. Go to Supabase dashboard → **Authentication** → **Users**
2. Check if your email appears there
3. If yes, the auth worked but the profile insert failed (likely RLS issue)

## Quick Fix: Test with Direct SQL Insert

To verify the table structure is correct, try inserting directly:

```sql
-- Get your user ID from Authentication → Users
-- Then run this (replace YOUR_USER_ID with actual UUID)

INSERT INTO champions (
  id,
  first_name,
  last_name,
  email,
  organization,
  role
) VALUES (
  'YOUR_USER_ID',
  'Test',
  'User',
  'test@example.com',
  'Test Org',
  'Test Role'
);
```

If this works, the issue is with RLS policies on the frontend.

## Complete RLS Setup for Champions Table

Run this complete RLS setup:

```sql
-- Enable RLS
ALTER TABLE champions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own profile" ON champions;
DROP POLICY IF EXISTS "Users can update own profile" ON champions;
DROP POLICY IF EXISTS "Users can insert own profile" ON champions;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" 
ON champions
FOR SELECT 
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON champions
FOR UPDATE 
USING (auth.uid() = id);

-- Policy: Users can insert their own profile (matches user ID)
CREATE POLICY "Users can insert own profile" 
ON champions
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'champions';
```

## Debug Registration Flow

After the fix, test registration again and check console logs. You should see:
1. "Starting sign up process for: [email]"
2. "Auth user created: [user-id]"
3. "Inserting champion profile: [data]"
4. "Champion profile created successfully: [profile]"

If any step fails, you'll see the error in the console.

