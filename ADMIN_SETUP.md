# Admin Review Page Setup Guide

## Accessing the Admin Review Page

The admin review page is accessible at:
- **URL**: `/admin-review.html`
- **Full URL**: `https://your-domain.vercel.app/admin-review.html`

⚠️ **Note**: The page requires admin privileges. If you're not an admin, you'll be redirected.

---

## Step 1: Run Admin Schema SQL

1. Go to your Supabase dashboard: https://app.supabase.com/project/ujcqgtavfffgkklyifdu
2. Click **SQL Editor** → **New Query**
3. Open the file `supabase-admin-schema.sql` from this project
4. Copy and paste the entire SQL into the editor
5. Click **Run**

This will:
- Add `status` column to reviews table
- Create `admin_actions` table
- Add `is_admin` column to champions table
- Create `accepted_reviews` table
- Create helper functions for accepting/deleting reviews

---

## Step 2: Grant Admin Privileges to Your User

After running the admin schema, you need to set yourself as an admin:

### Option A: Using Supabase Dashboard (Easiest)

1. Go to Supabase dashboard → **Table Editor** → **champions**
2. Find your champion profile (by email)
3. Click to edit the row
4. Set `is_admin` to `true`
5. Click **Save**

### Option B: Using SQL Editor

1. Go to **SQL Editor** → **New Query**
2. Run this SQL (replace `YOUR_EMAIL@example.com` with your actual email):

```sql
-- Make your user an admin
UPDATE champions
SET is_admin = true
WHERE email = 'YOUR_EMAIL@example.com';
```

Or if you know your user ID:

```sql
-- Make user an admin by ID
UPDATE champions
SET is_admin = true
WHERE id = 'YOUR_USER_ID_HERE';
```

To find your user ID:
1. Go to **Authentication** → **Users** in Supabase dashboard
2. Find your email
3. Copy the UUID (user ID)

### Option C: Make Yourself Admin When Registering (Development)

If you're testing and want to make the first user an admin automatically, you can modify the registration to set `is_admin = true` for testing purposes. (Remove this in production!)

---

## Step 3: Access the Admin Page

1. **Make sure you're logged in** as the admin user
2. Navigate to `/admin-review.html` or use the direct URL
3. You should see the Admin Review Interface

---

## What the Admin Page Does

The admin review page allows you to:
- ✅ View all indicator reviews submitted by champions
- ✅ Filter reviews by status (pending, accepted, deleted)
- ✅ Filter by panel category (Environmental, Social, Governance)
- ✅ Search reviews by champion or indicator
- ✅ Accept reviews (moves them to rankings)
- ✅ Delete reviews
- ✅ View review statistics (pending, accepted, deleted, total)

---

## Troubleshooting

**Issue: "Access denied. Admin privileges required."**
- Make sure you've run the `supabase-admin-schema.sql` script
- Check that your user has `is_admin = true` in the champions table
- Make sure you're logged in with the correct account

**Issue: Page loads but shows "No reviews found"**
- This is normal if no champions have submitted reviews yet
- Test by submitting a review from a champion account first

**Issue: Can't update `is_admin` in Table Editor**
- Make sure you've run the admin schema SQL
- The `is_admin` column should exist in the champions table
- Try refreshing the Table Editor page

**Issue: Still redirected even after setting admin**
- Clear your browser cache and cookies
- Log out and log back in
- Check that you're logged in with the correct account (check email)

---

## Security Notes

⚠️ **Important**: 
- Only grant admin privileges to trusted users
- Admin users can accept/delete reviews, which affects the rankings page
- Consider adding additional admin verification in production
- The `is_admin` flag is checked server-side via Row Level Security (RLS)

---

## Testing Admin Access

1. **Create a test champion account** (if you don't have one)
2. **Set yourself as admin** (follow Step 2 above)
3. **Log in** as the admin user
4. **Navigate to** `/admin-review.html`
5. You should see the admin interface without being redirected

---

## Next Steps

After setting up admin access:
1. Test accepting/deleting reviews
2. Check that accepted reviews appear on the ranking page
3. Set up proper RLS policies for admin-only access (already included in the admin schema)

