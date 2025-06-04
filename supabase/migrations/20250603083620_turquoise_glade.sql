/*
  # Add Admin RLS Policies

  1. Changes
    - Add RLS policies for admin users to manage other users
    - Fix user creation policy to allow admins to create users
    - Update existing policies to handle admin access

  2. Security
    - Enable RLS on users table
    - Add policies for admin operations
    - Maintain existing user policies
*/

-- Add admin policies for the users table
CREATE POLICY "Administrators can manage all users"
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

-- Update the existing user creation policy to include admin users
CREATE POLICY "Administrators can create users"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auth
      WHERE auth.email = auth.jwt()->>'email'
      AND auth.is_admin = true
    )
  );