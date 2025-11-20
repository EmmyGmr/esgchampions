# Why You're Getting "Row-Level Security Policy" Error

## The Error
```
Failed to create champion profile: new row violates row-level security policy for table "champions"
```

## What's Happening

### 1. **Row Level Security (RLS) is Enabled**
   - Supabase has Row Level Security (RLS) enabled on your `champions` table
   - RLS acts like a firewall - it blocks ALL database operations by default
   - You need to create "policies" (rules) that allow specific operations

### 2. **No Insert Policy Exists**
   - When you try to register, the code tries to INSERT a new row into `champions`
   - RLS checks: "Is there a policy that allows this user to insert?"
   - Since no policy exists, RLS blocks the insert → Error!

### 3. **Why RLS Exists**
   - RLS is a security feature to prevent unauthorized access
   - Without RLS, anyone could read/write any data
   - With RLS, you control exactly who can do what

## The Flow

```
User Registers
    ↓
1. Auth user created ✅ (works - auth.users has its own rules)
    ↓
2. Try to insert into champions table
    ↓
3. RLS checks: "Can this user insert?"
    ↓
4. No policy found ❌
    ↓
5. RLS blocks the insert
    ↓
6. Error: "violates row-level security policy"
```

## The Solution

You need to create an RLS policy that says:
**"Users can insert a row into champions table where the id matches their own user ID"**

This makes sense because:
- During registration, the user ID from auth.users is used as the id in champions
- So `auth.uid() = id` means "this row belongs to this user"
- This is safe because users can only create their own profile

## How to Fix

### Step 1: Run the RLS Fix SQL

1. Go to Supabase dashboard → **SQL Editor** → **New Query**
2. Open `fix-champions-rls.sql` from your project
3. Copy and paste the entire SQL
4. Click **Run**

This creates three policies:
- **SELECT**: Users can read their own profile
- **UPDATE**: Users can update their own profile  
- **INSERT**: Users can insert their own profile (THIS IS THE KEY ONE!)

### Step 2: Verify Policies Were Created

After running the SQL, verify:

```sql
-- Check if policies exist
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'champions';
```

You should see:
- `Users can read own profile` (SELECT)
- `Users can update own profile` (UPDATE)
- `Users can insert own profile` (INSERT) ← This one fixes your error!

### Step 3: Test Registration Again

After running the SQL:
1. Refresh your registration page
2. Try registering again
3. It should work now! ✅

## Why This Policy Works

The INSERT policy uses:
```sql
WITH CHECK (auth.uid() = id)
```

This means:
- `auth.uid()` = The currently authenticated user's ID (from Supabase Auth)
- `id` = The id value being inserted into the champions table
- The policy only allows the insert if these match

During registration:
1. User signs up → Gets user ID (e.g., `abc-123-def`)
2. Code tries to insert: `{ id: 'abc-123-def', email: '...', ... }`
3. RLS checks: `auth.uid() = 'abc-123-def'` AND `id = 'abc-123-def'` → ✅ Match!
4. Policy allows the insert → Success!

## Common Mistakes

### ❌ Wrong: No RLS Policy
- RLS enabled but no policies
- Result: All operations blocked

### ❌ Wrong: Policy Too Restrictive
```sql
-- This won't work during registration
CREATE POLICY "Users can insert" 
ON champions FOR INSERT 
WITH CHECK (auth.uid() = id AND email = 'specific@email.com');
```

### ✅ Correct: Policy Allows Own Profile
```sql
-- This works!
CREATE POLICY "Users can insert own profile" 
ON champions FOR INSERT 
WITH CHECK (auth.uid() = id);
```

## Summary

**The Problem:**
- RLS is enabled (good for security)
- No INSERT policy exists (blocks registration)
- RLS blocks the insert → Error

**The Solution:**
- Run `fix-champions-rls.sql` to create the INSERT policy
- Policy allows: "Users can insert their own profile"
- Registration works! ✅

## After Fixing

Once you run the SQL fix:
- ✅ Registration will work
- ✅ Users can create their own profiles
- ✅ Data will save to Supabase
- ✅ Security is maintained (users can only create their own profile)

