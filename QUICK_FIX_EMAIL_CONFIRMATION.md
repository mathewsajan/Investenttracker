# 🚨 QUICK FIX: Email Confirmation Error

## Problem
You're seeing this error: `"Email not confirmed"` when trying to sign in.

## Solution (Takes 2 minutes)

### Step 1: Go to Your Supabase Dashboard
1. Open [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project

### Step 2: Disable Email Confirmations
1. Click **"Authentication"** in the left sidebar
2. Click **"Settings"** 
3. Find **"Enable email confirmations"** toggle
4. **Turn it OFF** (disable it)
5. Click **"Save"**

### Step 3: Test Your App
1. Go back to your app
2. Try signing up with a new email
3. You should now be able to sign in immediately

## Why This Happens
- Supabase enables email confirmations by default
- In development, this creates friction
- Users can't sign in until they click a confirmation email
- Disabling this allows immediate sign-in after registration

## For Production Later
When you deploy to production:
1. **Re-enable email confirmations** for security
2. Configure proper email templates
3. Set up SMTP settings for reliable email delivery

## Still Having Issues?
1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Try signing up with a completely new email address
3. Check the browser console for any other errors

This fix resolves the authentication issue immediately! ✅