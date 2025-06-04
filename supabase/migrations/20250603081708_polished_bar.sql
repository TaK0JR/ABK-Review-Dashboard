/*
  # Add admin policies for user management
  
  1. Changes
    - Add policy for administrators to create new users
    - Add policy for administrators to view all users
  
  2. Security
    - Policies check if the authenticated user is an admin
    - Uses WITH CHECK for INSERT policy as required
*/

-- Add policy for admin user creation
CREATE POLICY "Administrators can create user profiles"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth
    WHERE auth.email = auth.jwt()->>'email'
    AND auth.is_admin = true
  )
);

-- Add policy for admin to view all users
CREATE POLICY "Administrators can view all user profiles"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth
    WHERE auth.email = auth.jwt()->>'email'
    AND auth.is_admin = true
  )
);