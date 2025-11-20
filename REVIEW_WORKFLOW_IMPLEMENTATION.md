# Review Workflow Implementation Guide

## Overview
This document describes the complete review workflow system that has been implemented.

## Workflow Steps

### 1. Champion Submits Review
- Champion fills out review form on `champion-indicators.html`
- Reviews are saved to Supabase `reviews` table with `status = 'pending'`
- Champion sees confirmation: "Your reviews are now pending admin approval"

### 2. Admin Reviews Pending Queue
- Admin accesses `admin-review.html`
- **Default view shows "Pending Reviews"** (status filter set to 'pending')
- Each review card displays:
  - Champion name and organization
  - Panel and indicator information
  - Submission date
  - Review data (necessary, rating, comments)
  - **Votes count and list** (up/down/neutral votes from other champions)
  - **Comments count and preview** (recent comments from other champions)

### 3. Admin Actions

#### Accept Review
- Admin clicks "Accept" button
- Confirmation modal appears
- On confirm:
  - Review status updated to `'accepted'`
  - Review copied to `accepted_reviews` table
  - Admin action recorded in `admin_actions` table
  - **Notification created** for champion: "Your review has been accepted"
  - Review appears on ranking page
  - Champion dashboard updated

#### Delete/Reject Review
- Admin clicks "Delete" button
  - Confirmation modal appears
  - On confirm:
    - Review **permanently deleted** from database
    - Admin action recorded in `admin_actions` table
    - **Notification created** for champion: "Your review has been rejected"
    - No record saved (completely removed)

### 4. Champion Notifications
- Notifications stored in `notifications` table
- Types: `review_accepted`, `review_rejected`, `review_pending`
- Displayed on champion dashboard
- Can be marked as read
- Unread count shown

### 5. Champion Dashboard Updates
- Shows review status for each submitted review:
  - **Pending**: Awaiting admin approval
  - **Accepted**: Review approved and in rankings
  - **Rejected**: Review was rejected (if still visible)
- Shows notifications with unread count
- Links to view full notification details

## Database Schema

### Tables Used
1. **reviews** - Stores all submitted reviews with status
2. **accepted_reviews** - Stores approved reviews for rankings
3. **admin_actions** - Tracks admin accept/delete actions
4. **notifications** - Stores champion notifications
5. **votes** - Champion votes on indicators
6. **comments** - Champion comments on indicators

### Key Columns
- `reviews.status`: 'pending', 'accepted', 'deleted'
- `notifications.type`: 'review_accepted', 'review_rejected', 'review_pending'
- `notifications.read`: Boolean flag for read/unread

## Files Modified/Created

### SQL Scripts
- `add-notifications-table.sql` - Creates notifications table and updates functions

### JavaScript Files
- `champion-indicators.js` - Updated to save reviews with 'pending' status
- `admin-review.js` - Updated to:
  - Default to pending reviews
  - Display votes and comments
  - Handle accept/reject with notifications
- `supabase-service.js` - Added notifications methods
- `champion-dashboard.js` - (To be updated) Show review status and notifications

## Setup Instructions

### Step 1: Run SQL Script
Run `add-notifications-table.sql` in Supabase SQL Editor:
- Creates notifications table
- Updates accept_review function to create notifications
- Updates delete_review function to create notifications

### Step 2: Test the Workflow
1. **As Champion:**
   - Submit a review on champion-indicators.html
   - Check dashboard for "Pending" status

2. **As Admin:**
   - Go to admin-review.html
   - See review in "Pending Reviews" queue
   - See votes and comments displayed
   - Accept or reject the review

3. **As Champion:**
   - Check dashboard for notification
   - See updated review status

## Features Implemented

✅ Pending Review Queue (default view)
✅ Display champion name, panel, indicator, votes, comments, submission date
✅ Accept review functionality
✅ Delete/Reject review functionality
✅ Notifications system
✅ Review status tracking
✅ Votes and comments display in admin view

## Features To Complete

- [ ] Update champion dashboard to show review status
- [ ] Update champion dashboard to show notifications
- [ ] Add notification bell/indicator in navigation
- [ ] Add review status badges on dashboard
- [ ] Ensure consistent navigation across all pages

## Next Steps

1. Update `champion-dashboard.js` to:
   - Fetch and display reviews with status
   - Fetch and display notifications
   - Show unread notification count

2. Add notification UI component to:
   - Navigation bar (notification bell)
   - Dashboard (notifications list)

3. Test complete workflow end-to-end

