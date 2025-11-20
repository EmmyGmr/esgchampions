# Dashboard Troubleshooting - "undefined undefined" Issue

## The Problem

Dashboard shows "undefined undefined" for user name and empty fields, even though:
- ✅ User can register
- ✅ User can login
- ✅ User is authenticated (console shows SIGNED_IN)

## Root Cause

The champion profile exists in the database, but the dashboard can't read it due to:
1. **RLS Policy Issue** - The SELECT policy might be blocking the read
2. **Profile Missing** - Profile wasn't created during registration
3. **Field Name Mismatch** - Database uses snake_case, code expects camelCase

## Quick Fixes

### Fix 1: Check if Profile Exists

Run this in Supabase SQL Editor (replace with your email):

```sql
-- Check if your profile exists
SELECT c.*, u.email as auth_email
FROM champions c
RIGHT JOIN auth.users u ON c.id = u.id
WHERE u.email = 'your-email@example.com';
```

**If no profile exists:**
- Registration failed after creating auth user
- Run the trigger fix SQL (`fix-foreign-key-constraint.sql`)
- Or manually create profile (see below)

**If profile exists:**
- Check RLS policies (see Fix 2)

### Fix 2: Check RLS Policies

Run this SQL:

```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'champions';
```

You should see a SELECT policy that allows reading. If not, run:

```sql
-- Ensure SELECT policy exists
CREATE POLICY "Champions are viewable by everyone" ON champions
  FOR SELECT USING (true);
```

### Fix 3: Manually Create Profile (If Missing)

If your profile doesn't exist, create it manually:

1. **Get your user ID:**
   - Go to Supabase → Authentication → Users
   - Find your email
   - Copy the UUID (user ID)

2. **Create profile:**
```sql
-- Replace YOUR_USER_ID and YOUR_EMAIL with actual values
INSERT INTO champions (
  id,
  first_name,
  last_name,
  email,
  organization,
  role
) VALUES (
  'YOUR_USER_ID',
  'Your',
  'Name',
  'your-email@example.com',
  'Your Organization',
  'Your Role'
);
```

### Fix 4: Verify Data Structure

Check what fields your profile has:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'champions'
ORDER BY ordinal_position;
```

The dashboard code handles both:
- `first_name` / `firstName`
- `last_name` / `lastName`
- `expertise_panels` / `expertise`

## Debugging Steps

### Step 1: Check Browser Console

Open browser console (F12) and look for:
- ✅ "Authenticated user: [id] [email]" - User is authenticated
- ✅ "Champion profile fetched successfully: [data]" - Profile loaded
- ❌ "Champion profile not found" - Profile missing
- ❌ "Error fetching champion profile" - RLS or query issue

### Step 2: Check Supabase Dashboard

1. **Authentication → Users:**
   - Verify your email exists
   - Note your user ID

2. **Table Editor → champions:**
   - Check if your profile exists
   - Verify all fields are filled

3. **SQL Editor:**
   - Run `check-champion-profile.sql` to verify profile

### Step 3: Test RLS Policies

Run this to test if you can read your own profile:

```sql
-- This should return your profile
-- (Run as the authenticated user via API, not in SQL Editor)
SELECT * FROM champions WHERE id = auth.uid();
```

## Common Issues

### Issue: Profile exists but dashboard shows undefined

**Solution:**
- Check browser console for errors
- Verify field names match (snake_case vs camelCase)
- The updated code handles both, but check console logs

### Issue: "Champion profile not found" error

**Solution:**
- Profile wasn't created during registration
- Run `fix-foreign-key-constraint.sql` to add trigger
- Or manually create profile (see Fix 3)

### Issue: RLS blocking read

**Solution:**
- Verify SELECT policy exists and allows reading
- Policy should be: `USING (true)` for public read
- Or `USING (auth.uid() = id)` for own profile only

## After Fixing

1. **Refresh dashboard page**
2. **Check browser console** - Should see:
   - "Authenticated user: [id] [email]"
   - "Champion profile fetched successfully"
   - "Champion data: {firstName, lastName, email, ...}"
3. **Dashboard should show:**
   - Your name (not "undefined undefined")
   - Your email
   - Your organization
   - Your expertise areas

## Still Not Working?

1. **Clear browser cache and cookies**
2. **Log out and log back in**
3. **Check Supabase logs** for errors
4. **Verify trigger was created** (if using auto-profile creation)
5. **Check browser console** for detailed error messages

