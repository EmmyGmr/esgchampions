# Troubleshooting Guide

## Login Issues

### Error: "Invalid login credentials"

This error can occur for several reasons:

#### 1. User Doesn't Exist
If you just tried to register and it failed (due to RLS issues), the user account might not have been created.

**Check if user exists:**
1. Go to Supabase dashboard → **Authentication** → **Users**
2. Search for your email address
3. If it doesn't exist → Registration failed, try registering again after fixing RLS

#### 2. User Exists but Profile Missing
The user exists in auth.users but not in champions table.

**Check:**
1. Go to Supabase → **Authentication** → **Users** (check if email exists)
2. Go to Supabase → **Table Editor** → **champions** (check if profile exists)
3. If user exists in auth but not in champions → Registration failed after auth

**Fix:**
- Run `fix-duplicate-policies.sql` to fix RLS policies
- Try registering again

#### 3. Wrong Password
Double-check your password is correct.

**Fix:**
- Make sure caps lock is off
- Try resetting password (if forgot password is implemented)
- Or create a new account with a different email

#### 4. Email Not Confirmed
If email confirmation is enabled in Supabase, you need to confirm your email first.

**Check:**
1. Check your email inbox (and spam folder)
2. Look for confirmation email from Supabase
3. Click the confirmation link

**Disable for testing:**
1. Go to Supabase → **Authentication** → **Settings**
2. Under **Email Auth**, find **"Enable email confirmations"**
3. Disable it for testing

## Registration Issues

### Error: "Passwords do not match"
This is a validation error - the password and confirm password fields don't match.

**Fix:**
- Make sure both password fields have the same value
- Check for extra spaces or typos

### Error: "new row violates row-level security policy"
This is the RLS policy error we've been fixing.

**Fix:**
1. Run `fix-duplicate-policies.sql` in Supabase SQL Editor
2. Verify policies were created correctly
3. Try registering again

### Error: "An account with this email already exists"
The email check detected the email is already registered.

**Fix:**
- Go to the login page
- The email should be pre-filled
- Enter your password to log in

## Quick Diagnostic Steps

### Check if User Exists in Auth
Run this in Supabase SQL Editor:
```sql
SELECT email, created_at, confirmed_at
FROM auth.users
WHERE email = 'your-email@example.com';
```

If no rows returned → User doesn't exist (registration failed)

### Check if Profile Exists
Run this in Supabase SQL Editor:
```sql
SELECT id, email, first_name, last_name, created_at
FROM champions
WHERE email = 'your-email@example.com';
```

If no rows returned → Profile doesn't exist (registration failed)

### Check RLS Policies
Run this in Supabase SQL Editor:
```sql
SELECT policyname, cmd, with_check
FROM pg_policies
WHERE tablename = 'champions';
```

You should see 3 policies:
- SELECT policy
- INSERT policy (with `with_check = (auth.uid() = id)`)
- UPDATE policy

## Common Solutions

### Solution 1: Fix RLS Policies
1. Run `fix-duplicate-policies.sql`
2. Verify policies exist
3. Try registering again

### Solution 2: Check Email Confirmation
1. Check Supabase settings
2. Disable email confirmation for testing
3. Try logging in again

### Solution 3: Manual User Creation (Testing Only)
If you need to test immediately, you can manually create a user in Supabase:
1. Go to **Authentication** → **Users** → **Add user**
2. Enter email and password
3. Create user
4. Then manually insert into champions table (requires admin access)

### Solution 4: Reset and Start Fresh
1. Delete the user from auth.users (if exists)
2. Delete from champions table (if exists)
3. Run `fix-duplicate-policies.sql`
4. Register again

## Browser Console Debugging

Open browser console (F12) and check for:
- **"Attempting login for: [email]"** - Login started
- **"Auth successful"** - Auth worked
- **"Champion profile found"** - Profile exists
- Any red error messages - These help identify the issue

## Still Having Issues?

1. Check browser console (F12) for detailed errors
2. Check Supabase dashboard for errors
3. Verify RLS policies are correct
4. Make sure email confirmation is disabled (for testing)
5. Try with a different email address

