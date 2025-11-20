# Next Steps After Database Setup

## ✅ Step 1: Verify Database Setup (Quick Check)

Run this in Supabase SQL Editor to verify everything is correct:

```sql
-- Quick verification
SELECT 
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'champions', 'panels', 'indicators', 'votes', 
    'comments', 'reviews', 'accepted_reviews', 
    'admin_actions', 'invitations'
  )
ORDER BY tablename;
```

You should see all 9 tables with RLS enabled.

**Or run the full verification:**
- Open `verify-database-setup.sql` from your project
- Copy and paste into SQL Editor
- Run it to see detailed verification

---

## ✅ Step 2: Test Registration

Now test if registration works:

1. **Go to your registration page:**
   - Open `/champion-register.html` on your deployed site
   - Or `http://localhost/champion-register.html` locally

2. **Fill out the registration form:**
   - Enter all required fields
   - Make sure both password fields match
   - Accept all legal agreements
   - Enter your digital signature

3. **Submit the form:**
   - Click "Register as Champion"
   - Should create user in `auth.users`
   - Should create profile in `champions` table ✅

4. **Verify in Supabase:**
   - Go to **Authentication** → **Users**
   - Check if your email appears ✅
   - Go to **Table Editor** → **champions**
   - Check if your profile appears ✅

---

## ✅ Step 3: Test Login

After successful registration:

1. **Go to login page:**
   - Open `/champion-login.html`
   - Or use the "Sign in" link from registration

2. **Log in:**
   - Enter your email and password
   - Click "Sign In"
   - Should redirect to dashboard ✅

3. **Verify login:**
   - Should see champion dashboard
   - Should see your name/profile info
   - Navigation should show "Rankings" and "Logout" buttons

---

## ✅ Step 4: Make Yourself Admin (Optional)

If you want to access the admin review page:

### Option 1: Via Supabase Dashboard (Easiest)

1. **Go to Supabase** → **Table Editor** → **champions**
2. **Find your profile** (by email)
3. **Edit the row:**
   - Find the `is_admin` column
   - Set it to `true` (check the checkbox)
4. **Save** the row

### Option 2: Via SQL Editor

Run this SQL (replace with your email):

```sql
UPDATE champions
SET is_admin = true
WHERE email = 'your-email@example.com';
```

5. **Verify it worked:**
```sql
SELECT email, first_name, last_name, is_admin 
FROM champions 
WHERE email = 'your-email@example.com';
```

Should show `is_admin = true` ✅

6. **Refresh your session:**
   - **Log out** of your application
   - **Log back in** (to refresh your session)
   - Now you should have admin access ✅

---

## ✅ Step 5: Test Admin Access

After making yourself admin and logging back in:

1. **Go to admin review page:**
   - Navigate to `/admin-review.html`
   - Should load without redirect ✅

2. **Verify admin features:**
   - Should see "Admin Review Interface"
   - Should see stats (pending, accepted, deleted reviews)
   - Should see filters and search

---

## ✅ Step 6: Test Other Features

### Test Dashboard

1. **Go to champion dashboard:**
   - `/champion-dashboard.html`
   - Should show your profile info
   - Should show participation stats

### Test Panels

1. **Go to panels page:**
   - `/champion-panels.html`
   - Should show available panels
   - Should allow selecting panels to review

### Test Indicators

1. **Go to indicators page:**
   - `/champion-indicators.html?panel=<panel-id>`
   - Should show indicators for a panel
   - Should allow voting and commenting
   - Should allow submitting reviews

---

## ✅ Step 7: Test CRUD Operations

### Create (Registration)
- ✅ User registration creates auth user
- ✅ User registration creates champion profile
- ✅ All fields are saved correctly

### Read (Viewing Data)
- ✅ Can view own profile
- ✅ Can view panels and indicators
- ✅ Can view votes and comments
- ✅ Can view reviews

### Update (Editing)
- ✅ Can update own profile
- ✅ Can update own votes
- ✅ Can update own comments
- ✅ Can update own reviews (if pending)

### Delete (Removing)
- ✅ Can delete own votes
- ✅ Can delete own comments

---

## Troubleshooting

### Issue: Registration fails with RLS error

**Solution:**
- Check that `complete-database-schema.sql` ran successfully
- Verify RLS policies exist (run verification SQL)
- Check browser console (F12) for detailed errors

### Issue: Can't login after registration

**Solution:**
- Verify user exists in `auth.users` (Authentication → Users)
- Verify profile exists in `champions` table
- Check browser console for errors
- Try logging out and back in

### Issue: Admin page redirects

**Solution:**
- Verify `is_admin = true` in champions table
- Log out and log back in (to refresh session)
- Check browser console for errors

### Issue: Can't see data in tables

**Solution:**
- Check RLS policies are correct
- Verify you're logged in
- Check if data was actually inserted (in Supabase dashboard)

---

## Next Steps Summary

1. ✅ **Verify setup** - Run verification SQL
2. ✅ **Test registration** - Register a new user
3. ✅ **Test login** - Log in with registered user
4. ✅ **Make admin** (optional) - Set yourself as admin
5. ✅ **Test admin access** - Access admin review page
6. ✅ **Test features** - Test all pages and CRUD operations

---

## You're All Set! 🎉

Once you complete these steps:
- ✅ Registration works
- ✅ Login works
- ✅ All CRUD operations work
- ✅ Admin features work
- ✅ All data persists in Supabase

Your database is fully functional and ready for use!

