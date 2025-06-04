/*
  # Update RLS policies for users table

  1. Changes
    - Add new RLS policy to allow administrators to create user profiles
    - Modify existing policies to ensure proper access control

  2. Security
    - Maintains RLS enabled on users table
    - Adds policy for administrators to create user profiles
    - Ensures administrators can manage all users
    - Preserves existing user self-management policies
*/

-- First, drop existing policies that might conflict
DROP POLICY IF EXISTS "Administrators can create user profiles" ON public.users;
DROP POLICY IF EXISTS "Administrators can manage all users" ON public.users;
DROP POLICY IF EXISTS "Enable full access for administrators" ON public.users;
DROP POLICY IF EXISTS "New users can create their profile" ON public.users;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;

-- Create comprehensive policies for user management
CREATE POLICY "Administrators can manage all users"
ON public.users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.auth
    WHERE auth.email = auth.jwt()->>'email'
    AND auth.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.auth
    WHERE auth.email = auth.jwt()->>'email'
    AND auth.is_admin = true
  )
);

CREATE POLICY "Users can manage own profile"
ON public.users
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "New users can create their profile"
ON public.users
FOR INSERT
TO public
WITH CHECK (auth.uid() = id);