# Seed Data Instructions

## Problem
The panels page shows "No panels found" because the `panels` and `indicators` tables in Supabase are empty.

## Solution
Run the seed script to populate initial data.

## Steps

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar

2. **Run the Seed Script**
   - Open the file `seed-panels-indicators.sql`
   - Copy all the contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

3. **Verify the Data**
   - After running, you should see messages like:
     - "Panels inserted: 14"
     - "Indicators inserted: 50" (or similar count)
   - You can also verify by running:
     ```sql
     SELECT COUNT(*) FROM panels;
     SELECT COUNT(*) FROM indicators;
     ```

4. **Test the Application**
   - Refresh your panels page (`/champion-panels.html`)
   - You should now see all 14 ESG panels displayed
   - Click on any panel to see its indicators

## What the Seed Script Does

- Inserts 14 ESG panels (Climate & GHG Emissions, Energy & Resource Efficiency, etc.)
- Inserts ~50 indicators across all panels
- Uses `ON CONFLICT DO NOTHING` so it's safe to run multiple times

## Notes

- The script is idempotent - you can run it multiple times without creating duplicates
- If you need to reset the data, you can delete all rows first:
  ```sql
  DELETE FROM indicators;
  DELETE FROM panels;
  ```
  Then run the seed script again.

