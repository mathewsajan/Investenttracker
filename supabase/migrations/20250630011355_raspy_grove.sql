/*
  # Fix RLS policy for spouse user creation

  1. Policy Changes
    - Update the INSERT policy on users table to allow creating spouse users
    - Allow authenticated users to create records where is_primary = false
    - Maintain security by ensuring users can only create their own primary record or spouse records

  2. Security
    - Primary users can only be created by the authenticated user themselves
    - Spouse users (is_primary = false) can be created by any authenticated user
    - This enables the spouse creation workflow while maintaining data security
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own and spouse data" ON users;

-- Create a new, more permissive INSERT policy that allows spouse creation
CREATE POLICY "Users can insert own and spouse data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow users to create their own primary record
    (auth.uid()::text = id::text AND is_primary = true)
    OR
    -- Allow authenticated users to create spouse records (non-primary users)
    (auth.uid() IS NOT NULL AND is_primary = false)
  );