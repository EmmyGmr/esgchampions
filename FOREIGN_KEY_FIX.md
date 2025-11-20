# Fix Foreign Key Constraint Error

## The Error
```
insert or update on table "champions" violates foreign key constraint "champions_id_fkey"
```

## What This Means

The `champions` table has a foreign key constraint:
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id)
```

This means the `id` in champions **must** exist in `auth.users`. The error occurs when:
- The auth user hasn't been created yet
- There's a timing issue between user creation and profile insertion
- Email confirmation is required and user isn't fully created

## Solution: Database Trigger

We'll create a trigger that automatically creates a champion profile when a user is created in `auth.users`. This ensures the foreign key is always satisfied.

### Step 1: Run the Fix SQL

1. **Go to Supabase** → **SQL Editor** → **New Query**
2. **Open** `fix-foreign-key-constraint.sql` from your project
3. **Copy and paste** the entire SQL script
4. **Click Run**

This creates:
- A function `handle_new_user()` that creates champion profile
- A trigger that fires when a new user is created in `auth.users`

### Step 2: Test Registration Again

After running the SQL:

1. **Go to registration page** (`/champion-register.html`)
2. **Fill out the form** and submit
3. **Should work now!** ✅

The trigger will automatically create a basic champion profile when the auth user is created, then the code will update it with all the details.

## How It Works

1. **User signs up** → `supabaseClient.auth.signUp()` creates user in `auth.users`
2. **Trigger fires** → Automatically creates basic champion profile with user ID
3. **Code updates** → Updates the profile with all registration details
4. **Success!** ✅

## Alternative: Disable Email Confirmation

If the trigger doesn't work, you can also:

1. **Go to Supabase** → **Authentication** → **Settings**
2. **Find "Enable email confirmations"**
3. **Disable it** (for testing)
4. **Try registration again**

But the trigger approach is better because it works regardless of email confirmation settings.

## Verify Trigger Was Created

Run this SQL to check:

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Should show the trigger exists.

## Troubleshooting

### Issue: Trigger doesn't fire

**Check:**
- Verify trigger was created (run verification SQL above)
- Check Supabase logs for errors
- Make sure function has `SECURITY DEFINER` (allows it to bypass RLS)

### Issue: Still getting foreign key error

**Solution:**
- Check if auth user was actually created (Authentication → Users)
- Verify the user ID matches what we're trying to insert
- Check browser console for detailed errors

### Issue: Profile created but empty

**Solution:**
- The trigger creates a basic profile
- The code should update it with all details
- If not, check the upsert logic in `supabase-service.js`

