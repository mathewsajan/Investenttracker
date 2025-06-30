# 🚀 Production Setup Instructions

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"** and sign up/sign in
3. **Create a new project:**
   - Choose a project name (e.g., "canadian-investment-tracker")
   - Set a database password (save this securely)
   - Choose a region (preferably Canada Central for Canadian users)
   - Click "Create new project"

## Step 2: Configure Authentication Settings

**CRITICAL: This step prevents authentication errors**

1. **Wait for project to initialize** (takes 1-2 minutes)
2. **Go to Authentication > Settings** in your Supabase dashboard
3. **Find "Enable email confirmations"** toggle
4. **Turn OFF email confirmations** for development
5. **Click "Save"**

This allows users to sign in immediately without email verification during development.

## Step 3: Set Up Database Schema

1. **Go to SQL Editor** in the left sidebar
2. **Run the migration files in order:**

   **First Migration (Database Schema):**
   - Copy the contents of `supabase/migrations/20250629220235_graceful_boat.sql`
   - Paste into SQL Editor and click "Run"
   - This creates all tables, indexes, and security policies

   **Second Migration (Sample Data - Optional):**
   - Copy the contents of `supabase/migrations/20250629220317_stark_sun.sql`
   - Paste into SQL Editor and click "Run"
   - This adds sample data for testing

## Step 4: Get API Credentials

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy the following values:**
   - Project URL (looks like: `https://abcdefgh.supabase.co`)
   - Anon/Public key (starts with `eyJ...`)

## Step 5: Configure Environment Variables

1. **Update the `.env` file** in your project root:
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

## Step 6: Test the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the features:**
   - ✅ Sign up for a new account (no email confirmation needed)
   - ✅ Sign in immediately after registration
   - ✅ Add investment accounts
   - ✅ Record transactions
   - ✅ View dashboard with real data

## Step 7: Deploy to Production

### Option A: Deploy to Netlify (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Complete production setup"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository
   - Set build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Add environment variables in Netlify:**
   - Go to Site settings > Environment variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Configure Authentication for Production:**
   - Go back to your Supabase project
   - Authentication > Settings
   - **Turn ON email confirmations** for production
   - Configure email templates and SMTP settings

### Option B: Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to any static hosting service

## 🎉 You're Live!

Your Canadian Investment Tracker is now fully functional with:
- ✅ Secure user authentication
- ✅ Real-time database storage
- ✅ Investment account management
- ✅ Transaction tracking
- ✅ Contribution planning
- ✅ Responsive design
- ✅ Production-ready security

## 🔧 Additional Configuration (Optional)

### Custom Domain
- Add your custom domain in Netlify settings
- Configure DNS records as instructed

### Email Templates
- Customize auth email templates in Supabase Auth settings
- Add your branding and custom messaging

### Analytics
- Add Google Analytics or other tracking
- Monitor user engagement and performance

## 🆘 Troubleshooting

### Common Issues:

1. **"Email not confirmed" error:**
   - Go to Authentication > Settings in Supabase dashboard
   - Ensure "Enable email confirmations" is turned OFF for development
   - For production, ensure email confirmation flow is properly configured
   - Clear browser cache and try signing up again

2. **"Missing Supabase environment variables" error:**
   - Check that `.env` file exists and has correct values
   - Restart development server after updating `.env`

3. **Authentication not working:**
   - Verify Supabase project URL and anon key
   - Check that email confirmation settings match your environment (dev vs prod)

4. **Database connection issues:**
   - Ensure migration files were run successfully
   - Check Supabase project status in dashboard

5. **Build/deployment failures:**
   - Verify all environment variables are set in deployment platform
   - Check build logs for specific error messages

## 📧 Email Confirmation Settings

### Development Environment:
- **Disable email confirmations** for faster testing
- Users can sign in immediately after registration

### Production Environment:
- **Enable email confirmations** for security
- Configure custom email templates
- Set up proper SMTP settings
- Test the complete email verification flow

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify Supabase dashboard for any service issues
3. Ensure all environment variables are correctly set
4. Review the setup steps to ensure nothing was missed
5. Check Authentication settings match your environment needs

Your application is now ready for production use! 🚀