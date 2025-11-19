# GitHub to Supabase Deployment Guide

## 🚀 Easiest Deployment Options

### Option 1: Vercel (Recommended - Easiest)
**Why**: Free, automatic deployments, perfect for static sites, built-in environment variables

### Option 2: Netlify
**Why**: Free, easy setup, good for static sites, environment variables support

### Option 3: Supabase Hosting (If Available)
**Why**: Native integration, but may have limitations

---

## 📋 Step-by-Step: Vercel Deployment (Recommended)

### Step 1: Prepare Your Repository

1. **Create `.gitignore`** (if you don't have one):
```gitignore
# Environment variables
.env
.env.local
.env.production

# Supabase config (if you want to keep credentials out)
# supabase-config.js

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

2. **Create `vercel.json`** for configuration:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### Step 2: Update Supabase Config for Environment Variables

Create `supabase-config-env.js` that reads from environment variables:

```javascript
// supabase-config-env.js
const SUPABASE_CONFIG = {
  url: window.SUPABASE_URL || 'YOUR_SUPABASE_URL',
  anonKey: window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
};

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { supabaseClient, SUPABASE_CONFIG };
}
```

### Step 3: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - STIF website with Supabase integration"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/stif-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: `./` (or leave default)
   - Build Command: (leave empty for static site)
   - Output Directory: `./` (or leave default)

5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     - `SUPABASE_URL` = Your Supabase project URL
     - `SUPABASE_ANON_KEY` = Your Supabase anon key

6. **Deploy!**
   - Click "Deploy"
   - Wait 1-2 minutes
   - Your site will be live!

### Step 5: Update HTML Files to Use Environment Variables

Update your HTML files to inject environment variables:

**Option A: Use Vercel's built-in environment variables**

Create a small script that runs at build time, or use Vercel's `@vercel/static-build` with a build script.

**Option B: Use a simple config loader (Easier)**

Update `supabase-config.js` to check for environment variables first:

```javascript
// supabase-config.js
// This will work in both local and production
const SUPABASE_CONFIG = {
  url: import.meta.env?.VITE_SUPABASE_URL || 
       window.SUPABASE_URL || 
       'YOUR_SUPABASE_URL',
  anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || 
           window.SUPABASE_ANON_KEY || 
           'YOUR_SUPABASE_ANON_KEY'
};

// ... rest of config
```

**Option C: Use a build script (Recommended for production)**

Create `build-config.js` that generates the config file with environment variables.

---

## 📋 Step-by-Step: Netlify Deployment

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Netlify

1. **Go to [netlify.com](https://netlify.com)** and sign up/login
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Configure Build Settings**:
   - Build command: (leave empty)
   - Publish directory: `./` (or leave default)

5. **Add Environment Variables**:
   - Go to Site settings → Environment variables
   - Add:
     - `SUPABASE_URL` = Your Supabase project URL
     - `SUPABASE_ANON_KEY` = Your Supabase anon key

6. **Deploy!**

### Step 3: Create `netlify.toml` (Optional)

```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔐 Secure Configuration Approach

### Recommended: Use Environment Variables in Production

1. **Keep `supabase-config.js` for local development** with placeholder values
2. **Use environment variables in production** via your hosting platform
3. **Create a build script** that injects environment variables

### Create `inject-config.js`:

```javascript
// inject-config.js - Run this during build
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const configContent = `// Supabase Configuration (Auto-generated)
// DO NOT EDIT - This file is generated from environment variables

const SUPABASE_CONFIG = {
  url: '${supabaseUrl}',
  anonKey: '${supabaseKey}'
};

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { supabaseClient, SUPABASE_CONFIG };
}
`;

fs.writeFileSync('supabase-config.js', configContent);
console.log('✅ Supabase config generated from environment variables');
```

### Update `package.json`:

```json
{
  "name": "stif-website",
  "version": "1.0.0",
  "scripts": {
    "build": "node inject-config.js",
    "deploy": "npm run build && vercel --prod"
  },
  "devDependencies": {
    "vercel": "^28.0.0"
  }
}
```

---

## 🎯 Quick Setup Checklist

### For Vercel:
- [ ] Push code to GitHub
- [ ] Sign up for Vercel
- [ ] Import GitHub repository
- [ ] Add environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] Deploy
- [ ] Update domain (optional)

### For Netlify:
- [ ] Push code to GitHub
- [ ] Sign up for Netlify
- [ ] Import GitHub repository
- [ ] Add environment variables
- [ ] Deploy
- [ ] Update domain (optional)

---

## 🔄 Continuous Deployment

Both Vercel and Netlify automatically deploy when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Automatic deployment happens!
```

---

## 📝 Environment Variables Setup

### In Vercel:
1. Go to Project → Settings → Environment Variables
2. Add:
   - `SUPABASE_URL` (Production, Preview, Development)
   - `SUPABASE_ANON_KEY` (Production, Preview, Development)

### In Netlify:
1. Go to Site settings → Environment variables
2. Add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

---

## 🛠️ Alternative: Simple Approach (No Build Step)

If you want the simplest setup without build scripts:

1. **Keep your current `supabase-config.js`** with your actual credentials
2. **Add it to `.gitignore`** to keep it out of GitHub
3. **Manually upload it** after deployment, OR
4. **Use a separate config file** that you update manually in production

**Note**: This is less secure but simpler for quick deployment.

---

## 🚀 Recommended File Structure

```
your-repo/
├── .gitignore
├── vercel.json (or netlify.toml)
├── package.json (optional)
├── inject-config.js (optional)
├── supabase-config.js (local dev)
├── supabase-config-env.js (production)
├── index.html
├── styles.css
├── *.html (all your pages)
└── *.js (all your scripts)
```

---

## ✅ Testing Your Deployment

1. **Check your live URL** (provided by Vercel/Netlify)
2. **Test authentication** - Try logging in
3. **Test database operations** - Submit a review
4. **Check browser console** for any errors
5. **Verify environment variables** are working

---

## 🔧 Troubleshooting

### Issue: "Supabase client not initialized"
**Solution**: Check that environment variables are set correctly in your hosting platform

### Issue: CORS errors
**Solution**: Add your deployment URL to Supabase dashboard → Settings → API → Allowed origins

### Issue: Environment variables not working
**Solution**: 
- Verify variable names match exactly
- Redeploy after adding variables
- Check variable scope (Production/Preview/Development)

---

## 📚 Next Steps

1. **Custom Domain**: Add your own domain in Vercel/Netlify settings
2. **SSL Certificate**: Automatically provided by both platforms
3. **Analytics**: Enable in platform settings
4. **Preview Deployments**: Test changes before production

---

**Recommended**: Start with **Vercel** - it's the easiest and most straightforward for static sites with Supabase!

