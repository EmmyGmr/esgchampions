# Quick Guide: Access Admin Review Page

## Steps to Get Admin Access

### Step 1: Make Yourself Admin in Supabase

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run the Admin SQL Script**
   - Open `make-admin.sql` in your code editor
   - Copy the SQL code
   - **IMPORTANT**: Replace `'YOUR_EMAIL@example.com'` with your actual email address
   - Paste into Supabase SQL Editor
   - Click "Run"

   Example (replace with your email):
   ```sql
   UPDATE champions
   SET is_admin = true
   WHERE email = 'umukoroemmanuel6829@gmail.com';
   ```

3. **Verify You're Admin**
   - After running, you should see a result showing your user with `is_admin = true`
   - Or run this to check:
   ```sql
   SELECT id, email, first_name, last_name, is_admin 
   FROM champions 
   WHERE email = 'your-email@example.com';
   ```

### Step 2: Refresh Your Session

**IMPORTANT**: After setting `is_admin = true`, you MUST log out and log back in for the change to take effect.

1. Click "Logout" in the application
2. Log back in with your credentials
3. This refreshes your session with the new admin status

### Step 3: Access Admin Review Page

1. Navigate to: `admin-review.html`
   - You can type it in the URL: `your-domain.com/admin-review.html`
   - Or add a link in your navigation (if you want)

2. The page should load without the "Access denied" message

## Troubleshooting

### "Access denied" message still appears

1. **Check you're logged in**: Make sure you're logged in with the same email you set as admin
2. **Verify is_admin is true**: Run the verification SQL again to confirm
3. **Log out and back in**: The session needs to refresh to pick up the admin status
4. **Check browser console**: Open Developer Tools (F12) and check for any errors

### "is_admin column does not exist" error

If you see this error, the column hasn't been added yet. Run this in SQL Editor:

```sql
ALTER TABLE champions 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_champions_is_admin ON champions(is_admin);
```

### Can't find your email in champions table

1. Make sure you've registered and logged in at least once
2. Check your email in the champions table:
   ```sql
   SELECT * FROM champions WHERE email = 'your-email@example.com';
   ```

## Quick SQL Commands

**Set yourself as admin (replace email):**
```sql
UPDATE champions SET is_admin = true WHERE email = 'your-email@example.com';
```

**Check if you're admin:**
```sql
SELECT email, is_admin FROM champions WHERE email = 'your-email@example.com';
```

**List all admins:**
```sql
SELECT email, first_name, last_name, is_admin FROM champions WHERE is_admin = true;
```

## What the Admin Review Page Does

Once you have access, the admin-review page allows you to:
- View all champion reviews
- Accept or reject reviews
- Filter reviews by status, panel, champion
- Manage the review workflow

