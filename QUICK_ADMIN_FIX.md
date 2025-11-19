# Quick Fix: Add is_admin Column

## Error You're Seeing
```
ERROR: 42703: column champions.is_admin does not exist
```

This means the `is_admin` column hasn't been added to the `champions` table yet.

## Quick Fix (Run This SQL)

1. Go to your Supabase dashboard: https://app.supabase.com/project/ujcqgtavfffgkklyifdu
2. Click **SQL Editor** → **New Query**
3. Copy and paste this SQL:

```sql
-- Add is_admin column to champions table
ALTER TABLE champions 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_champions_is_admin ON champions(is_admin);
```

4. Click **Run**

5. Verify it worked - you should see "Success. No rows returned"

---

## Make Yourself Admin (After Adding Column)

After running the SQL above, make yourself an admin:

### Option 1: Via SQL Editor
```sql
-- Replace YOUR_EMAIL@example.com with your actual email
UPDATE champions
SET is_admin = true
WHERE email = 'YOUR_EMAIL@example.com';
```

### Option 2: Via Table Editor
1. Go to **Table Editor** → **champions**
2. Find your row (by email)
3. Edit and set `is_admin` to `true`
4. Save

---

## Run Full Admin Schema (Recommended)

For full admin functionality, run the complete admin schema:

1. Go to **SQL Editor** → **New Query**
2. Open `supabase-admin-schema.sql` from this project
3. Copy and paste the entire file
4. Click **Run**

This will set up:
- ✅ `is_admin` column
- ✅ `status` column on reviews
- ✅ `admin_actions` table
- ✅ `accepted_reviews` table
- ✅ Admin helper functions

