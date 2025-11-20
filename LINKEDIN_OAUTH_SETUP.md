# LinkedIn OAuth Setup Guide

This guide will help you configure LinkedIn OAuth 2.0 authentication in your Supabase project.

## Prerequisites

- A Supabase project
- A LinkedIn Developer account
- Access to your Supabase dashboard

## Step 1: Create a LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Sign in with your LinkedIn account
3. Click **"Create app"**
4. Fill in the required information:
   - **App name**: Your app name (e.g., "STIF ESG Champions")
   - **LinkedIn Page**: Select or create a LinkedIn page for your organization
   - **Privacy Policy URL**: Your privacy policy URL
   - **App logo**: Upload your app logo (optional)
5. Click **"Create app"**

## Step 2: Configure LinkedIn App Settings

1. In your LinkedIn app dashboard, go to the **"Auth"** tab
2. Under **"Redirect URLs"**, add your Supabase redirect URL:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   Replace `[YOUR_PROJECT_REF]` with your Supabase project reference (found in your Supabase project URL)
   
   Example:
   ```
   https://ujcqgtavfffgkklyifdu.supabase.co/auth/v1/callback
   ```

3. Under **"Products"**, request access to:
   - **Sign In with LinkedIn using OpenID Connect** (recommended)
   - Or **Sign In with LinkedIn** (legacy)

4. Note down your **Client ID** and **Client Secret** from the **"Auth"** tab

## Step 3: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **LinkedIn** in the list of providers
5. Enable LinkedIn provider
6. Enter your LinkedIn **Client ID** and **Client Secret**
7. Click **"Save"**

## Step 4: Configure OAuth Scopes

The implementation requests the following scopes:
- `r_liteprofile` - Basic profile information
- `r_emailaddress` - Email address

These are configured in the code. If you need additional permissions, you can modify the `scopes` parameter in `supabase-service.js`:

```javascript
scopes: 'r_liteprofile r_emailaddress'
```

## Step 5: Test the Integration

1. Go to your login page: `champion-login.html`
2. Click the **"Continue with LinkedIn"** button
3. You should be redirected to LinkedIn's authorization page
4. After authorizing, you'll be redirected back to your app
5. The system will automatically:
   - Create or update the user account
   - Create or update the champion profile
   - Redirect to the dashboard

## How It Works

### Authentication Flow

1. **User clicks "Continue with LinkedIn"**
   - The app initiates OAuth flow via `SupabaseService.signInWithLinkedIn()`
   - User is redirected to LinkedIn authorization page

2. **User authorizes on LinkedIn**
   - LinkedIn redirects back to your app with an authorization code
   - Supabase exchanges the code for an access token

3. **OAuth Callback Handling**
   - `champion-auth-supabase.js` detects the OAuth callback
   - `SupabaseService.handleOAuthCallback()` processes the callback
   - User profile is created or updated in the database

4. **Profile Creation/Update**
   - If user exists (matched by email): profile is updated with LinkedIn data
   - If user is new: new champion profile is created
   - User is redirected to dashboard

### Data Stored

The following LinkedIn data is stored in the champion profile:
- **Email**: From LinkedIn account
- **First Name**: From LinkedIn profile
- **Last Name**: From LinkedIn profile
- **LinkedIn ID**: LinkedIn user identifier
- **LinkedIn Profile URL**: (if available)

## Troubleshooting

### "Redirect URI mismatch" Error

- Ensure the redirect URL in LinkedIn app matches exactly: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
- Check for trailing slashes or typos

### "Invalid client credentials" Error

- Verify Client ID and Client Secret in Supabase dashboard
- Ensure they match the values from LinkedIn app dashboard

### User Not Created in Database

- Check Supabase logs for errors
- Verify RLS policies allow INSERT/UPDATE on champions table
- Check that the database trigger for creating champion profiles is working

### Email Not Available

- Ensure you've requested `r_emailaddress` scope
- Some LinkedIn accounts may not have email addresses available
- The system will use the email from the auth user if LinkedIn email is unavailable

## Security Considerations

1. **Client Secret**: Never expose your LinkedIn Client Secret in client-side code
2. **Redirect URLs**: Only add trusted redirect URLs in LinkedIn app settings
3. **HTTPS**: Always use HTTPS in production
4. **Session Management**: Supabase handles session tokens securely

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-linkedin)
- [LinkedIn OAuth Documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Supabase Auth Helpers](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in the dashboard
3. Verify LinkedIn app configuration
4. Ensure all redirect URLs are correctly configured

