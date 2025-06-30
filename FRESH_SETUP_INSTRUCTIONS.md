# 🔄 Fresh Supabase Setup Instructions

## Step 1: Delete Current Supabase Project

1. **Go to your Supabase Dashboard**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Find your current project: `unfjkybyihxcxapaeiln`

2. **Delete the Project**
   - Click on your project
   - Go to Settings > General
   - Scroll down to "Danger Zone"
   - Click "Delete Project"
   - Type the project name to confirm deletion

## Step 2: Create New Supabase Project

1. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project name: `canadian-investment-tracker`
   - Set a strong database password (save this!)
   - Choose region: Canada Central (recommended)
   - Click "Create new project"

2. **Wait for Setup**
   - Project creation takes 1-2 minutes
   - Don't close the browser tab

## Step 3: Update Environment Variables

1. **Get New Credentials**
   - Once project is ready, go to Settings > API
   - Copy the new Project URL
   - Copy the new Anon/Public key

2. **Update .env File**
   ```env
   VITE_SUPABASE_URL=https://your-new-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-new-anon-key-here
   ```

## Step 4: Run Database Migrations

1. **Go to SQL Editor** in your new Supabase project

2. **Run the Main Migration**
   - Copy the contents of `supabase/migrations/20250629220235_graceful_boat.sql`
   - Paste into SQL Editor
   - Click "Run"
   - ✅ This creates all tables, indexes, and RLS policies

3. **Run Sample Data Migration (Optional)**
   - Copy the contents of `supabase/migrations/20250629222635_withered_grass.sql`
   - Paste into SQL Editor
   - Click "Run"
   - ✅ This adds sample data for testing

4. **Run Final Migration**
   - Copy the contents of `supabase/migrations/20250629225904_plain_forest.sql`
   - Paste into SQL Editor
   - Click "Run"
   - ✅ This adds the `is_primary` field

## Step 5: Test the Application

1. **Restart Development Server**
   ```bash
   npm run dev
   ```

2. **Test Core Features**
   - ✅ Sign up for a new account
   - ✅ Add investment accounts
   - ✅ Record transactions
   - ✅ Add spouse/partner (this should now work!)
   - ✅ Switch between user views

## Step 6: Verify Everything Works

- [ ] User registration and login
- [ ] Account creation and management
- [ ] Transaction recording
- [ ] Spouse/partner addition
- [ ] User switching in header
- [ ] Data persistence and loading

## Benefits of Fresh Setup

✅ **Clean Database**: No conflicting migrations or policies
✅ **Proper RLS**: Correctly configured row-level security
✅ **No Legacy Issues**: Fresh start without accumulated problems
✅ **Faster Setup**: Cleaner than debugging multiple migration conflicts
✅ **Production Ready**: Proper foundation for deployment

## If You Encounter Issues

1. **Check Environment Variables**: Ensure `.env` has correct new values
2. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
3. **Check Network Tab**: Look for 403 errors in browser dev tools
4. **Verify Migrations**: Ensure all three migrations ran successfully

This fresh setup should resolve all the RLS policy conflicts and give you a clean, working database.