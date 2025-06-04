/*
  # Add admin RLS policies for user management

  1. Changes
    - Add RLS policy for administrators to manage all users
    - This allows admins to perform CRUD operations on the users table

  2. Security
    - Only administrators can perform these operations
    - Maintains existing user self-management policies
    - Ensures data security while enabling admin functionality
*/

-- Add policy for administrators to manage all users
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