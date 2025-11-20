# Quick Start: Which SQL Files to Run

## ⚠️ IMPORTANT: Only Run `.sql` Files in SQL Editor

- ✅ **DO RUN**: Files ending in `.sql` (these are SQL scripts)
- ❌ **DON'T RUN**: Files ending in `.md` (these are documentation/instructions)

## Current Task: Populate Panels and Indicators

To fix the "No panels found" error on the panels page:

1. **Open Supabase SQL Editor**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" in the left sidebar

2. **Open the SQL file** (NOT the .md file)
   - Open `seed-panels-indicators.sql` in your code editor
   - Copy ALL the contents (it starts with `-- Seed script to populate panels...`)

3. **Paste and Run**
   - Paste into the Supabase SQL Editor
   - Click "Run" button (or press Ctrl+Enter / Cmd+Enter)

4. **Expected Result**
   - You should see: "Panels inserted: 14"
   - You should see: "Indicators inserted: 50" (or similar)

## If You Haven't Set Up the Database Yet

If you get errors about tables not existing, run this first:

1. Run `complete-database-schema.sql` (creates all tables, RLS policies, etc.)
2. Then run `seed-panels-indicators.sql` (populates the data)

## File Types Explained

- **`.sql` files** = SQL code to run in Supabase SQL Editor
- **`.md` files** = Documentation/instructions (read these, don't run them)

