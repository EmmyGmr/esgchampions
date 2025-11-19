# Supabase Integration Setup Guide

## ✅ Configuration Complete!

Your Supabase credentials have been configured in `supabase-config.js`.

**Your Supabase Project:**
- URL: `https://ujcqgtavfffgkklyifdu.supabase.co`
- Anon Key: Configured ✅

---

## Step 1: Set Up Database Schema

**IMPORTANT:** You need to create the database tables before the app will work.

1. Go to your Supabase dashboard: https://app.supabase.com/project/ujcqgtavfffgkklyifdu
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase-schema.sql` from this project
5. Copy the **entire contents** of the file
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

This will create all the necessary tables:
- `champions` - User profiles
- `panels` - ESG panels
- `indicators` - ESG indicators
- `votes` - User votes on indicators
- `comments` - User comments
- `reviews` - Admin reviews
- `invitations` - Panel invitations

---

## Step 2: Set Up Row Level Security (RLS)

After creating the tables, you need to enable Row Level Security:

1. In Supabase dashboard, go to **Authentication** → **Policies**
2. For each table, create policies to allow:
   - Users to read their own data
   - Users to insert/update their own data
   - Admins to read all data

**Quick RLS Setup SQL** (run in SQL Editor):

```sql
-- Enable RLS on all tables
ALTER TABLE champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own champion profile
CREATE POLICY "Users can read own profile" ON champions
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own champion profile
CREATE POLICY "Users can update own profile" ON champions
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own champion profile
CREATE POLICY "Users can insert own profile" ON champions
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Everyone can read panels and indicators (public data)
CREATE POLICY "Public read panels" ON panels FOR SELECT USING (true);
CREATE POLICY "Public read indicators" ON indicators FOR SELECT USING (true);

-- Policy: Authenticated users can vote
CREATE POLICY "Authenticated users can vote" ON votes
  FOR ALL USING (auth.uid() = champion_id);

-- Policy: Authenticated users can comment
CREATE POLICY "Authenticated users can comment" ON comments
  FOR ALL USING (auth.uid() = champion_id);

-- Policy: Authenticated users can create reviews
CREATE POLICY "Authenticated users can review" ON reviews
  FOR ALL USING (auth.uid() = champion_id);
```

---

## Step 3: Configure Environment Variables (for Vercel)

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `SUPABASE_URL` = `https://ujcqgtavfffgkklyifdu.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY3FndGF2ZmZmZ2trbHlpZmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTE1NzEsImV4cCI6MjA3OTEyNzU3MX0.uYkaG5-XLXbuQP4mwAwn-J09OGB8nOvCvj4Iz7aQ1Y4`
5. Make sure to select **Production**, **Preview**, and **Development** environments
6. Click **Save**
7. Redeploy your site for changes to take effect

---

## Step 4: Seed Initial Data (Optional)

If you want to populate panels and indicators with initial data:

1. Go to Supabase SQL Editor
2. Open `seed-data-script.js` from this project
3. The script contains example data - you can modify it
4. Run the seed script (you may need to adapt it to SQL format)

---

## Files Updated

✅ **Configuration:**
- `supabase-config.js` - Configured with your credentials

✅ **HTML Pages Updated:**
- `champion-register.html` - Uses Supabase auth
- `champion-login.html` - Uses Supabase auth
- `champion-dashboard.html` - Uses Supabase data
- `champion-panels.html` - Uses Supabase data
- `champion-indicators.html` - Uses Supabase data
- `admin-review.html` - Already had Supabase
- `ranking.html` - Already had Supabase

✅ **JavaScript Files Updated:**
- `logout.js` - Supports Supabase logout
- `navigation-auth.js` - Checks Supabase auth status

---

## Testing

1. **Test Registration:**
   - Go to `/champion-register.html`
   - Fill out the form and submit
   - Should create a user in Supabase Auth and a champion profile

2. **Test Login:**
   - Go to `/champion-login.html`
   - Use the credentials you just created
   - Should authenticate and redirect to dashboard

3. **Check Database:**
   - Go to Supabase dashboard → **Table Editor**
   - You should see your champion profile in the `champions` table

---

## Security Notes

- ✅ The `anon` key is safe to use in client-side code
- ⚠️ Never commit your `service_role` key to the repository
- 🔒 Row Level Security (RLS) policies protect your data
- 🔐 Passwords are hashed by Supabase Auth automatically

---

## Troubleshooting

**Issue: "Supabase client not initialized"**
- Make sure Supabase CDN is loaded before `supabase-config.js`
- Check browser console for errors

**Issue: "Failed to create user"**
- Check Supabase dashboard → Authentication → Settings
- Make sure email confirmation is disabled for testing (or check your email)

**Issue: "Permission denied"**
- Check RLS policies are set up correctly
- Verify the user is authenticated

**Issue: "Table does not exist"**
- Make sure you ran the `supabase-schema.sql` script
- Check Supabase dashboard → Table Editor to verify tables exist

