/*
  # Update RLS policies for users table

  1. Changes
    - Remove existing RLS policies for users table
    - Add new policies that properly handle administrator access
    - Ensure administrators can manage all users
    - Regular users can only manage their own profile

  2. Security
    - Administrators (users with is_admin=true in auth table) have full access
    - Regular users can only access their own data
    - Public users can only create their initial profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Administrators can create user profiles" ON users;
DROP POLICY IF EXISTS "Administrators can create users" ON users;
DROP POLICY IF EXISTS "Administrators can manage all users" ON users;
DROP POLICY IF EXISTS "Administrators can view all user profiles" ON users;
DROP POLICY IF EXISTS "New users can insert their profile once" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create new policies
CREATE POLICY "Enable full access for administrators"
ON public.users
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.auth
    WHERE auth.email = auth.jwt()->>'email'
    AND auth.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.auth
    WHERE auth.email = auth.jwt()->>'email'
    AND auth.is_admin = true
  )
);

-- Allow users to manage their own profile
CREATE POLICY "Users can manage own profile"
ON public.users
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow new users to create their profile once
CREATE POLICY "New users can create their profile"
ON public.users
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);