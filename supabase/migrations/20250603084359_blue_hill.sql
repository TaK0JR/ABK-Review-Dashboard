/*
  # Add admin user creation policy

  1. Changes
    - Add new RLS policy to allow administrators to create new user profiles
    
  2. Security
    - Adds policy for administrators to insert new users
    - Maintains existing RLS policies
    - Only administrators can create new user profiles
*/

CREATE POLICY "Administrators can create user profiles"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM auth
    WHERE auth.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND auth.is_admin = true
  )
);