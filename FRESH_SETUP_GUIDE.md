# 🚀 Fresh Supabase Setup Guide

## Step 1: Create New Supabase Project

1. **Go to [supabase.com/dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Project Settings:**
   - Name: `canadian-investment-tracker`
   - Database Password: Choose a strong password (save it!)
   - Region: Canada Central (recommended for Canadian users)
4. **Click "Create new project"**
5. **Wait 1-2 minutes** for project initialization

## Step 2: Get Your New Credentials

1. **Once project is ready, go to Settings > API**
2. **Copy these values:**
   - Project URL (e.g., `https://abcdefgh.supabase.co`)
   - Anon/Public key (starts with `eyJ...`)

## Step 3: Update Environment Variables

Update your `.env` file with the new credentials:

```env
VITE_SUPABASE_URL=https://your-new-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key-here
```

## Step 4: Run Database Migrations

**Go to SQL Editor** in your Supabase dashboard and run these migrations in order:

### Migration 1: Core Schema
Copy and paste the contents of `supabase/migrations/20250629220235_graceful_boat.sql` into the SQL Editor and click "Run".

This creates:
- ✅ All tables (users, accounts, transactions, goals, couples)
- ✅ Proper indexes for performance
- ✅ Row Level Security policies
- ✅ Triggers for updated_at timestamps

### Migration 2: Primary User Field
Copy and paste the contents of `supabase/migrations/20250629225904_plain_forest.sql` into the SQL Editor and click "Run".

This adds:
- ✅ `is_primary` boolean field to users table
- ✅ Proper defaults for existing users

### Migration 3: Sample Data (Optional)
Copy and paste the contents of `supabase/migrations/20250629222635_withered_grass.sql` into the SQL Editor and click "Run".

This adds:
- ✅ Sample users, accounts, and transactions for testing
- ✅ Example couple relationships
- ✅ Sample financial goals

## Step 5: Test Your Application

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test core functionality:**
   - ✅ Sign up for a new account
   - ✅ Add investment accounts (RRSP, TFSA, etc.)
   - ✅ Record transactions
   - ✅ Add spouse/partner (this should now work!)
   - ✅ Switch between user views in the header
   - ✅ Update CRA contribution limits

## Step 6: Verify Everything Works

Check these features:
- [ ] User registration and login
- [ ] Account creation and management
- [ ] Transaction recording and history
- [ ] Spouse/partner addition and management
- [ ] User switching functionality
- [ ] CRA limits configuration
- [ ] Contribution planning tools
- [ ] Data persistence across sessions

## Benefits of Fresh Setup

✅ **Clean Database**: No migration conflicts or policy issues
✅ **Proper RLS**: Correctly configured row-level security from the start
✅ **No Legacy Problems**: Fresh foundation without accumulated issues
✅ **Production Ready**: Proper setup for future deployment
✅ **All Features Working**: Spouse creation, user switching, etc.

## Troubleshooting

If you encounter any issues:

1. **Check Environment Variables**: Ensure `.env` has the correct new values
2. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check Browser Console**: Look for any JavaScript errors
4. **Verify Migrations**: Ensure all migrations ran successfully in SQL Editor
5. **Check Network Tab**: Look for 403 or 500 errors in browser dev tools

## Next Steps

Once everything is working:
1. **Deploy to Production**: Use Netlify or your preferred hosting service
2. **Set Up Monitoring**: Configure error tracking and analytics
3. **Backup Strategy**: Set up regular database backups
4. **Custom Domain**: Configure your custom domain if needed

Your Canadian Investment Tracker is now ready for production use! 🎉