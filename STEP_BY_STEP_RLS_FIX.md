# Step-by-Step RLS Fix for Registration Error

## Your Error
```
Failed to create champion profile: new row violates row-level security policy for table "champions"
```

## Step 1: Check Current RLS Policies

1. Go to Supabase dashboard → **SQL Editor** → **New Query**
2. Open `check-rls-policies.sql` from your project
3. Copy and paste the SQL
4. Click **Run**
5. Check the results:
   - If you see policies listed → They exist but might be wrong
   - If you see no rows → No policies exist (this is likely your issue)

## Step 2: Check RLS Status in Table Editor

1. In Supabase dashboard, click on **Table Editor** (left sidebar)
2. Click on the **`champions`** table
3. Look at the top right - you should see:
   - **RLS policies** button (shows number like "0", "1", "3")
   - Click on it to see existing policies

## Step 3: Run the RLS Fix

If you see **no policies** or **0 policies** for `champions`:

1. Go to **SQL Editor** → **New Query**
2. Open `fix-champions-rls.sql` from your project
3. Copy and paste the ENTIRE SQL script
4. Click **Run**
5. You should see:
   - Messages about dropping policies (if they existed)
   - Messages about creating policies
   - A results table showing 3 policies

## Step 4: Verify Policies Were Created

After running the fix, verify:

1. Go to **Table Editor** → **champions** table
2. Click the **RLS policies** button (top right)
3. You should see 3 policies:
   - ✅ "Users can read own profile" (SELECT)
   - ✅ "Users can update own profile" (UPDATE)
   - ✅ "Users can insert own profile" (INSERT) ← This one fixes your error!

Or run this SQL to check:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'champions';
```

You should see 3 rows.

## Step 5: Test Registration Again

After creating the policies:

1. Go to your registration page: `/champion-register.html`
2. Refresh the page (to clear any cached errors)
3. Fill out the registration form
4. Submit
5. **It should work now!** ✅

## Troubleshooting

### If policies already exist but registration still fails:

Check if the INSERT policy is correct. Run:
```sql
SELECT with_check 
FROM pg_policies 
WHERE tablename = 'champions' 
  AND cmd = 'INSERT';
```

It should show: `(auth.uid() = id)`

If it shows something different, run `fix-champions-rls.sql` again to recreate it.

### If RLS is disabled:

If RLS is not enabled, enable it:
```sql
ALTER TABLE champions ENABLE ROW LEVEL SECURITY;
```

Then run `fix-champions-rls.sql`.

### If you still get errors:

1. Open browser console (F12)
2. Try registering again
3. Look for detailed error messages
4. Share the error message for help

