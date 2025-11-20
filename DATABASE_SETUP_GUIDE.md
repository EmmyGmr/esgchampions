# Complete Database Setup Guide

## Overview

This guide will help you set up the complete database schema from scratch after deleting all tables in Supabase.

## Quick Start

### Step 1: Run the Complete Schema SQL

1. **Go to Supabase Dashboard:**
   - Navigate to https://app.supabase.com/project/ujcqgtavfffgkklyifdu
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Run the Complete Schema:**
   - Open the file `complete-database-schema.sql` from your project
   - Copy the **entire contents** of the file
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter / Cmd+Enter)

3. **Wait for Completion:**
   - The script will create all tables, indexes, RLS policies, functions, and triggers
   - You should see a success message at the end

### Step 2: Verify Setup

After running the SQL, verify everything was created:

1. **Check Tables:**
   - Go to **Table Editor** in Supabase dashboard
   - You should see 9 tables:
     - ✅ `champions` - User profiles
     - ✅ `panels` - ESG panel categories
     - ✅ `indicators` - ESG indicators
     - ✅ `votes` - Champion votes
     - ✅ `comments` - Champion comments
     - ✅ `reviews` - Project submissions/reviews
     - ✅ `accepted_reviews` - Approved reviews for rankings
     - ✅ `admin_actions` - Admin review tracking
     - ✅ `invitations` - Panel invitations

2. **Check RLS Policies:**
   - Click on any table (e.g., `champions`)
   - Click the **RLS policies** button (top right)
   - You should see policies listed for each table

3. **Run Verification Query:**
   - Go to **SQL Editor** → **New Query**
   - Run this query:
   ```sql
   SELECT 
     tablename,
     COUNT(*) as "Policy Count"
   FROM pg_policies 
   WHERE schemaname = 'public'
   GROUP BY tablename
   ORDER BY tablename;
   ```
   - You should see policies for all 9 tables

### Step 3: Make Yourself Admin (Optional)

After registering your first account, make yourself admin:

1. **Register an account** through the registration page
2. **Go to Supabase** → **Table Editor** → **champions**
3. **Find your profile** (by email)
4. **Edit the row** and set `is_admin` to `true`
5. **Save**

Or use SQL:
```sql
UPDATE champions
SET is_admin = true
WHERE email = 'your-email@example.com';
```

## What's Included

### Tables Created

1. **champions** - User profiles with:
   - Basic information (name, email, organization, role)
   - Contact details (mobile, office phone, LinkedIn, website)
   - Professional info (competence, contributions, sector, expertise panels)
   - Legal agreements (CLA, NDA, terms, IP policy)
   - Digital signatures
   - Admin flag

2. **panels** - ESG panel categories:
   - Environmental, Social, Governance panels
   - Descriptions, purposes, frameworks

3. **indicators** - ESG indicators:
   - Linked to panels
   - Titles, descriptions, validation questions

4. **votes** - Champion votes on indicators:
   - Up/down/neutral votes
   - One vote per champion per indicator

5. **comments** - Champion comments on indicators:
   - Free-text comments
   - Timestamped

6. **reviews** - Project submissions/reviews:
   - Necessary ratings (yes/no/not-sure)
   - Rating (0-5 stars)
   - Comments
   - Status (pending/accepted/deleted)

7. **accepted_reviews** - Approved reviews for rankings:
   - Only accepted reviews appear here
   - Links to rankings page

8. **admin_actions** - Admin review tracking:
   - Logs all admin actions (accept/delete)
   - Notes and timestamps

9. **invitations** - Panel invitations:
   - Champion-to-champion invitations
   - Status tracking

### RLS Policies Configured

✅ **Champions:**
- Anyone can read profiles (for rankings)
- Users can insert their own profile (registration)
- Users can update their own profile

✅ **Panels & Indicators:**
- Authenticated users can read all

✅ **Votes:**
- Anyone can read votes
- Users can insert/update/delete their own votes

✅ **Comments:**
- Anyone can read comments
- Users can insert/update/delete their own comments

✅ **Reviews:**
- Anyone can read reviews
- Users can insert/update their own reviews (if pending)

✅ **Accepted Reviews:**
- Anyone can read accepted reviews
- Only admins can insert

✅ **Admin Actions:**
- Only admins can view/insert

✅ **Invitations:**
- Users can view invitations sent to them or sent by them
- Users can insert/update invitations they sent

### Functions Created

1. **accept_review()** - Admin function to accept a review
2. **delete_review()** - Admin function to delete a review
3. **update_updated_at_column()** - Auto-update timestamps

### Indexes Created

- Email indexes for fast lookups
- Foreign key indexes for joins
- Status indexes for filtering
- Timestamp indexes for sorting

## Testing the Setup

### Test 1: Registration

1. Go to `/champion-register.html`
2. Fill out the registration form
3. Submit
4. Should create user in `auth.users` and profile in `champions` table ✅

### Test 2: Login

1. Go to `/champion-login.html`
2. Use the email/password you registered with
3. Should log in successfully ✅

### Test 3: Admin Access

1. Make yourself admin (follow Step 3 above)
2. Log out and log back in
3. Go to `/admin-review.html`
4. Should have access (no redirect) ✅

### Test 4: CRUD Operations

1. **Create:** Register a new user → Should work
2. **Read:** View champion profiles → Should work
3. **Update:** Update your profile → Should work
4. **Delete:** Delete your own vote/comment → Should work

## Troubleshooting

### Issue: "new row violates row-level security policy"

**Solution:**
- Make sure you ran the complete schema SQL
- Verify RLS policies exist (check `pg_policies` table)
- The INSERT policy for champions should have `WITH CHECK (auth.uid() = id)`

### Issue: Registration works but profile not created

**Solution:**
- Check browser console (F12) for errors
- Verify RLS policies are correct
- Check if auth user was created (Authentication → Users)

### Issue: Can't access admin page

**Solution:**
- Verify you set `is_admin = true` in champions table
- Log out and log back in after setting admin flag
- Check browser console for errors

### Issue: Tables not showing up

**Solution:**
- Refresh the Table Editor page
- Check if you ran the complete SQL script
- Verify there were no errors in SQL Editor

## Next Steps

After setup:

1. ✅ **Seed Initial Data** (optional):
   - You may want to add initial panels and indicators
   - Check `seed-data-script.js` for example data

2. ✅ **Test All Features:**
   - Registration ✅
   - Login ✅
   - Dashboard ✅
   - Panels ✅
   - Indicators ✅
   - Reviews ✅
   - Admin Review ✅

3. ✅ **Configure Email** (optional):
   - Set up email confirmation if needed
   - Configure email templates

## Support

If you encounter any issues:

1. Check browser console (F12) for errors
2. Check Supabase dashboard for errors
3. Verify RLS policies are correct
4. Review the troubleshooting section above

---

**✅ Database setup complete! All tables, policies, and functions are ready for use.**

