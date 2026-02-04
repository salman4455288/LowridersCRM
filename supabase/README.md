# Supabase Database Setup

## Quick Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor
4. Run the SQL below

## SQL Schema

Copy and paste this entire SQL script into your Supabase SQL Editor and click "Run":

```sql
-- See the schema.sql file in this directory for the complete SQL script
```

The complete SQL script is in the `schema.sql` file in this same directory.

## What This Creates

- **6 tables**: customers, sales, tasks, interactions, notes, activities
- **Row Level Security (RLS)**: Users can only see their own data
- **Indexes**: For better query performance
- **Triggers**: Auto-update timestamps

## After Running the SQL

1. Go to Supabase Dashboard → Table Editor
2. You should see 6 tables listed
3. All tables should show "RLS enabled" badge
4. Your database is ready!

## Getting Your API Keys

1. Go to Settings → API
2. Copy:
   - **Project URL**: Use as `VITE_SUPABASE_URL`
   - **anon public key**: Use as `VITE_SUPABASE_ANON_KEY`

## Testing the Connection

After deployment, try to:
1. Sign up with a new account
2. Add a customer
3. Add a sale
4. Check the Supabase Table Editor to see your data

If you see data in Supabase after creating it in the app, your setup is successful! ✅

## Troubleshooting

### "relation does not exist" error
- You didn't run the schema.sql file
- Run the complete SQL script again

### "permission denied" error
- RLS policies might not be set up
- Re-run the entire schema.sql script

### Can't see data after creating it
- RLS policies are working correctly
- You need to be logged in with the same user who created the data
- Check Supabase → Authentication → Users to verify your user exists

## Optional: Sample Data

After signing up in your app, you can add sample data manually:

1. Go to Supabase → Table Editor
2. Select the "customers" table
3. Click "Insert row"
4. Make sure to use your user_id (from auth.users table)
5. Fill in the customer details
6. Click "Save"

This is useful for testing!
