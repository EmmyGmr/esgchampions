# Dynamic Navigation System Guide

## Overview
A comprehensive role-based navigation system that dynamically shows/hides buttons based on user authentication status and admin privileges.

## Features Implemented

### 1. Admin Navigation Button
- **Visibility**: Only shown to users with `is_admin = true` in the champions table
- **Location**: Appears before Dashboard button (or after Membership if not logged in)
- **Link**: Points to `admin-review.html`
- **Detection**: Uses `AdminService.isAdmin()` to check admin status

### 2. Membership / Dashboard Toggle

#### When User is NOT Logged In:
- ✅ **Membership button** is visible
- ❌ **Dashboard button** is hidden
- Clicking Membership shows modal (Business/ESG Champion options)

#### When User IS Logged In:
- ❌ **Membership button** is hidden
- ✅ **Dashboard button** is visible and links to `champion-dashboard.html`
- Dashboard button remains visible across all pages until logout

### 3. Logout Functionality
- When user logs out:
  - Clears Supabase session
  - Removes localStorage data
  - Dispatches `logout` event
  - Navigation automatically updates to show Membership, hide Dashboard
  - Redirects to login page

### 4. Rankings Button
- Only visible when user is logged in
- Links to `ranking.html`

### 5. Logout Button
- Only visible when user is logged in
- Handles logout with confirmation

## How It Works

### Authentication State Tracking
The system uses multiple methods to track login status:
1. **Primary**: Supabase `auth.getUser()` - checks active session
2. **Fallback**: localStorage `current-champion` or `current-champion-id`

### Admin Status Detection
1. Uses `AdminService.isAdmin()` if available
2. Falls back to direct Supabase query: `champions.is_admin = true`

### Real-time Updates
- Listens to Supabase auth state changes
- Updates navigation automatically when:
  - User logs in
  - User logs out
  - Auth session expires
- Polls every 30 seconds to catch any state changes

## Files Modified

### New Files
- `dynamic-navigation.js` - Main navigation system

### Updated Files
- All HTML files (15 files) - Replaced `navigation-auth.js` with `dynamic-navigation.js`
- `logout.js` - Added logout event dispatch
- `champion-auth-supabase.js` - Added login event dispatch

## Script Loading Order

For proper functionality, scripts must load in this order:
1. Supabase client (`supabase-config.js`)
2. Supabase service (`supabase-service.js`)
3. Admin service (`admin-service.js`) - for admin checks
4. Dynamic navigation (`dynamic-navigation.js`)
5. Logout handler (`logout.js`)

## Button IDs Used

- `membership-btn` - Membership button (existing)
- `dashboard-btn` - Dashboard button (created dynamically)
- `admin-btn` - Admin button (created dynamically)
- `nav-rankings-btn` - Rankings button (created dynamically)
- `logout-btn` - Logout button (created dynamically)

## Testing Checklist

1. **Not Logged In:**
   - [ ] Membership button visible
   - [ ] Dashboard button hidden
   - [ ] Admin button hidden
   - [ ] Rankings button hidden
   - [ ] Logout button hidden

2. **Logged In (Regular User):**
   - [ ] Membership button hidden
   - [ ] Dashboard button visible
   - [ ] Admin button hidden
   - [ ] Rankings button visible
   - [ ] Logout button visible

3. **Logged In (Admin User):**
   - [ ] Membership button hidden
   - [ ] Dashboard button visible
   - [ ] Admin button visible
   - [ ] Rankings button visible
   - [ ] Logout button visible

4. **After Logout:**
   - [ ] Navigation reverts to "not logged in" state
   - [ ] Membership button appears
   - [ ] Dashboard button disappears

5. **Cross-Page Consistency:**
   - [ ] Navigation state consistent across all pages
   - [ ] Buttons appear/disappear correctly on page navigation
   - [ ] No flickering or delay in button visibility

## Troubleshooting

### Admin Button Not Showing
1. Verify user has `is_admin = true` in champions table
2. Check browser console for errors
3. Ensure `admin-service.js` is loaded before `dynamic-navigation.js`
4. Log out and log back in to refresh session

### Dashboard Button Not Showing After Login
1. Check browser console for authentication errors
2. Verify Supabase session is active
3. Check localStorage for `current-champion-id`
4. Refresh the page

### Navigation Not Updating
1. Check browser console for JavaScript errors
2. Verify all scripts are loading in correct order
3. Check that Supabase client is initialized
4. Try hard refresh (Ctrl+F5)

## Browser Compatibility
- Works with all modern browsers
- Uses async/await (ES2017+)
- Uses CustomEvent API (supported in all modern browsers)

